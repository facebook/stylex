---
applyTo: "packages/{@stylexjs,style-value-parser}/**/*.{js,jsx,ts,tsx,mjs,flow}"
---
# WF-MAINTAIN (P1)

Modify StyleX OSS internals safely

When to use:

- User edits packages/@stylexjs/* or packages/style-value-parser/*
- Task changes compiler, parser, lint rule internals, or shared utilities
- Task modifies tests, transforms, or behavior snapshots

Load sources first:

- `packages/@stylexjs/eslint-plugin/README.md`
- `packages/@stylexjs/babel-plugin/__tests__/evaluation-import-test.js`
- `packages/@stylexjs/shared/src/utils/property-priorities.js`
- `packages/style-value-parser/src/index.js`

Hard constraints:

- Preserve behavior unless semantic change is explicitly requested.
- Reference package-local tests and snapshots for behavior validation.
- Call out user-visible impact on setup and authoring docs when applicable.
