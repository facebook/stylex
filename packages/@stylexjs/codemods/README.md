# @stylexjs/codemods

Codemods for migrating styling libraries to [StyleX](https://stylexjs.com) —
Emotion first, built as **one library-agnostic engine with swappable
per-library adapters**.

> **Status: v1.0 (MVP) feature-complete, pre-publish.** The Emotion adapter
> converts object-syntax styles, self-targeting conditions, physical→logical
> properties, multi-value shorthands, and object-form keyframes; merges into
> partially-migrated files; flags what it can't safely convert with `// TODO`
> markers; and ships as a CLI with a dry-run report. Correctness is enforced by
> three gates (compile, lint, semantic-diff) plus a robustness corpus. Nothing
> here is published yet, and the package name/location is pending maintainer
> confirmation.

See the [**Migrating from Emotion to StyleX** guide](./docs/migrating-from-emotion.md)
for usage, what converts/flags/refuses, and known limitations.

## Principles

- **Bail loudly.** Only provably-safe styles are converted. Anything else is
  flagged with a `// TODO(stylex-migration): …` comment, and a file is
  refused outright when a partial conversion could change rendering.
  Wrong-but-plausible output is the one unacceptable result.
- **Gated output.** Every conversion must compile through
  `@stylexjs/babel-plugin`, pass `@stylexjs/eslint-plugin` at *error* with
  zero autofixes needed, and have semantically identical net CSS (checked
  against Emotion's own serializer, minus an explicit allowlist:
  hover-guard, physical→logical properties).

## Converts / flags / refuses (planned v1.0 scope)

| Bucket | Patterns |
| --- | --- |
| Converts | static `css={{…}}` / `css({})`; self-targeting pseudo-classes/elements; media queries and nesting; physical→logical properties; multi-value margin/padding shorthands; object-form `keyframes`; fallback arrays |
| Flags *(planned)* | template literals; dynamic styles; `styled(Component)`; out-of-element selectors; `<Global>`; `shouldForwardProp`; `!important` |
| Refuses | any file where partial conversion could change rendering; conflicting cascades (referee disagreement); ≥2 sibling media queries on one property; theme tokens (until M6 — see [ADR-0001](./docs/decisions/0001-tokens-are-a-trusted-transformation-deferred-to-config.md)) |

Theme tokens → `defineVars` is deferred to the configuration milestone (M6):
it is a *trusted* transformation (a token's value is external to the file, so
it cannot be verified by the semantic-diff gate) and requires the
user-authored `resolveValue` config.

## Compatibility

| | Version |
| --- | --- |
| Emits StyleX | 0.19.x |
| Reads Emotion | 10–11 (object syntax) |

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the design.

## Usage

```sh
# DRY RUN by default — previews a convert / refuse / TODO report, writes nothing:
stylex-codemod emotion "src/**/*.jsx"

# Apply the changes:
stylex-codemod emotion "src/**/*.jsx" --write

# List unchanged files and every TODO reason:
stylex-codemod emotion "src/**/*.jsx" --verbose
```

Each file is reported as **convert** (fully, or partially with `+N TODO`s left
in place), **refuse** (a whole-file structural issue, with the reason), or
**skip** (no Emotion / nothing to do). Convertible-but-unsafe styles are left
in place with a `// TODO(stylex-migration): …` marker rather than dropped.

### Config

An optional `stylex-codemod.config.js` (or `--config <path>`) tunes behavior:

```js
module.exports = {
  hoverGuard: true, // wrap :hover in @media (hover: hover) (default true)
  logicalProperties: true, // map marginLeft -> marginInlineStart, etc. (default true)
};
```

## Development

```sh
cd packages/@stylexjs/codemods
yarn jest          # run from the package cwd, not the repo root
yarn build
```

Fixture pairs live in `__fixtures__/emotion/<name>/{input,expected}.js`; set
`UPDATE_STYLEX_CODEMOD_FIXTURES=1` to regenerate expected files when a
change is intentional.
