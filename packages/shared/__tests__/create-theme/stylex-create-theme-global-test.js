/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import _stylexCreateTheme from '../../src/stylex-create-theme';
import * as t from '../../src/types';

const stylexCreateTheme = (a, b) =>
  _stylexCreateTheme(a, b, { themeOverride: 'global' });

describe('stylex-create-theme test', () => {
  test('overrides set of vars with CSS class', () => {
    const defaultVars = {
      __themeName__: 'TestTheme.stylex.js//buttonTheme',
      bgColor: 'var(--xgck17p)',
      bgColorDisabled: 'var(--xpegid5)',
      cornerRadius: 'var(--xrqfjmn)',
      fgColor: 'var(--x4y59db)',
    };

    const createTheme = {
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

    const [classNameOutput, cssOutput] = stylexCreateTheme(
      defaultVars,
      createTheme,
    );

    expect(defaultVars.__themeName__).toMatchInlineSnapshot(
      '"TestTheme.stylex.js//buttonTheme"',
    );

    expect(classNameOutput).toMatchInlineSnapshot(`
      {
        "$$css": true,
        "TestTheme.stylex.js//buttonTheme": "xtrlmmh __stylex-base-theme__",
      }
    `);

    expect(cssOutput[classNameOutput[defaultVars.__themeName__].split(' ')[0]])
      .toMatchInlineSnapshot(`
      {
        "ltr": ".xtrlmmh{--xgck17p:green;--xpegid5:antiquewhite;--xrqfjmn:6px;--x4y59db:coral;}",
        "priority": 0.5,
        "rtl": null,
      }
    `);
  });

  test('overrides set of literal vars with CSS class', () => {
    const defaultVars = {
      __themeName__: 'TestTheme.stylex.js//buttonTheme',
      '--bgColor': 'var(--bgColor)',
      '--bgColorDisabled': 'var(--bgColorDisabled)',
      '--cornerRadius': 'var(--cornerRadius)',
      '--fgColor': 'var(--fgColor)',
    };

    const createTheme = {
      '--bgColor': {
        default: 'green',
        '@media (prefers-color-scheme: dark)': 'lightgreen',
        '@media print': 'transparent',
      },
      '--bgColorDisabled': {
        default: 'antiquewhite',
        '@media (prefers-color-scheme: dark)': 'floralwhite',
      },
      '--cornerRadius': { default: '6px' },
      '--fgColor': 'coral',
    };

    const [classNameOutput, cssOutput] = stylexCreateTheme(
      defaultVars,
      createTheme,
    );

    expect(defaultVars.__themeName__).toMatchInlineSnapshot(
      '"TestTheme.stylex.js//buttonTheme"',
    );

    expect(classNameOutput).toMatchInlineSnapshot(`
      {
        "$$css": true,
        "TestTheme.stylex.js//buttonTheme": "x4znj40 __stylex-base-theme__",
      }
    `);

    expect(cssOutput[classNameOutput[defaultVars.__themeName__].split(' ')[0]])
      .toMatchInlineSnapshot(`
      {
        "ltr": ".x4znj40{--bgColor:green;--bgColorDisabled:antiquewhite;--cornerRadius:6px;--fgColor:coral;}",
        "priority": 0.5,
        "rtl": null,
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

    const createTheme1 = {
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

    const createTheme2 = {
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

    const [classNameOutput1] = stylexCreateTheme(defaultVars, createTheme1);

    const [classNameOutput2] = stylexCreateTheme(defaultVars, createTheme2);

    expect(defaultVars.__themeName__).toMatchInlineSnapshot(
      '"TestTheme.stylex.js//buttonTheme"',
    );

    expect(classNameOutput1[defaultVars.__themeName__].split(' ')[0]).toEqual(
      classNameOutput2[defaultVars.__themeName__].split(' ')[0],
    );
  });

  test('Adding an at-rule changes the hash', () => {
    const defaultVars = {
      __themeName__: 'TestTheme.stylex.js//buttonTheme',
      bgColor: 'var(--xgck17p)',
    };

    const createTheme1 = {
      bgColor: 'green',
    };

    const createTheme2 = {
      bgColor: {
        default: 'green',
        '@media (prefers-color-scheme: dark)': 'lightgreen',
      },
    };

    const [classNameOutput1] = stylexCreateTheme(defaultVars, createTheme1);

    const [classNameOutput2] = stylexCreateTheme(defaultVars, createTheme2);

    expect(
      classNameOutput1[defaultVars.__themeName__].split(' ')[0],
    ).not.toEqual(classNameOutput2[defaultVars.__themeName__].split(' ')[0]);
  });

  test('Generates styles for nested at-rules', () => {
    const defaultVars = {
      __themeName__: 'TestTheme.stylex.js//buttonTheme',
      bgColor: 'var(--xgck17p)',
    };

    const createTheme = {
      bgColor: {
        default: {
          default: 'green',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media (prefers-color-scheme: dark)': {
          default: 'lightgreen',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.2 -0.4)',
        },
      },
    };

    const [_classNameOutput, cssOutput] = stylexCreateTheme(
      defaultVars,
      createTheme as $FlowFixMe,
    );

    expect(cssOutput).toMatchInlineSnapshot(`
      {
        "x2y918k": {
          "ltr": ".x2y918k{--xgck17p:green;}",
          "priority": 0.5,
          "rtl": null,
        },
        "x2y918k-1e6ryz3": {
          "ltr": "@supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){.x2y918k{--xgck17p:oklab(0.7 -0.2 -0.4);}}}",
          "priority": 0.7,
          "rtl": null,
        },
        "x2y918k-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){.x2y918k{--xgck17p:lightgreen;}}",
          "priority": 0.6,
          "rtl": null,
        },
        "x2y918k-kpd015": {
          "ltr": "@supports (color: oklab(0 0 0)){.x2y918k{--xgck17p:oklab(0.7 -0.3 -0.4);}}",
          "priority": 0.6,
          "rtl": null,
        },
      }
    `);
  });

  test('Generates styles for typed nested at-rules', () => {
    const defaultVars = {
      __themeName__: 'TestTheme.stylex.js//buttonTheme',
      bgColor: 'var(--xgck17p)',
    };

    const createTheme = {
      bgColor: t.color({
        default: {
          default: 'green',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media (prefers-color-scheme: dark)': {
          default: 'lightgreen',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.2 -0.4)',
        },
      }),
    };

    const [_classNameOutput, cssOutput] = stylexCreateTheme(
      defaultVars,
      createTheme as $FlowFixMe,
    );

    expect(cssOutput).toMatchInlineSnapshot(`
      {
        "x2y918k": {
          "ltr": ".x2y918k{--xgck17p:green;}",
          "priority": 0.5,
          "rtl": null,
        },
        "x2y918k-1e6ryz3": {
          "ltr": "@supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){.x2y918k{--xgck17p:oklab(0.7 -0.2 -0.4);}}}",
          "priority": 0.7,
          "rtl": null,
        },
        "x2y918k-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){.x2y918k{--xgck17p:lightgreen;}}",
          "priority": 0.6,
          "rtl": null,
        },
        "x2y918k-kpd015": {
          "ltr": "@supports (color: oklab(0 0 0)){.x2y918k{--xgck17p:oklab(0.7 -0.3 -0.4);}}",
          "priority": 0.6,
          "rtl": null,
        },
      }
    `);
  });
});
