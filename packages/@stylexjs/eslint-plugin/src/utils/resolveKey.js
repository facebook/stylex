/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Identifier } from 'estree';
import type { Variables } from '../stylex-valid-styles';

export default function resolveKey(
  property: Identifier,
  variables?: Variables,
): ?string {
  const name = property.name;
  let existingVar = variables?.get(name);

  while (existingVar != null) {
    if (existingVar === 'ARG') {
      return undefined;
    }
    // $FlowFixMe[invalid-compare]
    if (existingVar.type === 'TSAsExpression') {
      existingVar = existingVar.expression;
    }
    // $FlowFixMe[invalid-compare]
    if (existingVar.type === 'TSSatisfiesExpression') {
      existingVar = existingVar.expression;
    }

    if (existingVar.type === 'Literal') {
      const value = existingVar.value;
      if (typeof value === 'string') {
        return value;
      } else {
        return undefined;
      }
    }
    if (existingVar.type === 'Identifier') {
      existingVar = variables?.get(existingVar.name);
    } else {
      return undefined;
    }
  }
}
