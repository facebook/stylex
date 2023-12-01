/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { PreRule } from '../src/preprocess-rules/PreRule';

const options = {
  classNamePrefix: 'x',
  styleResolution: 'legacy-expand-shorthands',
  dev: false,
  useRemForFontSize: true,
  runtimeInjection: false,
  test: false,
};

describe('Converting PreRule to CSS', () => {
  test('should convert a PreRule to CSS', () => {
    expect(new PreRule('color', 'red').compiled(options))
      .toMatchInlineSnapshot(`
        [
          [
            "x1e2nbdu",
            {
              "ltr": ".x1e2nbdu{color:red}",
              "priority": 3000,
              "rtl": null,
            },
          ],
        ]
      `);
  });
});
