/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

jest.autoMockOff();

import { convertObjectToAST } from '../js-to-ast';
import generate from '@babel/generator';

describe('convertObjectToAST', () => {
  test('converts empty object', () => {
    const result = convertObjectToAST({});
    expect(generate(result).code).toMatchInlineSnapshot('"{}"');
  });

  test('converts object with values', () => {
    const result = convertObjectToAST({
      base: {
        width: {
          default: 800,
          '@media (max-width: 800px)': '100%',
          '@media (min-width: 1540px)': 1366,
        },
      },
    });
    expect(generate(result).code).toMatchInlineSnapshot(`
      "{
        base: {
          width: {
            default: 800,
            "@media (max-width: 800px)": "100%",
            "@media (min-width: 1540px)": 1366
          }
        }
      }"
    `);
  });
});
