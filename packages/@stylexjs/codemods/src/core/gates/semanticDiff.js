/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Semantic-diff gate: the net CSS before and after a conversion must be
 * identical across every condition combination, minus an explicit allowlist
 * of sanctioned changes (hover-guard, physical->logical). This is the check
 * that catches "compiles fine but renders differently".
 *
 * Ground truths:
 *  - before: Emotion's own serializer (`@emotion/serialize`) output,
 *    parsed by `netCssFromSerializedCss`.
 *  - after: the real `@stylexjs/babel-plugin` metadata (injectable rules),
 *    parsed by `netCssFromStylexMetadata`.
 *
 * Both parsers BAIL LOUDLY (throw `UnsupportedCssError`) on any construct
 * they cannot provably represent — an unparsable input must never diff
 * clean by accident.
 */

/** One declaration of net CSS: a property+conditions coordinate => value. */
export type NetDeclaration = {
  +property: string, // kebab-case
  +conditions: $ReadOnlyArray<string>, // normalized, sorted
  +value: string,
};

export type NetCss = { +[coordinate: string]: NetDeclaration };

export type DiffEntry = {
  +coordinate: string,
  +property: string,
  +conditions: $ReadOnlyArray<string>,
  +beforeValue: string | null,
  +afterValue: string | null,
};

export type AllowlistRule = (
  entry: DiffEntry,
  before: NetCss,
  after: NetCss,
) => boolean;

export type SemanticDiffResult =
  | { +ok: true, +allowed: $ReadOnlyArray<DiffEntry> }
  | {
      +ok: false,
      +diffs: $ReadOnlyArray<DiffEntry>,
      +allowed: $ReadOnlyArray<DiffEntry>,
    };

export class UnsupportedCssError extends Error {
  constructor(message: string) {
    super(`[stylex-codemod semantic-diff] unsupported CSS: ${message}`);
    this.name = 'UnsupportedCssError';
  }
}

// --- normalization helpers ---------------------------------------------

function normalizeAtRule(rule: string): string {
  return rule
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([():,])\s*/g, '$1')
    .trim();
}

function normalizeValue(value: string): string {
  // Comma-whitespace is canonicalized because CSS treats
  // `rgb(10, 20, 30)` and `rgb(10,20,30)` as the same value — and the
  // StyleX compiler normalizes to the latter.
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',');
}

function normalizeCondition(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('&')) {
    s = s.slice(1).trim();
  }
  if (s.startsWith('@')) {
    return normalizeAtRule(s);
  }
  if (/^::?[\w-]+(\([^()]*\))?$/.test(s)) {
    return s.toLowerCase();
  }
  throw new UnsupportedCssError(
    `selector context '${raw}' is not a self-targeting pseudo or at-rule`,
  );
}

function coordinate(
  property: string,
  conditions: $ReadOnlyArray<string>,
): string {
  return conditions.length === 0
    ? property
    : `${property} @ ${conditions.join(' && ')}`;
}

// --- box-shorthand canonicalization ------------------------------------

// Emotion writes `margin: 8px 16px` (one shorthand declaration); the codemod
// emits StyleX's expanded logical form (`margin-block` / `margin-inline`).
// Compared property-by-property these look different even though they render
// identically. So before diffing we expand BOTH sides' box shorthands down
// to the four physical per-side longhands, resolving logical → physical in
// LTR (the semantic-diff checks LTR-equivalence; the allowlist owns the
// sanctioned RTL difference). margin/padding only in this slice — inset and
// border keep the allowlist path.

const BOX_FAMILIES: $ReadOnlyArray<string> = ['margin', 'padding'];

/** Splits a space-separated value list, keeping parenthesized groups
 * (`calc(…)`, `var(…)`) intact. */
function splitValueList(value: string): Array<string> {
  const parts: Array<string> = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '(') {
      depth += 1;
    } else if (ch === ')') {
      depth -= 1;
    }
    if (ch === ' ' && depth === 0) {
      if (current !== '') {
        parts.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current !== '') {
    parts.push(current);
  }
  return parts;
}

/** [top, right, bottom, left] from a 1–4 value box shorthand, or null. */
function fourSides(
  values: Array<string>,
): [string, string, string, string] | null {
  switch (values.length) {
    case 1:
      return [values[0], values[0], values[0], values[0]];
    case 2:
      return [values[0], values[1], values[0], values[1]];
    case 3:
      return [values[0], values[1], values[2], values[1]];
    case 4:
      return [values[0], values[1], values[2], values[3]];
    default:
      return null;
  }
}

/** Expands a (property, value) into one or more physical-longhand pairs.
 * Non-box properties pass through unchanged. */
