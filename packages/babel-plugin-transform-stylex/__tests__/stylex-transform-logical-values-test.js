/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: {
        all: true,
      },
    },
    plugins: [[stylexPlugin, opts]],
  }).code;
}

describe('babel-plugin-transform-stylex', () => {
  /**
   * CSS logical values transform
   */

  describe('[transform] CSS logical values', () => {
    // TODO: Add support for 'background-position-x: x-start' logical values
    // once spec stabilizes.
    // https://drafts.csswg.org/css-backgrounds-4/#the-background-position

    test('value "inline-end" for "clear" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { clear: 'inline-end' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xof8tvn{clear:inline-end}\\", 1);
        const styles = {
          x: {
            clear: \\"xof8tvn\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('value "inline-start" for "clear" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { clear: 'inline-start' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x18lmvvi{clear:inline-start}\\", 1);
        const styles = {
          x: {
            clear: \\"x18lmvvi\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('value "inline-end" for "float" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { float: 'inline-end' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1h0q493{float:inline-end}\\", 1);
        const styles = {
          x: {
            float: \\"x1h0q493\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('value "inline-start" for "float" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { float: 'inline-start' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1kmio9f{float:inline-start}\\", 1);
        const styles = {
          x: {
            float: \\"x1kmio9f\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('value "end" for "textAlign" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { textAlign: 'end' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xp4054r{text-align:right}\\", 1, \\".xp4054r{text-align:left}\\");
        const styles = {
          x: {
            textAlign: \\"xp4054r\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('value "start" for "textAlign" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { textAlign: 'start' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1yc453h{text-align:left}\\", 1, \\".x1yc453h{text-align:right}\\");
        const styles = {
          x: {
            textAlign: \\"x1yc453h\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /**
     * Non-standard values
     */

    test('[non-standard] value "end" (aka "inlineEnd") for "clear" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { clear: 'end' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xodj72a{clear:end}\\", 1);
        const styles = {
          x: {
            clear: \\"xodj72a\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "clear" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { clear: 'start' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x390i0x{clear:start}\\", 1);
        const styles = {
          x: {
            clear: \\"x390i0x\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] value "end" (aka "inlineEnd") for "float" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { float: 'end' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1guec7k{float:right}\\", 1, \\".x1guec7k{float:left}\\");
        const styles = {
          x: {
            float: \\"x1guec7k\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "float" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { float: 'start' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xrbpyxo{float:left}\\", 1, \\".xrbpyxo{float:right}\\");
        const styles = {
          x: {
            float: \\"xrbpyxo\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /**
     * Non-standard bidi transforms
     */

    test('[legacy] value "e-resize" for "cursor" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { cursor: 'e-resize' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x14mnfz1{cursor:e-resize}\\", 1, \\".x14mnfz1{cursor:w-resize}\\");
        const styles = {
          x: {
            cursor: \\"x14mnfz1\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value "w-resize" for "cursor" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { cursor: 'w-resize' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x14isd7o{cursor:w-resize}\\", 1, \\".x14isd7o{cursor:e-resize}\\");
        const styles = {
          x: {
            cursor: \\"x14isd7o\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value "ne-resize" for "cursor" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { cursor: 'ne-resize' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xc7edbc{cursor:ne-resize}\\", 1, \\".xc7edbc{cursor:nw-resize}\\");
        const styles = {
          x: {
            cursor: \\"xc7edbc\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value "nw-resize" for "cursor" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { cursor: 'nw-resize' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xrpsa6j{cursor:nw-resize}\\", 1, \\".xrpsa6j{cursor:ne-resize}\\");
        const styles = {
          x: {
            cursor: \\"xrpsa6j\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value "se-resize" for "cursor" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { cursor: 'se-resize' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xp35lg9{cursor:se-resize}\\", 1, \\".xp35lg9{cursor:sw-resize}\\");
        const styles = {
          x: {
            cursor: \\"xp35lg9\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value "sw-resize" for "cursor" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { cursor: 'sw-resize' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1egwzy8{cursor:sw-resize}\\", 1, \\".x1egwzy8{cursor:se-resize}\\");
        const styles = {
          x: {
            cursor: \\"x1egwzy8\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /**
     * Legacy transforms
     * TODO(#33): Remove once support for multi-sided values is removed from shortforms.
     */

    test('[legacy] value of "animationName" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { animationName: 'ignore' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x13xdq3h{animation-name:ignore-ltr}\\", 1, \\".x13xdq3h{animation-name:ignore-rtl}\\");
        const styles = {
          x: {
            animationName: \\"x13xdq3h\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value of "backgroundPosition" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { backgroundPosition: 'top end' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xl0ducr{background-position:top right}\\", 1, \\".xl0ducr{background-position:top left}\\");
        const styles = {
          x: {
            backgroundPosition: \\"xl0ducr\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { backgroundPosition: 'top start' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xgg80n4{background-position:top left}\\", 1, \\".xgg80n4{background-position:top right}\\");
        const styles = {
          x: {
            backgroundPosition: \\"xgg80n4\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value of "boxShadow" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { boxShadow: 'none' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1gnnqk1{box-shadow:none}\\", 1);
        const styles = {
          x: {
            boxShadow: \\"x1gnnqk1\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { boxShadow: '1px 1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xtgyqtp{box-shadow:1px 1px #000}\\", 1, \\".xtgyqtp{box-shadow:-1px 1px #000}\\");
        const styles = {
          x: {
            boxShadow: \\"xtgyqtp\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { boxShadow: '-1px -1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1d2r41h{box-shadow:-1px -1px #000}\\", 1, \\".x1d2r41h{box-shadow:1px -1px #000}\\");
        const styles = {
          x: {
            boxShadow: \\"x1d2r41h\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { boxShadow: 'inset 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1x0mpz7{box-shadow:inset 1px 1px #000}\\", 1, \\".x1x0mpz7{box-shadow:inset -1px 1px #000}\\");
        const styles = {
          x: {
            boxShadow: \\"x1x0mpz7\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { boxShadow: '1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1fumi7f{box-shadow:1px 1px 1px 1px #000}\\", 1, \\".x1fumi7f{box-shadow:-1px 1px 1px 1px #000}\\");
        const styles = {
          x: {
            boxShadow: \\"x1fumi7f\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { boxShadow: 'inset 1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1fs23zf{box-shadow:inset 1px 1px 1px 1px #000}\\", 1, \\".x1fs23zf{box-shadow:inset -1px 1px 1px 1px #000}\\");
        const styles = {
          x: {
            boxShadow: \\"x1fs23zf\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { boxShadow: '2px 2px 2px 2px red, inset 1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xtgmjod{box-shadow:2px 2px 2px 2px red,inset 1px 1px 1px 1px #000}\\", 1, \\".xtgmjod{box-shadow:-2px 2px 2px 2px red, inset -1px 1px 1px 1px #000}\\");
        const styles = {
          x: {
            boxShadow: \\"xtgmjod\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[legacy] value of "textShadow" property', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { textShadow: 'none' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x19pm5ym{text-shadow:none}\\", 1);
        const styles = {
          x: {
            textShadow: \\"x19pm5ym\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { textShadow: '1px 1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x12y90mb{text-shadow:1px 1px #000}\\", 1, \\".x12y90mb{text-shadow:-1px 1px #000}\\");
        const styles = {
          x: {
            textShadow: \\"x12y90mb\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { textShadow: '-1px -1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1l3mtsg{text-shadow:-1px -1px #000}\\", 1, \\".x1l3mtsg{text-shadow:1px -1px #000}\\");
        const styles = {
          x: {
            textShadow: \\"x1l3mtsg\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
      expect(
        transform(`
          const styles = stylex.create({ x: { textShadow: '1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x67hq7l{text-shadow:1px 1px 1px #000}\\", 1, \\".x67hq7l{text-shadow:-1px 1px 1px #000}\\");
        const styles = {
          x: {
            textShadow: \\"x67hq7l\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });
  });
});
