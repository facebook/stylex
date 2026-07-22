/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * L7 — Emit. Turns the FileIR into the data for a single per-file
 * `stylex.create` registry plus the binding map (the second seam
 * hand-off: rule #N becomes `styles.<key>`).
 *
 * Deliberately AST-free: emit produces plain data; the adapter (which owns
 * the file's AST) renders it. This keeps `core/` blind to parser nodes.
 *
 * "The flip" materializes here: atoms (property × condition-stack × value)
 * are grouped BY PROPERTY with conditions nested inside — StyleX's required
 * property-grouped shape, the inverse of Emotion's selector-grouped input.
 *
 * Naming (M1 minimal policy, superseded wholesale in M4): the adapter's
 * nameHint (label > enclosing component) is sanitized to a camelCase
 * identifier; collisions get a numeric suffix starting at 2.
 */

import type { Atom, Condition, FileIR, StyleRule, Value } from './ir';
import { conditionKey } from './ir';

/**
 * A value in a `stylex.create` entry: a static value, a fallback array
 * (StyleX's `firstThatWorks`), an identifier reference (rendered as a bare
 * identifier, e.g. `animationName: spin`), or a nested condition object.
 */
export type EmittedValue =
  | string
  | number
  | null
  | $ReadOnlyArray<string | number>
  | EmittedRef
  | EmittedConditions;
/** Sentinel for a bare-identifier reference; `$$ref` is the identifier. */
export type EmittedRef = { +$$ref: string };
export type EmittedConditions = { +[condition: string]: EmittedValue };

/** A `stylex.create` entry as plain data: property -> value. */
export type EmittedStyle = { +[property: string]: EmittedValue };

export type EmittedRule = {
  +key: string,
  +style: EmittedStyle,
};

/** An emitted `stylex.keyframes` declaration: a variable name and its frames. */
export type EmittedKeyframes = {
  +name: string,
  +frames: $ReadOnlyArray<{ +selector: string, +style: EmittedStyle }>,
};

export type EmitResult = {
  +rules: $ReadOnlyArray<EmittedRule>,
  +keyframes: $ReadOnlyArray<EmittedKeyframes>,
  /** bindings[i] is the create key for FileIR.rules[i]. */
  +bindings: $ReadOnlyArray<string>,
};

export type EmitOptions = {
  /** Wrap `:hover` in `@media (hover: hover)` (default true). */
  +hoverGuard?: boolean,
  /** Style-name keys already taken (e.g. a pre-existing registry we merge
   * into); emitted keys avoid collisions with these. */
  +reservedKeys?: $ReadOnlySet<string>,
};

export class EmitError extends Error {
  constructor(message: string) {
    super(`[stylex-codemod emit] ${message}`);
    this.name = 'EmitError';
  }
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED = new Set(['default', 'delete', 'do', 'in', 'new', 'var']);
const HOVER_GUARD = '@media (hover: hover)';

/** Sanitizes an adapter name hint into a usable create key. */
export function sanitizeKey(hint: string): string {
  const cleaned = hint
    .replace(/[^A-Za-z0-9_$]+(.)?/g, (_, next: string | void) =>
      next == null ? '' : next.toUpperCase(),
    )
    .replace(/^[0-9]+/, '');
  const key =
    cleaned === '' ? 'styles' : cleaned[0].toLowerCase() + cleaned.slice(1);
  return IDENTIFIER.test(key) && !RESERVED.has(key) ? key : 'styles';
}

function leafValue(value: Value): EmittedValue {
  switch (value.kind) {
    case 'first-that-works':
      return value.values;
    case 'reference':
      return { $$ref: value.name };
    case 'static':
    default:
      return value.value;
  }
}

/**
 * Canonical outer→inner nesting order for a condition stack: at-rules
 * outermost, then pseudo-classes, then pseudo-elements innermost; alpha
 * within a kind. StyleX sums priorities regardless of nesting order, so a
 * canonical order is safe and makes the tree merge deterministically.
 * Applies the hover-guard: any stack containing `:hover` gains an outer
 * `@media (hover: hover)`.
 */
function canonicalPath(
  conditions: $ReadOnlyArray<Condition>,
  hoverGuard: boolean,
): Array<string> {
  const atRules = conditions
    .filter((c) => c.kind === 'at-rule')
    .map(conditionKey);
  const pseudoClasses = conditions
    .filter((c) => c.kind === 'pseudo-class')
    .map(conditionKey);
  const pseudoElements = conditions
    .filter((c) => c.kind === 'pseudo-element')
    .map(conditionKey);
  if (hoverGuard && pseudoClasses.includes(':hover')) {
    atRules.push(HOVER_GUARD);
  }
  return [...atRules.sort(), ...pseudoClasses.sort(), ...pseudoElements.sort()];
}

type MutableTree = { [key: string]: EmittedValue };

function insertAtPath(
  node: MutableTree,
  path: $ReadOnlyArray<string>,
  value: EmittedValue,
  rule: StyleRule,
): void {
  if (path.length === 0) {
    if (node.default !== undefined) {
      throw new EmitError(`rule '${rule.name}': duplicate base declaration`);
    }
    node.default = value;
    return;
  }
  const [head, ...rest] = path;
  if (rest.length === 0) {
    const existing = node[head];
    if (
      existing != null &&
      typeof existing === 'object' &&
      !Array.isArray(existing)
    ) {
      // A deeper path already created an object here; place value at default.
      insertAtPath(existing as $FlowFixMe, [], value, rule);
    } else if (existing !== undefined) {
      throw new EmitError(`rule '${rule.name}': duplicate condition '${head}'`);
    } else {
      node[head] = value;
    }
    return;
  }
  let child = node[head];
  if (child == null || typeof child !== 'object' || Array.isArray(child)) {
    const nested: MutableTree = {};
    if (child !== undefined) {
      nested.default = child; // promote a previously-plain value
    }
    node[head] = nested;
    child = nested;
  }
  insertAtPath(child as $FlowFixMe, rest, value, rule);
}

/** Ensures every condition object has a `default` and its keys are ordered
 * (`default` first, then alphabetical) so the output passes stylex/sort-keys
 * with zero autofixes. */
function normalizeTree(value: EmittedValue): EmittedValue {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  const node = value as EmittedConditions;
  const ordered: MutableTree = {};
  ordered.default =
    node.default === undefined ? null : normalizeTree(node.default);
  for (const key of Object.keys(node)
    .filter((k) => k !== 'default')
    .sort()) {
    ordered[key] = normalizeTree(node[key]);
  }
  return ordered;
}

function emitProperty(
  atoms: $ReadOnlyArray<Atom>,
  rule: StyleRule,
  hoverGuard: boolean,
): EmittedValue {
  // Flat fast-path: a single unconditional atom stays a plain value.
  if (atoms.length === 1 && atoms[0].conditions.length === 0) {
    return leafValue(atoms[0].value);
  }
  const root: MutableTree = {};
  for (const atom of atoms) {
    insertAtPath(
      root,
      canonicalPath(atom.conditions, hoverGuard),
      leafValue(atom.value),
      rule,
    );
  }
  return normalizeTree(root);
}

/** Groups a rule's atoms by property (the flip) into one emitted style
 * object, alphabetically ordered for stylex/sort-keys. */
function emitStyleObject(rule: StyleRule, hoverGuard: boolean): EmittedStyle {
  const byProperty: Map<string, Array<Atom>> = new Map();
  for (const atom of rule.atoms) {
    const list = byProperty.get(atom.property) ?? [];
    list.push(atom);
    byProperty.set(atom.property, list);
  }
  const style: { [string]: EmittedValue } = {};
  for (const property of [...byProperty.keys()].sort()) {
    style[property] = emitProperty(
      byProperty.get(property) ?? [],
      rule,
      hoverGuard,
    );
  }
  return style;
}

export function emitFileIR(ir: FileIR, options?: EmitOptions): EmitResult {
  const hoverGuard = options?.hoverGuard ?? true;
  const usedKeys = new Set<string>(options?.reservedKeys ?? []);
  const rules: Array<EmittedRule> = [];
  const bindings: Array<string> = [];

  for (const rule of ir.rules) {
    const style = emitStyleObject(rule, hoverGuard);
    const base = sanitizeKey(rule.name);
    let key = base;
    for (let n = 2; usedKeys.has(key); n++) {
      key = `${base}${n}`;
    }
    usedKeys.add(key);
    rules.push({ key, style });
    bindings.push(key);
  }

  const keyframes: Array<EmittedKeyframes> = ir.keyframes.map((kf) => ({
    name: kf.name,
    frames: kf.frames.map((frame) => ({
      selector: frame.selector,
      // A frame is a flat style object; reuse the same grouping machinery.
      style: emitStyleObject({ name: kf.name, atoms: frame.atoms }, hoverGuard),
    })),
  }));

  return { rules, keyframes, bindings };
}