function expandToPhysical(
  property: string,
  value: string,
): Array<[string, string]> {
  for (const fam of BOX_FAMILIES) {
    if (property === fam) {
      const sides = fourSides(splitValueList(value));
      return sides == null
        ? [[property, value]]
        : [
            [`${fam}-top`, sides[0]],
            [`${fam}-right`, sides[1]],
            [`${fam}-bottom`, sides[2]],
            [`${fam}-left`, sides[3]],
          ];
    }
    if (property === `${fam}-inline` || property === `${fam}-block`) {
      const vals = splitValueList(value);
      const start = vals[0];
      const end = vals.length > 1 ? vals[1] : vals[0];
      return property === `${fam}-block`
        ? [
            [`${fam}-top`, start],
            [`${fam}-bottom`, end],
          ]
        : [
            [`${fam}-left`, start],
            [`${fam}-right`, end],
          ];
    }
    switch (property) {
      case `${fam}-inline-start`:
        return [[`${fam}-left`, value]];
      case `${fam}-inline-end`:
        return [[`${fam}-right`, value]];
      case `${fam}-block-start`:
        return [[`${fam}-top`, value]];
      case `${fam}-block-end`:
        return [[`${fam}-bottom`, value]];
      default:
        break;
    }
  }
  return [[property, value]];
}

/** Rewrites every box shorthand/logical property in a NetCss into physical
 * per-side longhands so both sides of a diff share one vocabulary. */
function canonicalizeNetCss(net: NetCss): NetCss {
  const out: { [string]: NetDeclaration } = {};
  for (const coord of Object.keys(net)) {
    const decl = net[coord];
    for (const [prop, val] of expandToPhysical(decl.property, decl.value)) {
      out[coordinate(prop, decl.conditions)] = {
        property: prop,
        conditions: decl.conditions,
        value: normalizeValue(val),
      };
    }
  }
  return out;
}

function addDeclaration(
  target: { [string]: NetDeclaration },
  property: string,
  rawConditions: $ReadOnlyArray<string>,
  value: string,
): void {
  const conditions = rawConditions.map(normalizeCondition).slice().sort();
  const prop = property.trim().toLowerCase();
  if (!/^--|^[a-z-]+$/.test(prop)) {
    throw new UnsupportedCssError(`property '${property}'`);
  }
  target[coordinate(prop, conditions)] = {
    property: prop,
    conditions,
    value: normalizeValue(value),
  };
}

// --- before: Emotion serialized CSS ------------------------------------

/**
 * Parses the `styles` string produced by `@emotion/serialize` (flat
 * declarations plus one-or-more levels of `pseudo { ... }` / `@media { ... }`
 * nesting) into net CSS. Throws on any selector that is not self-targeting.
 */
export function netCssFromSerializedCss(css: string): NetCss {
  const out: { [string]: NetDeclaration } = {};
  const contexts: Array<string> = [];
  let buffer = '';

  const flushDeclaration = (chunk: string) => {
    const decl = chunk.trim();
    if (decl === '') {
      return;
    }
    const colon = decl.indexOf(':');
    if (colon <= 0) {
      throw new UnsupportedCssError(`declaration '${decl}'`);
    }
    addDeclaration(out, decl.slice(0, colon), contexts, decl.slice(colon + 1));
  };

  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    if (char === '{') {
      const selector = buffer.trim();
      if (selector === '') {
        throw new UnsupportedCssError('block with empty selector');
      }
      if (selector.includes(',')) {
        throw new UnsupportedCssError(`selector list '${selector}'`);
      }
      contexts.push(selector);
      buffer = '';
    } else if (char === '}') {
      flushDeclaration(buffer);
      buffer = '';
      if (contexts.length === 0) {
        throw new UnsupportedCssError('unbalanced closing brace');
      }
      contexts.pop();
    } else if (char === ';') {
      flushDeclaration(buffer);
      buffer = '';
    } else {
      buffer += char;
    }
  }
  if (contexts.length !== 0) {
    throw new UnsupportedCssError('unbalanced opening brace');
  }
  flushDeclaration(buffer);
  return out;
}

// --- after: StyleX babel-plugin metadata --------------------------------

/**
 * Parses `metadata.stylex` from a `compileGate` run — entries of
 * `[className, { ltr, rtl }, priority]` — into net CSS. Rules are applied
 * in ascending priority order, mirroring how StyleX resolves collisions.
 */
