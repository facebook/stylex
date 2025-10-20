/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { FlatCompiledStyles } from '../shared/common-types';

import * as t from '@babel/types';

type NestedStringObject = $ReadOnly<{
  [key: string]: string | number | null | boolean | NestedStringObject,
}>;

export function convertObjectToAST(
  obj: NestedStringObject,
): t.ObjectExpression {
  return t.objectExpression(
    Object.entries(obj).map(([key, value]) =>
      t.objectProperty(
        t.isValidIdentifier(key, false)
          ? t.identifier(key)
          : t.stringLiteral(key),
        typeof value === 'string'
          ? t.stringLiteral(value)
          : typeof value === 'number'
            ? t.numericLiteral(value)
            : typeof value === 'boolean'
              ? t.booleanLiteral(value)
              : value === null
                ? t.nullLiteral()
                : convertObjectToAST(value),
      ),
    ),
  );
}

export function removeObjectsWithSpreads(obj: {
  +[string]: FlatCompiledStyles,
}): { +[string]: FlatCompiledStyles } {
  return Object.fromEntries(Object.entries(obj).filter(Boolean));
}
