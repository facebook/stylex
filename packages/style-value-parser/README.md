# style-value-parser

An experimental CSS value parser for StyleX. The parser is built on
`@csstools/css-tokenizer`.

We currently use `postcss-value-parser` to parse style values, which is slow,
rudimentary, and lacks customization. This package is a work-in-progress
replacement that enables stricter parsing and better control over style property
values.

## Use cases

- Parses all css types and style properties
- Provides a `toString()` method to normalize values and dedupe styles
- Stricter style validation in the ESLint plugin
- Parse and validate `@media` queries
