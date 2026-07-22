# Migrating from Emotion to StyleX

This codemod mechanically migrates the common, provably-safe parts of an
Emotion (object-syntax) codebase to [StyleX](https://stylexjs.com), and leaves
a precise `// TODO(stylex-migration): …` marker on everything it can't convert
safely — so you can do the bulk automatically and work down a clear list of the
rest.

Its guiding rule: **only convert what it can prove renders identically.**
Anything else is flagged in place or, for a genuinely file-level problem,
refused with a stated reason. It never produces confident-but-wrong output.

## Quick start

```sh
# 1. DRY RUN (the default) — preview a convert / refuse / TODO report; writes nothing:
stylex-codemod emotion "src/**/*.{jsx,tsx}"

# 2. Read the report. Then apply:
stylex-codemod emotion "src/**/*.{jsx,tsx}" --write

# 3. Search for the markers it left and finish those by hand:
grep -rn "TODO(stylex-migration)" src
```

The report classifies every file:

- **convert** — rewritten to StyleX (a `+N TODO` suffix means N sites in that
  file were left flagged for you).
- **refuse** — a whole-file structural issue (with the reason); left untouched.
- **skip** — no Emotion, or nothing to do.

## What it converts

- The `css` prop as an object: `<div css={{ … }} />` and
  `<div css={css({ … })} />`, on host (lowercase) elements.
- Self-targeting conditions: pseudo-classes (`:hover`, `:focus`),
  pseudo-elements (`::before`), media queries, and their nesting.
- Multi-value `margin`/`padding` shorthands (`'8px 16px'`), expanded to
  StyleX's canonical longhands.
- Object-form `keyframes({ … })` → `stylex.keyframes({ … })`, referenced via
  `animationName`.
- Fallback arrays (`position: ['sticky', 'fixed']`).
- Merges into a file's pre-existing `stylex.create` without touching your
  existing entries.

Two conversions are **sanctioned, intentional changes** (they render
identically in left-to-right, and are the correct StyleX idiom):

- **Physical → logical properties**: `marginLeft` → `marginInlineStart`, etc.
  This makes the result right-to-left correct. Opt out with
  `logicalProperties: false`.
- **Hover-guard**: `:hover` is wrapped in `@media (hover: hover)` so hover
  styles don't stick on touch devices. Opt out with `hoverGuard: false`.

## What it flags (leaves in place with a TODO)

These are left exactly as they were, with a marker, because converting them
safely needs a human:

- template-literal styles (`` css`…` ``)
- dynamic / props-driven values (`css={{ color: props.color }}`)
- selectors that reach outside the element (`& > li`, descendant/child)
- `!important`
- cascades where Emotion's source order and StyleX's priority disagree
- theme tokens (`theme.colors.primary`) — see *Design tokens* below

## What it refuses (whole file)

- a file importing StyleX in a non-namespace form (`import { create } …`) —
  it can only merge into `import * as stylex`
- a file with two or more `stylex.create` registries
- an unconvertible `keyframes` (e.g. a tagged template)

## Config

Optional `stylex-codemod.config.js` (or `--config <path>`):

```js
module.exports = {
  hoverGuard: true, // wrap :hover in @media (hover: hover) — default true
  logicalProperties: true, // map marginLeft -> marginInlineStart, etc. — default true
};
```

## Design tokens

Theme tokens (`theme.colors.primary`) are **flagged, not converted**, in this
version. A token's value lives in your theme, outside the file the codemod is
reading, so the codemod can't know it — and, unlike everything else, a token
conversion can't be proven correct by comparing before/after CSS (the value is
external). Automatic token → `stylex.defineVars` conversion is planned as a
later, config-driven feature paired with a rendered-output check. For now:
define your StyleX variables first, then wire up the flagged references. (This
mirrors how the styled-components → StyleX migration at Linear was done.)

## Known limitations

- **TypeScript is best-effort.** `.ts`/`.tsx` files convert for the common
  cases, but files using TypeScript-specific syntax the Flow-based lint gate
  can't parse (enums, `satisfies`, non-null `!`, etc.) are safely skipped rather
  than converted. JavaScript, JSX, and Flow are the fully-verified path.
- **`styled(Component)`**, `@emotion/styled`, `<Global>`, `injectGlobal`,
  `cx`/composition, and `shouldForwardProp` are out of scope for this version
  (files using them are flagged or refused, never converted incorrectly).
- **Cross-file** styles (a `css`/`keyframes` value imported from another file)
  are flagged, not followed.
- **Per-site keyframe flagging**: an unconvertible `keyframes` currently refuses
  the whole file rather than flagging just that declaration.

## How to think about a run

1. Dry-run and skim the report — the ratio of convert/flag/refuse tells you how
   mechanical your migration is.
2. `--write`, commit the mechanical diff on its own.
3. Work down the `TODO(stylex-migration)` markers; each is a specific,
   self-contained thing to convert by hand.
4. Remove the Emotion dependency once the markers are gone.
