/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export const IMPORT_FILE_PARSING_ERROR = `There was error when attempting to parse the imported file.
Please ensure that the 'babelrc' file is configured to be able to parse this file.
`;

// export const
export const IMPORT_FILE_EVAL_ERROR = `There was an error when attempting to evaluate the imported file.
Please ensure that the imported file is self-contained and does not rely on dynamic behavior.
Only named exports of defineVars()/defineConsts() from .stylex.js/.stylex.ts files can be imported into StyleX calls.
`;

export const DEFAULT_IMPORT = `Error: Cannot use default imports in StyleX calls.

Only named imports from \`.stylex.js\` or \`.stylex.ts\` files are supported (e.g., defineVars/defineConsts results).
For sharing constants or functions across files, use \`stylex.env\` configured in the babel plugin options.
See: https://stylexjs.com/docs/learn/theming/defining-variables/#rules-when-defining-variables for more information.
`;

export const PATH_WITHOUT_NODE = `Unexpected error:
Could not resolve the code being evaluated.
`;

export const UNEXPECTED_MEMBER_LOOKUP = `Unexpected error:
Could not determine the property being accessed.
`;

export const IMPORT_PATH_RESOLUTION_ERROR = `Could not resolve the path to the imported file.
Please ensure that the theme file has a .stylex.js or .stylex.ts extension and follows the
rules for defining variables:

https://stylexjs.com/docs/learn/theming/defining-variables/#rules-when-defining-variables
`;

export const NON_CONSTANT =
  'Referenced value is not a constant. Only `const` bindings can be used in StyleX calls. Use `let` or `var` → `const`, or use `stylex.env` for shared values.\n\n';

export const USED_BEFORE_DECLARATION =
  'Referenced value is used before declaration.\n\n';

export const UNINITIALIZED_CONST =
  'Referenced constant is not initialized.\n\n';

export const UNDEFINED_CONST = 'Referenced constant is not defined.';

export const UNSUPPORTED_OPERATOR = (op: string): string =>
  `Unsupported operator: ${op}\n\n`;

export const OBJECT_METHOD = 'Unsupported object method.\n\n';

export const UNSUPPORTED_EXPRESSION = (type: string): string =>
  `Unsupported expression: ${type}\n\n`;
