/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');

function transform(source, opts = {}) {
  const options = {
    filename: opts.filename,
    plugins: [[stylexPlugin, opts]],
  };
  const result = transformSync(source, options);
  return result;
}

describe('[optimization] Removes `styles` variable when not needed', () => {
  test('Keeps used styles', () => {
    const result = transform(`
      import stylex from 'stylex';

      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
          color: 'blue',
        }
      });
      styles;
    `);
    expect(result.code).toMatchInlineSnapshot(`
      "import stylex from 'stylex';
      stylex.inject(".xrkmrrc{background-color:red}", 3000);
      stylex.inject(".xju2f9n{color:blue}", 3000);
      const styles = {
        default: {
          backgroundColor: "xrkmrrc",
          color: "xju2f9n",
          $$css: true
        }
      };
      styles;"
    `);
    expect(result.metadata).toMatchInlineSnapshot(`
      {
        "stylex": [
          [
            "xrkmrrc",
            {
              "ltr": ".xrkmrrc{background-color:red}",
              "rtl": null,
            },
            3000,
          ],
          [
            "xju2f9n",
            {
              "ltr": ".xju2f9n{color:blue}",
              "rtl": null,
            },
            3000,
          ],
        ],
      }
    `);
  });

  test('Removes unused styles', () => {
    const result = transform(`
      import stylex from 'stylex';

      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
          color: 'blue',
        }
      });
    `);
    expect(result.code).toMatchInlineSnapshot(`
      "import stylex from 'stylex';
      stylex.inject(".xrkmrrc{background-color:red}", 3000);
      stylex.inject(".xju2f9n{color:blue}", 3000);"
    `);
    expect(result.metadata).toMatchInlineSnapshot(`
      {
        "stylex": [
          [
            "xrkmrrc",
            {
              "ltr": ".xrkmrrc{background-color:red}",
              "rtl": null,
            },
            3000,
          ],
          [
            "xju2f9n",
            {
              "ltr": ".xju2f9n{color:blue}",
              "rtl": null,
            },
            3000,
          ],
        ],
      }
    `);
  });
});
