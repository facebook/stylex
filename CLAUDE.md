# CLAUDE Context

_Generated file. Do not edit directly._
_Source: `ai-dev/plugins/index.json` and `ai-dev/plugins/*.json`._

Use `AGENTS.md` as the primary context router.

## Defaults

- Default workflows: WF-SETUP, WF-AUTHOR
- Use maintainer workflow only for StyleX internals.

## Canonical Sources

- `packages/docs/static/llm/stylex-installation.md`
- `packages/docs/static/llm/stylex-authoring.md`
- `packages/@stylexjs/eslint-plugin/README.md`

## Workflow Summary

- `WF-SETUP` (P0): Install and configure StyleX in app projects
- `WF-AUTHOR` (P0): Author valid, idiomatic StyleX styles in apps
- `WF-MAINTAIN` (P1): Modify StyleX OSS internals safely

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

## Package Map

- `packages/@stylexjs/stylex` - Public API and runtime
- `packages/@stylexjs/babel-plugin` - Compiler (style extraction and code transforms)
- `packages/@stylexjs/shared` - Shared utilities (property priorities, naming)
- `packages/@stylexjs/eslint-plugin` - Lint rules for style validation
- `packages/style-value-parser` - CSS value parser and normalizer
- `packages/@stylexjs/unplugin` - Bundler integrations (Vite, Webpack, Rspack, esbuild, Rollup)
- `packages/@stylexjs/postcss-plugin` - PostCSS integration (Next.js)
- `packages/@stylexjs/cli` - CLI for standalone file processing

## Local Override

For machine-local customizations, use `AGENTS.override.md` (not committed).

## Generation and Integrity

- Generate: `node tools/ai-context/generate-agents.js`
- Check drift: `node tools/ai-context/generate-agents.js --check`
- Never edit generated context files manually; update plugin source files instead.
