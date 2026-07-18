# @stylexjs/codemods

Codemods for migrating styling libraries to [StyleX](https://stylexjs.com) —
Emotion first, built as **one library-agnostic engine with swappable
per-library adapters**.

> **Status: pre-release scaffold (M0).** The correctness harness — fixture
> tests plus three gates (compile, lint, semantic-diff) — is in place and
> proven; transforms land milestone by milestone. Nothing here is published
> yet, and the package name/location is pending maintainer confirmation.

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
| Converts | static `css={{…}}` / `css({})` / object-form `styled.div({})`; self-targeting pseudo-classes/elements; media queries; object-form `keyframes`; fallback arrays; shorthands; mapped theme tokens |
| Flags | template literals; dynamic styles; `styled(Component)`; out-of-element selectors; `<Global>`; `shouldForwardProp`; unmapped tokens; `!important` |
| Refuses | any file where partial conversion could change rendering |

## Compatibility

| | Version |
| --- | --- |
| Emits StyleX | 0.19.x |
| Reads Emotion | 10–11 (object syntax) |

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the design.

## Development

```sh
cd packages/@stylexjs/codemods
yarn jest          # run from the package cwd, not the repo root
yarn build
```

Fixture pairs live in `__fixtures__/emotion/<name>/{input,expected}.js`; set
`UPDATE_STYLEX_CODEMOD_FIXTURES=1` to regenerate expected files when a
change is intentional.
