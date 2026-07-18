# Architecture

The codemod is a source-to-source compiler: styling code in, equivalent
StyleX out. It is built so that supporting a new source library never means
rebuilding the compiler — only writing a new front-end for it.

> **One engine, swappable readers.** A small library-specific **adapter**
> turns one styling library into a neutral style model (the IR). A single
> library-agnostic **core** turns that model into correct, lint-clean
> StyleX. To add Emotion, MUI, or CSS Modules you write an adapter — the
> engine never changes.

## The seam

| | Adapter (per source) | Core engine (shared) |
| --- | --- | --- |
| Owns | detect, read, rewrite call sites, import cleanup | IR build, conflict referee, value normalization, emit, registry, postprocess, gates |
| Knows about | one styling library's syntax | only the IR and StyleX |
| Changes when | a new source is added | StyleX itself gains a feature |

**Load-bearing invariant:** `src/core/` imports *nothing* from
`src/adapters/` and never touches a parser node — it only sees
declarations, the IR, and emitted StyleX fragments. Enforced by
`__tests__/seam-test.js` from commit one. The seam is crossed exactly
twice:

1. **Adapter → core:** a flat list of `declarations`
   (`{ context, property, value }`) — "here is what styles exist".
2. **Core → adapter:** the **binding map** — "style site #1 becomes
   `styles.button`" — which the adapter places back into that library's
   idiom.

A second invariant keeps the AST toolkit swappable: only
`src/core/rewriter.js` may import jscodeshift/recast (also enforced by the
seam test).

## The IR (`src/core/ir.js`)

The IR is shaped like **StyleX's output** (property-grouped, conditions
nested inside a property), not like any source's input. A style either maps
into the IR (convertible) or it does not (flagged — never guessed); the
edge of the IR is the edge of what is automatable.

Its only two open axes are the ones StyleX itself grows along, both modeled
as variant types so growth stays additive:

- `Condition` — `pseudo-class` / `pseudo-element` / `at-rule` (later:
  ancestor selectors, `@supports`, `@container`).
- `Value` — `static` and `first-that-works` today; a `dynamic`
  (function-form) variant lands in v1.1.

Completeness is **measured, not asserted**: the IR-completeness harness
(`__tests__/ir-completeness-test.js`) round-trips valid StyleX style
objects through a test-only reader and reports a coverage percentage. An
IR gap is safe — in the pipeline the construct is flagged, never
emitted incorrectly.

## The gates (`src/core/gates/`)

Independent correctness checks, used as test assertions and as a runtime
safety net. Each is proven to FAIL on a deliberately-broken input
(`__fixtures__/broken/`) — a gate that never fails is worthless.

- **Compile** (`compile.js`) — output must compile through the real
  `@stylexjs/babel-plugin`; also yields the plugin's rule metadata.
- **Lint** (`lint.js`) — output must pass every `@stylexjs/eslint-plugin`
  rule at *error* with zero messages (zero autofixes needed).
- **Semantic diff** (`semanticDiff.js`) — net CSS before (from
  `@emotion/serialize`, the source library's own ground truth) and after
  (from babel-plugin metadata) must match across every condition
  combination, minus an explicit allowlist of sanctioned diffs
  (hover-guard, physical→logical). Its parsers throw on anything they
  cannot provably represent, so an unparsable input can never diff clean
  by accident.
- **Render gate** *(future, v2.0)* — Playwright computed-style diff in a
  real browser, keeping the semantic-diff gate honest.

## Testing layers

1. **Gate self-tests** — each gate green on the trivial pair AND red on a
   broken pair (`__tests__/gates-test.js`).
2. **Fixture tests** — the executable spec. Every
   `__fixtures__/emotion/<name>/{input,expected}.js` pair must: match the
   transform byte-exactly (after Prettier), compile, lint clean, and pass
   the semantic diff (`__tests__/emotion-fixtures-test.js`).
3. **Engine unit tests** — hand-written IR fed to the engine (from M1),
   proving the engine is source-neutral.
4. **Seam tests** — the architectural invariants, as assertions.
5. **IR-completeness** — the measured coverage number.

## Layer map

| Layer | Module |
| --- | --- |
| Parse/print wrapper | `src/core/rewriter.js` (jscodeshift, isolated) |
| IR types | `src/core/ir.js` |
| Gates | `src/core/gates/{compile,lint,semanticDiff}.js` |
| Emotion adapter | `src/adapters/emotion/` (M1+) |
| Engine (build IR, referee, normalize, emit) | `src/core/` (M1–M4) |
| CLI & dry-run report | `src/cli/` (M6) |
