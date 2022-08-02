/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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
   * CSS logical properties transform
   */

  describe('[transform] CSS logical properties', () => {
    /* Border colors */

    test('"borderBlockColor"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockColor: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1lkbs04{border-block-color:0}\\", 1);
        const styles = {
          x: {
            borderBlockColor: \\"x1lkbs04\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderBlockStartColor"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockStartColor: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xk864d9{border-block-start-color:0}\\", 1);
        const styles = {
          x: {
            borderBlockStartColor: \\"xk864d9\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderBlockEndColor"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockEndColor: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xz8foqe{border-block-end-color:0}\\", 1);
        const styles = {
          x: {
            borderBlockEndColor: \\"xz8foqe\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineColor"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineColor: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1v09clb{border-inline-color:0}\\", 1);
        const styles = {
          x: {
            borderInlineColor: \\"x1v09clb\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineStartColor"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineStartColor: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1t19a1o{border-inline-start-color:0}\\", 1);
        const styles = {
          x: {
            borderInlineStartColor: \\"x1t19a1o\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineEndColor"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineEndColor: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x14mj1wy{border-inline-end-color:0}\\", 1);
        const styles = {
          x: {
            borderInlineEndColor: \\"x14mj1wy\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /* Border styles */

    test('"borderBlockStyle"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockStyle: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x7mea6a{border-block-style:0}\\", 1);
        const styles = {
          x: {
            borderBlockStyle: \\"x7mea6a\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderBlockStartStyle"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockStartStyle: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xbg2y89{border-block-start-style:0}\\", 1);
        const styles = {
          x: {
            borderBlockStartStyle: \\"xbg2y89\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderBlockEndStyle"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockEndStyle: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1yfoggo{border-block-end-style:0}\\", 1);
        const styles = {
          x: {
            borderBlockEndStyle: \\"x1yfoggo\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineStyle"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineStyle: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xt8kkye{border-inline-style:0}\\", 1);
        const styles = {
          x: {
            borderInlineStyle: \\"xt8kkye\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineStartStyle"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineStartStyle: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xl8mozw{border-inline-start-style:0}\\", 1);
        const styles = {
          x: {
            borderInlineStartStyle: \\"xl8mozw\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineEndStyle"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineEndStyle: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x10o505a{border-inline-end-style:0}\\", 1);
        const styles = {
          x: {
            borderInlineEndStyle: \\"x10o505a\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /* Border widths */

    test('"borderBlockWidth"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockWidth: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1616tdu{border-block-width:0}\\", 1);
        const styles = {
          x: {
            borderBlockWidth: \\"x1616tdu\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderBlockStartWidth"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockStartWidth: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xnh6zc7{border-block-start-width:0}\\", 1);
        const styles = {
          x: {
            borderBlockStartWidth: \\"xnh6zc7\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderBlockEndWidth"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderBlockEndWidth: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1fvpbjb{border-block-end-width:0}\\", 1);
        const styles = {
          x: {
            borderBlockEndWidth: \\"x1fvpbjb\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineWidth"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineWidth: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xuxrje7{border-inline-width:0}\\", 1);
        const styles = {
          x: {
            borderInlineWidth: \\"xuxrje7\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineStartWidth"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineStartWidth: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x14e42zd{border-inline-start-width:0}\\", 1);
        const styles = {
          x: {
            borderInlineStartWidth: \\"x14e42zd\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"borderInlineEndWidth"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { borderInlineEndWidth: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x10w94by{border-inline-end-width:0}\\", 1);
        const styles = {
          x: {
            borderInlineEndWidth: \\"x10w94by\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /* Position offsets */

    test('"insetBlockStart"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { insetBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xlb5a52{inset-block-start:0}\\", 1);
        const styles = {
          x: {
            insetBlockStart: \\"xlb5a52\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"insetBlock"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { insetBlock: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x10no89f{inset-block:0}\\", 1);
        const styles = {
          x: {
            insetBlock: \\"x10no89f\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"insetBlockEnd"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { insetBlockEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xuufnwz{inset-block-end:0}\\", 1);
        const styles = {
          x: {
            insetBlockEnd: \\"xuufnwz\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"insetBlockStart"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { insetBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xlb5a52{inset-block-start:0}\\", 1);
        const styles = {
          x: {
            insetBlockStart: \\"xlb5a52\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"insetInline"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { insetInline: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x17y0mx6{inset-inline:0}\\", 1);
        const styles = {
          x: {
            insetInline: \\"x17y0mx6\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"insetInlineEnd"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { insetInlineEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xtijo5x{inset-inline-end:0}\\", 1);
        const styles = {
          x: {
            insetInlineEnd: \\"xtijo5x\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"insetInlineStart"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { insetInlineStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1o0tod{inset-inline-start:0}\\", 1);
        const styles = {
          x: {
            insetInlineStart: \\"x1o0tod\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /* Margins */

    test('"marginBlock"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginBlock: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x10im51j{margin-block:0}\\", 1);
        const styles = {
          x: {
            marginBlock: \\"x10im51j\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"marginBlockEnd"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginBlockEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1g8azq5{margin-block-end:0}\\", 1);
        const styles = {
          x: {
            marginBlockEnd: \\"x1g8azq5\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"marginBlockStart"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1rjqi9y{margin-block-start:0}\\", 1);
        const styles = {
          x: {
            marginBlockStart: \\"x1rjqi9y\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"marginInline"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginInline: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xrxpjvj{margin-inline:0}\\", 1);
        const styles = {
          x: {
            marginInline: \\"xrxpjvj\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"marginInlineEnd"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginInlineEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x14z9mp{margin-inline-end:0}\\", 1);
        const styles = {
          x: {
            marginInlineEnd: \\"x14z9mp\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"marginInlineStart"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginInlineStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1lziwak{margin-inline-start:0}\\", 1);
        const styles = {
          x: {
            marginInlineStart: \\"x1lziwak\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /* Padding */

    test('"paddingBlock"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingBlock: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xt970qd{padding-block:0}\\", 1);
        const styles = {
          x: {
            paddingBlock: \\"xt970qd\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"paddingBlockEnd"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingBlockEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x33s65n{padding-block-end:0}\\", 1);
        const styles = {
          x: {
            paddingBlockEnd: \\"x33s65n\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"paddingBlockStart"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1wpizmb{padding-block-start:0}\\", 1);
        const styles = {
          x: {
            paddingBlockStart: \\"x1wpizmb\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"paddingInline"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingInline: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xnjsko4{padding-inline:0}\\", 1);
        const styles = {
          x: {
            paddingInline: \\"xnjsko4\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"paddingInlineEnd"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingInlineEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xyri2b{padding-inline-end:0}\\", 1);
        const styles = {
          x: {
            paddingInlineEnd: \\"xyri2b\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('"paddingInlineStart"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingInlineStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1c1uobl{padding-inline-start:0}\\", 1);
        const styles = {
          x: {
            paddingInlineStart: \\"x1c1uobl\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /**
     * Non-standard properties
     */

    test('[non-standard] "end" (aka "insetInlineEnd")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { end: 5 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xnx3k43{right:5px}\\", 1, \\".xnx3k43{left:5px}\\");
        const styles = {
          x: {
            end: \\"xnx3k43\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "marginEnd" (aka "marginInlineEnd")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x11i5rnm{margin-right:0}\\", 1, \\".x11i5rnm{margin-left:0}\\");
        const styles = {
          x: {
            marginEnd: \\"x11i5rnm\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "marginHorizontal" (aka "marginInline")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginHorizontal: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x11i5rnm{margin-right:0}\\", 1, \\".x11i5rnm{margin-left:0}\\");
        stylex.inject(\\".x1mh8g0r{margin-left:0}\\", 1, \\".x1mh8g0r{margin-right:0}\\");
        const styles = {
          x: {
            marginEnd: \\"x11i5rnm\\",
            marginStart: \\"x1mh8g0r\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "marginStart" (aka "marginInlineStart")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1mh8g0r{margin-left:0}\\", 1, \\".x1mh8g0r{margin-right:0}\\");
        const styles = {
          x: {
            marginStart: \\"x1mh8g0r\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "marginVertical" (aka "marginBlock")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginVertical: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xdj266r{margin-top:0}\\", 1);
        stylex.inject(\\".xat24cr{margin-bottom:0}\\", 1);
        const styles = {
          x: {
            marginTop: \\"xdj266r\\",
            marginBottom: \\"xat24cr\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "paddingEnd" (aka "paddingInlineEnd")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingEnd: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x4uap5{padding-right:0}\\", 1, \\".x4uap5{padding-left:0}\\");
        const styles = {
          x: {
            paddingEnd: \\"x4uap5\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "paddingHorizontal" (aka "paddingInline")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingHorizontal: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x4uap5{padding-right:0}\\", 1, \\".x4uap5{padding-left:0}\\");
        stylex.inject(\\".xkhd6sd{padding-left:0}\\", 1, \\".xkhd6sd{padding-right:0}\\");
        const styles = {
          x: {
            paddingEnd: \\"x4uap5\\",
            paddingStart: \\"xkhd6sd\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "paddingStart" (aka "paddingInlineStart")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingStart: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xkhd6sd{padding-left:0}\\", 1, \\".xkhd6sd{padding-right:0}\\");
        const styles = {
          x: {
            paddingStart: \\"xkhd6sd\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "paddingVertical" (aka "paddingBlock")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingVertical: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xexx8yu{padding-top:0}\\", 1);
        stylex.inject(\\".x18d9i69{padding-bottom:0}\\", 1);
        const styles = {
          x: {
            paddingTop: \\"xexx8yu\\",
            paddingBottom: \\"x18d9i69\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    test('[non-standard] "start" (aka "insetInlineStart")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { start: 5 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xq7jlbq{left:5px}\\", 1, \\".xq7jlbq{right:5px}\\");
        const styles = {
          x: {
            start: \\"xq7jlbq\\"
          }
        };
        const classnames = stylex(styles.x);"
      `);
    });

    /**
     * Legacy transforms
     */

    test('[legacy] short-form property value flipping', () => {
      expect(
        transform(`
          const styles = stylex.create({
            four: {
              margin: '1 2 3 4',
            }
          });
          stylex(styles.four);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x14bfre8{margin-top:1}\\", 1);
        stylex.inject(\\".xhi7eei{margin-right:2}\\", 1, \\".xhi7eei{margin-left:2}\\");
        stylex.inject(\\".x1p2gmtr{margin-bottom:3}\\", 1);
        stylex.inject(\\".x15l52qr{margin-left:4}\\", 1, \\".x15l52qr{margin-right:4}\\");
        \\"x15l52qr x1p2gmtr xhi7eei x14bfre8\\";"
      `);
    });
  });
});
