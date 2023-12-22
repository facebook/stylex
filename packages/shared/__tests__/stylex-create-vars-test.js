/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import styleXDefineVars from '../src/stylex-define-vars';
import createHash from '../src/hash';

describe('stylex-create-vars test', () => {
  test('converts set of vars to CSS', () => {
    const themeName = 'TestTheme.stylex.js//buttonTheme';
    const classNamePrefix = 'x';
    const defaultVars = {
      bgColor: {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': 'lightblue',
        '@media print': 'white',
      },
      bgColorDisabled: {
        default: 'grey',
        '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
      },
      cornerRadius: '10px',
      fgColor: {
        default: 'pink',
      },
    };
    const [jsOutput, cssOutput] = styleXDefineVars(defaultVars, { themeName });

    expect(jsOutput).toEqual({
      __themeName__: classNamePrefix + createHash(themeName),
      bgColor: `var(--${classNamePrefix + createHash(`${themeName}.bgColor`)})`,
      bgColorDisabled: `var(--${
        classNamePrefix + createHash(`${themeName}.bgColorDisabled`)
      })`,
      cornerRadius: `var(--${
        classNamePrefix + createHash(`${themeName}.cornerRadius`)
      })`,
      fgColor: `var(--${classNamePrefix + createHash(`${themeName}.fgColor`)})`,
    });

    expect(cssOutput).toMatchInlineSnapshot(`
      {
        "x568ih9": {
          "ltr": ":root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10px;--x4y59db:pink;}",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){:root{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9-bdddrq": {
          "ltr": "@media print{:root{--xgck17p:white;}}",
          "priority": 0,
          "rtl": null,
        },
      }
    `);
  });
});