export function netCssFromStylexMetadata(metadata: mixed): NetCss {
  const rules =
    metadata != null &&
    typeof metadata === 'object' &&
    Array.isArray(metadata.stylex)
      ? metadata.stylex
      : Array.isArray(metadata)
        ? metadata
        : null;
  if (rules == null) {
    throw new UnsupportedCssError(
      'expected StyleX babel-plugin metadata ({ stylex: [...] })',
    );
  }
  const entries = rules
    .map((rule: mixed): { ltr: string, priority: number } => {
      if (Array.isArray(rule)) {
        const styles = rule[1];
        const priority = rule[2];
        if (
          styles != null &&
          typeof styles === 'object' &&
          typeof styles.ltr === 'string' &&
          typeof priority === 'number'
        ) {
          return { ltr: styles.ltr, priority };
        }
      }
      throw new UnsupportedCssError(
        `metadata rule ${JSON.stringify(rule) ?? 'undefined'}`,
      );
    })
    .sort((a, b) => a.priority - b.priority);

  const out: { [string]: NetDeclaration } = {};
  for (const { ltr } of entries) {
    // @keyframes rules are compared separately (frame contents), not as
    // per-property net CSS.
    if (ltr.trim().startsWith('@keyframes')) {
      continue;
    }
    parseStylexRule(ltr, out);
  }
  return out;
}

export type FrameMap = { +[selector: string]: { +[property: string]: string } };

/** Extracts `@keyframes NAME{ from{...} to{...} }` rules from StyleX
 * metadata as normalized frame maps (name-agnostic). */
export function keyframesFromStylexMetadata(
  metadata: mixed,
): $ReadOnlyArray<FrameMap> {
  const rules =
    metadata != null &&
    typeof metadata === 'object' &&
    Array.isArray(metadata.stylex)
      ? metadata.stylex
      : Array.isArray(metadata)
        ? metadata
        : [];
  const out: Array<FrameMap> = [];
  for (const rule of rules) {
    let ltr = null;
    if (Array.isArray(rule)) {
      const styles = rule[1];
      if (
        styles != null &&
        typeof styles === 'object' &&
        typeof styles.ltr === 'string'
      ) {
        ltr = styles.ltr;
      }
    }
    if (ltr == null || !ltr.trim().startsWith('@keyframes')) {
      continue;
    }
    const brace = ltr.indexOf('{');
    const inner = ltr.slice(brace + 1, ltr.lastIndexOf('}'));
    out.push(parseFrames(inner));
  }
  return out;
}

/** Parses `from{...}to{...}0%{...}` frame text into a normalized frame map. */
export function parseFrames(css: string): FrameMap {
  const frames: { [string]: { [string]: string } } = {};
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of css.trim().matchAll(blockRe)) {
    const rawSelector = match[1];
    const body = match[2];
    if (rawSelector == null || body == null) {
      continue;
    }
    const selector = rawSelector.trim().toLowerCase();
    const decls: { [string]: string } = {};
    for (const chunk of body.split(';')) {
      const decl = chunk.trim();
      if (decl === '') {
        continue;
      }
      const colon = decl.indexOf(':');
      if (colon <= 0) {
        throw new UnsupportedCssError(`keyframe declaration '${decl}'`);
      }
      decls[decl.slice(0, colon).trim().toLowerCase()] = normalizeValue(
        decl.slice(colon + 1),
      );
    }
    frames[selector] = decls;
  }
  if (Object.keys(frames).length === 0) {
    throw new UnsupportedCssError(`no keyframe blocks in '${css}'`);
  }
  return frames;
}

function parseStylexRule(ltr: string, out: { [string]: NetDeclaration }): void {
  let rest = ltr.trim();
  const atRules: Array<string> = [];
  while (rest.startsWith('@')) {
    const brace = rest.indexOf('{');
    if (brace < 0 || !rest.endsWith('}')) {
      throw new UnsupportedCssError(`at-rule '${ltr}'`);
    }
    atRules.push(rest.slice(0, brace));
    rest = rest.slice(brace + 1, -1).trim();
  }
  const match =
    /^((?:\.[\w-]+)+)((?:::?[\w-]+(?:\([^()]*\))?)*)\{([^{}]*)\}$/.exec(rest);
  if (match == null) {
    throw new UnsupportedCssError(`rule '${ltr}'`);
  }
  const pseudoChain = match[2];
  const pseudos =
    pseudoChain === ''
      ? []
      : (pseudoChain.match(/::?[\w-]+(\([^()]*\))?/g) ?? []);
  const conditions = [...atRules, ...pseudos];
  for (const chunk of match[3].split(';')) {
    const decl = chunk.trim();
    if (decl === '') {
      continue;
    }
    const colon = decl.indexOf(':');
    if (colon <= 0) {
      throw new UnsupportedCssError(`declaration '${decl}' in '${ltr}'`);
    }
    addDeclaration(
      out,
      decl.slice(0, colon),
      conditions,
      decl.slice(colon + 1),
    );
  }
}

// --- the allowlist (sanctioned, intentional diffs) ----------------------

