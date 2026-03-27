# StyleX Copilot Repository Instructions

_Generated file. Do not edit directly._
_Source: `ai-dev/plugins/index.json` and `ai-dev/plugins/*.json`._

Keep this file global and orthogonal. Put workflow-specific guidance in
`.github/instructions/*.instructions.md`.

## Global behavior

- Default to `WF-SETUP` and `WF-AUTHOR`.
- Use `WF-MAINTAIN` only for StyleX internals.
- Load canonical docs before giving setup or authoring advice.
- Align suggestions with StyleX lint rules.
- Avoid duplicating long setup/authoring explanations; reference canonical files.

## Canonical Sources

- `packages/docs/static/llm/stylex-installation.md`
- `packages/docs/static/llm/stylex-authoring.md`
- `packages/@stylexjs/eslint-plugin/README.md`

## Rule Alignment

- `@stylexjs/valid-styles`
- `@stylexjs/sort-keys`
- `@stylexjs/valid-shorthands`
- `@stylexjs/no-unused`
- `@stylexjs/no-legacy-contextual-styles`
- `@stylexjs/no-lookahead-selectors`
- `@stylexjs/no-nonstandard-styles`
- `@stylexjs/no-conflicting-props`
- `@stylexjs/enforce-extension`

## Validation Commands

Always run these commands before finalizing changes:

- **Build:** `npm run build`
- **Test Packages:** `npm run test:packages`
- **Lint:** `npm run lint:report`
- **Typecheck:** `npm run flow`
- **Check Context Drift:** `npm run ai:check-context`

## Do Not

- Do not mix className or inline style with stylex.props() on the same element.
- Do not use legacy contextual syntax for media or pseudo styles.
- Do not use disallowed multivalue shorthand patterns where longhands are required.
- Do not write TypeScript syntax in Flow-typed internal .js files.

## Conventions

- Internal packages use Flow-typed .js files. Do not write TypeScript syntax in these files.

## Generation and Integrity

- Generate: `node tools/ai-context/generate-agents.js`
- Check drift: `node tools/ai-context/generate-agents.js --check`
