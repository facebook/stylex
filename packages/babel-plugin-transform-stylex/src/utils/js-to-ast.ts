/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as t from '@babel/types';

type NestedStringObject = {
  readonly [key: string]: string | NestedStringObject;
};

export function convertObjectToAST(
  obj: NestedStringObject
): t.ObjectExpression {
  return t.objectExpression(
    Object.entries(obj).map(([key, value]) =>
      t.objectProperty(
        canBeIdentifier(key) ? t.identifier(key) : t.stringLiteral(key),
        typeof value === 'string'
          ? t.stringLiteral(value)
          : convertObjectToAST(value)
      )
    )
  );
}

function canBeIdentifier(str: string): boolean {
  return str.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/) != null;
}
