/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 *
 */

import styleXCreateVars from '../src/stylex-create-vars';
import createHash from '../src/hash';

describe('stylex-create-vars test', () => {
  test('converts set of vars to CSS', () => {
    const themeName = 'TestTheme.stylex.js//buttonTheme';
    const classNamePrefix = 'x';
    const defaultVars = {
      bgColor: 'blue',
      bgColorDisabled: 'grey',
      cornerRadius: '10px',
    };
    const [jsOutput, cssOutput] = styleXCreateVars(defaultVars, { themeName });

    expect(jsOutput).toEqual({
      __themeName__: classNamePrefix + createHash(themeName),
      bgColor: `var(--${classNamePrefix + createHash(`${themeName}.bgColor`)})`,
      bgColorDisabled: `var(--${
        classNamePrefix + createHash(`${themeName}.bgColorDisabled`)
      })`,
      cornerRadius: `var(--${
        classNamePrefix + createHash(`${themeName}.cornerRadius`)
      })`,
    });

    expect(cssOutput).toEqual({
      css: ':root{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10px;}',
    });
  });
});
