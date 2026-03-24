---
applyTo: "**/*.{js,jsx,ts,tsx}"
---
# WF-AUTHOR (P0)

Author valid, idiomatic StyleX styles in apps

When to use:

- User asks how to write or refactor StyleX styles
- User asks about pseudo/media rules, dynamic styles, vars/themes, or style merges
- User is fixing lint violations in app-level StyleX code

Load sources first:

- `packages/docs/static/llm/stylex-authoring.md`
- `packages/@stylexjs/eslint-plugin/README.md`

Hard constraints:

- Use stylex.create() for definitions and stylex.props() for application.
- Prefer longhands over disallowed multivalue shorthand patterns.
- Avoid mixing className/style with stylex.props() on the same element.
- Use modern nested syntax for media queries and pseudo-classes.
