/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import styleXDefineVars from '../../src/stylex-define-vars';
import * as t from '../../src/types';
import createHash from '../../src/hash';

describe('stylex-define-vars test', () => {
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
          "ltr": ":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10px;--x4y59db:pink;}",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-bdddrq": {
          "ltr": "@media print{:root, .x568ih9{--xgck17p:white;}}",
          "priority": 0.1,
          "rtl": null,
        },
      }
    `);
  });

  test('maintains literal var names in CSS', () => {
    const themeName = 'TestTheme.stylex.js//buttonTheme';
    const classNamePrefix = 'x';
    const defaultVars = {
      '--bgColor': {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': 'lightblue',
        '@media print': 'white',
      },
      '--bgColorDisabled': {
        default: 'grey',
        '@media (prefers-color-scheme: dark)': 'rgba(0, 0, 0, 0.8)',
      },
      '--cornerRadius': '10px',
      '--fgColor': {
        default: 'pink',
      },
    };
    const [jsOutput, cssOutput] = styleXDefineVars(defaultVars, { themeName });

    expect(jsOutput).toEqual({
      __themeName__: classNamePrefix + createHash(themeName),
      '--bgColor': 'var(--bgColor)',
      '--bgColorDisabled': 'var(--bgColorDisabled)',
      '--cornerRadius': 'var(--cornerRadius)',
      '--fgColor': 'var(--fgColor)',
    });

    expect(cssOutput).toMatchInlineSnapshot(`
      {
        "x568ih9": {
          "ltr": ":root, .x568ih9{--bgColor:blue;--bgColorDisabled:grey;--cornerRadius:10px;--fgColor:pink;}",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){:root, .x568ih9{--bgColor:lightblue;--bgColorDisabled:rgba(0, 0, 0, 0.8);}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-bdddrq": {
          "ltr": "@media print{:root, .x568ih9{--bgColor:white;}}",
          "priority": 0.1,
          "rtl": null,
        },
      }
    `);
  });

  test('converts set of vars with nested at rules to CSS', () => {
    const themeName = 'TestTheme.stylex.js//buttonTheme';
    const classNamePrefix = 'x';
    const defaultVars = {
      bgColor: {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': {
          default: 'lightblue',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media print': 'white',
      },
      bgColorDisabled: {
        default: {
          default: 'grey',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media (prefers-color-scheme: dark)': {
          default: 'rgba(0, 0, 0, 0.8)',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
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
          "ltr": ":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10px;--x4y59db:pink;}",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9-1e6ryz3": {
          "ltr": "@supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:oklab(0.7 -0.3 -0.4);--xpegid5:oklab(0.7 -0.3 -0.4);}}}",
          "priority": 0.2,
          "rtl": null,
        },
        "x568ih9-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-bdddrq": {
          "ltr": "@media print{:root, .x568ih9{--xgck17p:white;}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-kpd015": {
          "ltr": "@supports (color: oklab(0 0 0)){:root, .x568ih9{--xpegid5:oklab(0.7 -0.3 -0.4);}}",
          "priority": 0.1,
          "rtl": null,
        },
      }
    `);
  });

  test('converts set of typed vars with nested at rules to CSS', () => {
    const themeName = 'TestTheme.stylex.js//buttonTheme';
    const classNamePrefix = 'x';
    const defaultVars = {
      bgColor: t.color({
        default: 'blue',
        '@media (prefers-color-scheme: dark)': {
          default: 'lightblue',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media print': 'white',
      }),
      bgColorDisabled: t.color({
        default: {
          default: 'grey',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media (prefers-color-scheme: dark)': {
          default: 'rgba(0, 0, 0, 0.8)',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
      }),
      cornerRadius: t.length('10px'),
      fgColor: t.color({
        default: 'pink',
      }),
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
        "x4y59db": {
          "ltr": "@property --x4y59db { syntax: "<color>"; inherits: true; initial-value: pink }",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9": {
          "ltr": ":root, .x568ih9{--xgck17p:blue;--xpegid5:grey;--xrqfjmn:10px;--x4y59db:pink;}",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9-1e6ryz3": {
          "ltr": "@supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:oklab(0.7 -0.3 -0.4);--xpegid5:oklab(0.7 -0.3 -0.4);}}}",
          "priority": 0.2,
          "rtl": null,
        },
        "x568ih9-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){:root, .x568ih9{--xgck17p:lightblue;--xpegid5:rgba(0, 0, 0, 0.8);}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-bdddrq": {
          "ltr": "@media print{:root, .x568ih9{--xgck17p:white;}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-kpd015": {
          "ltr": "@supports (color: oklab(0 0 0)){:root, .x568ih9{--xpegid5:oklab(0.7 -0.3 -0.4);}}",
          "priority": 0.1,
          "rtl": null,
        },
        "xgck17p": {
          "ltr": "@property --xgck17p { syntax: "<color>"; inherits: true; initial-value: blue }",
          "priority": 0,
          "rtl": null,
        },
        "xpegid5": {
          "ltr": "@property --xpegid5 { syntax: "<color>"; inherits: true; initial-value: grey }",
          "priority": 0,
          "rtl": null,
        },
        "xrqfjmn": {
          "ltr": "@property --xrqfjmn { syntax: "<length>"; inherits: true; initial-value: 10px }",
          "priority": 0,
          "rtl": null,
        },
      }
    `);
  });

  test('preserves names of literals with -- prefix', () => {
    const themeName = 'TestTheme.stylex.js//buttonTheme';
    const classNamePrefix = 'x';
    const defaultVars = {
      '--bgColor': t.color({
        default: 'blue',
        '@media (prefers-color-scheme: dark)': {
          default: 'lightblue',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media print': 'white',
      }),
      '--bgColorDisabled': t.color({
        default: {
          default: 'grey',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
        '@media (prefers-color-scheme: dark)': {
          default: 'rgba(0, 0, 0, 0.8)',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        },
      }),
      '--cornerRadius': t.length('10px'),
      '--fgColor': t.color({
        default: 'pink',
      }),
    };
    const [jsOutput, cssOutput] = styleXDefineVars(defaultVars, { themeName });

    expect(jsOutput).toEqual({
      __themeName__: classNamePrefix + createHash(themeName),
      '--bgColor': 'var(--bgColor)',
      '--bgColorDisabled': 'var(--bgColorDisabled)',
      '--cornerRadius': 'var(--cornerRadius)',
      '--fgColor': 'var(--fgColor)',
    });
    expect(cssOutput).toMatchInlineSnapshot(`
      {
        "bgColor": {
          "ltr": "@property --bgColor { syntax: "<color>"; inherits: true; initial-value: blue }",
          "priority": 0,
          "rtl": null,
        },
        "bgColorDisabled": {
          "ltr": "@property --bgColorDisabled { syntax: "<color>"; inherits: true; initial-value: grey }",
          "priority": 0,
          "rtl": null,
        },
        "cornerRadius": {
          "ltr": "@property --cornerRadius { syntax: "<length>"; inherits: true; initial-value: 10px }",
          "priority": 0,
          "rtl": null,
        },
        "fgColor": {
          "ltr": "@property --fgColor { syntax: "<color>"; inherits: true; initial-value: pink }",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9": {
          "ltr": ":root, .x568ih9{--bgColor:blue;--bgColorDisabled:grey;--cornerRadius:10px;--fgColor:pink;}",
          "priority": 0,
          "rtl": null,
        },
        "x568ih9-1e6ryz3": {
          "ltr": "@supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .x568ih9{--bgColor:oklab(0.7 -0.3 -0.4);--bgColorDisabled:oklab(0.7 -0.3 -0.4);}}}",
          "priority": 0.2,
          "rtl": null,
        },
        "x568ih9-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){:root, .x568ih9{--bgColor:lightblue;--bgColorDisabled:rgba(0, 0, 0, 0.8);}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-bdddrq": {
          "ltr": "@media print{:root, .x568ih9{--bgColor:white;}}",
          "priority": 0.1,
          "rtl": null,
        },
        "x568ih9-kpd015": {
          "ltr": "@supports (color: oklab(0 0 0)){:root, .x568ih9{--bgColorDisabled:oklab(0.7 -0.3 -0.4);}}",
          "priority": 0.1,
          "rtl": null,
        },
      }
    `);
  });
});