const HOVER_GUARD = normalizeAtRule('@media (hover: hover)');

const PHYSICAL_TO_LOGICAL: { +[string]: string } = {
  'margin-left': 'margin-inline-start',
  'margin-right': 'margin-inline-end',
  'padding-left': 'padding-inline-start',
  'padding-right': 'padding-inline-end',
  'border-left': 'border-inline-start',
  'border-right': 'border-inline-end',
  left: 'inset-inline-start',
  right: 'inset-inline-end',
};

const LOGICAL_TO_PHYSICAL: { [string]: string } = {};
for (const physical of Object.keys(PHYSICAL_TO_LOGICAL)) {
  LOGICAL_TO_PHYSICAL[PHYSICAL_TO_LOGICAL[physical]] = physical;
}

/**
 * Sanctioned: a physical property on the before side replaced by its
 * logical twin (same conditions, same value) on the after side.
 */
export const allowPhysicalToLogical: AllowlistRule = (entry, before, after) => {
  if (entry.beforeValue != null && entry.afterValue == null) {
    const logical = PHYSICAL_TO_LOGICAL[entry.property];
    return (
      logical != null &&
      after[coordinate(logical, entry.conditions)]?.value === entry.beforeValue
    );
  }
  if (entry.afterValue != null && entry.beforeValue == null) {
    const physical = LOGICAL_TO_PHYSICAL[entry.property];
    return (
      physical != null &&
      before[coordinate(physical, entry.conditions)]?.value === entry.afterValue
    );
  }
  return false;
};

/**
 * Sanctioned: a `:hover` declaration additionally wrapped in
 * `@media (hover: hover)` on the after side (the hover-guard, on by
 * default in the codemod).
 */
export const allowHoverGuard: AllowlistRule = (entry, before, after) => {
  const hasHover = entry.conditions.some((c) => c.startsWith(':hover'));
  if (!hasHover) {
    return false;
  }
  if (entry.beforeValue != null && entry.afterValue == null) {
    const guarded = [...entry.conditions, HOVER_GUARD].sort();
    return (
      after[coordinate(entry.property, guarded)]?.value === entry.beforeValue
    );
  }
  if (
    entry.afterValue != null &&
    entry.beforeValue == null &&
    entry.conditions.includes(HOVER_GUARD)
  ) {
    const unguarded = entry.conditions.filter((c) => c !== HOVER_GUARD);
    return (
      before[coordinate(entry.property, unguarded)]?.value === entry.afterValue
    );
  }
  return false;
};

/**
 * Sanctioned: `animation-name` present only on the after side. Emotion and
 * StyleX generate different opaque keyframes names, so the codemod omits the
 * reference from the Emotion "before" and the frame CONTENTS are verified
 * separately (see `keyframesFromStylexMetadata`). This only ever fires for a
 * converted keyframes reference — a literal animationName string stays in the
 * before and is diffed normally.
 */
export const allowGeneratedAnimationName: AllowlistRule = (entry) =>
  entry.property === 'animation-name' &&
  entry.beforeValue == null &&
  entry.afterValue != null;

export const DEFAULT_ALLOWLIST: $ReadOnlyArray<AllowlistRule> = [
  allowPhysicalToLogical,
  allowHoverGuard,
  allowGeneratedAnimationName,
];

// --- the gate -----------------------------------------------------------

export function semanticDiffGate(
  beforeRaw: NetCss,
  afterRaw: NetCss,
  options?: { +allowlist?: $ReadOnlyArray<AllowlistRule> },
): SemanticDiffResult {
  const allowlist = options?.allowlist ?? DEFAULT_ALLOWLIST;
  // Expand box shorthands on both sides so a shorthand and its expanded
  // longhands compare equal.
  const before = canonicalizeNetCss(beforeRaw);
  const after = canonicalizeNetCss(afterRaw);
  const coordinates = new Set([...Object.keys(before), ...Object.keys(after)]);
  const diffs: Array<DiffEntry> = [];
  const allowed: Array<DiffEntry> = [];
  for (const coord of coordinates) {
    const b = before[coord];
    const a = after[coord];
    if (b != null && a != null && b.value === a.value) {
      continue;
    }
    const entry: DiffEntry = {
      coordinate: coord,
      property: (b ?? a)?.property ?? coord,
      conditions: (b ?? a)?.conditions ?? [],
      beforeValue: b?.value ?? null,
      afterValue: a?.value ?? null,
    };
    if (allowlist.some((rule) => rule(entry, before, after))) {
      allowed.push(entry);
    } else {
      diffs.push(entry);
    }
  }
  return diffs.length === 0
    ? { ok: true, allowed }
    : { ok: false, diffs, allowed };
}
