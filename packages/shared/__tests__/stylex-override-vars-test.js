/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 *
 */

import styleXOverrideVars from '../src/stylex-override-vars';

describe('stylex-override-vars test', () => {
  test('overrides set of vars with CSS class', () => {
    const defaultVars = {
      __themeName__: 'TestTheme.stylex.js//buttonTheme',
      bgColor: 'var(--xgck17p)',
      bgColorDisabled: 'var(--xpegid5)',
      cornerRadius: 'var(--xrqfjmn)',
      fgColor: 'var(--x4y59db)',
    };

    const overrideVars = {
      bgColor: {
        default: 'green',
        '@media (prefers-color-scheme: dark)': 'lightgreen',
        '@media print': 'transparent',
      },
      bgColorDisabled: {
        default: 'antiquewhite',
        '@media (prefers-color-scheme: dark)': 'floralwhite',
      },
      cornerRadius: { default: '6px' },
      fgColor: 'coral',
    };

    const [classNameOutput, cssOutput] = styleXOverrideVars(
      defaultVars,
      overrideVars,
    );

    expect(cssOutput[classNameOutput[defaultVars.__themeName__]])
      .toMatchInlineSnapshot(`
      {
        "ltr": ".xfmksyk{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}@media (prefers-color-scheme: dark){.xfmksyk{--xgck17p:lightgreen;--xpegid5:floralwhite;}}@media print{.xfmksyk{--xgck17p:transparent;}}",
        "priority": 0.99,
        "rtl": undefined,
      }
    `);
  });

  test('variables order does not change the hash', () => {
    const defaultVars = {
      __themeName__: 'TestTheme.stylex.js//buttonTheme',
      bgColor: 'var(--xgck17p)',
      bgColorDisabled: 'var(--xpegid5)',
      cornerRadius: 'var(--xrqfjmn)',
      fgColor: 'var(--x4y59db)',
    };

    const overrideVars1 = {
      bgColor: {
        default: 'green',
        '@media (prefers-color-scheme: dark)': 'lightgreen',
        '@media print': 'transparent',
      },
      bgColorDisabled: {
        default: 'antiquewhite',
        '@media (prefers-color-scheme: dark)': 'floralwhite',
      },
      cornerRadius: { default: '6px' },
      fgColor: 'coral',
    };

    const overrideVars2 = {
      bgColorDisabled: {
        default: 'antiquewhite',
        '@media (prefers-color-scheme: dark)': 'floralwhite',
      },
      fgColor: { default: 'coral' },
      bgColor: {
        default: 'green',
        '@media print': 'transparent',
        '@media (prefers-color-scheme: dark)': 'lightgreen',
      },
      cornerRadius: '6px',
    };

    const [classNameOutput1] = styleXOverrideVars(defaultVars, overrideVars1);

    const [classNameOutput2] = styleXOverrideVars(defaultVars, overrideVars2);

    expect(classNameOutput1[defaultVars.__themeName__]).toEqual(
      classNameOutput2[defaultVars.__themeName__],
    );
  });
});
