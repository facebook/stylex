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
    parseStylexRule(ltr, out);
  }
  return out;
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

export const DEFAULT_ALLOWLIST: $ReadOnlyArray<AllowlistRule> = [
  allowPhysicalToLogical,
  allowHoverGuard,
];

// --- the gate -----------------------------------------------------------

export function semanticDiffGate(
  before: NetCss,
  after: NetCss,
  options?: { +allowlist?: $ReadOnlyArray<AllowlistRule> },
): SemanticDiffResult {
  const allowlist = options?.allowlist ?? DEFAULT_ALLOWLIST;
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
