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
        const classnames = \\"x1lkbs04\\";"
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
        const classnames = \\"xk864d9\\";"
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
        const classnames = \\"xz8foqe\\";"
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
        const classnames = \\"x1v09clb\\";"
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
        const classnames = \\"x1t19a1o\\";"
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
        const classnames = \\"x14mj1wy\\";"
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
        const classnames = \\"x7mea6a\\";"
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
        const classnames = \\"xbg2y89\\";"
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
        const classnames = \\"x1yfoggo\\";"
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
        const classnames = \\"xt8kkye\\";"
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
        const classnames = \\"xl8mozw\\";"
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
        const classnames = \\"x10o505a\\";"
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
        const classnames = \\"x1616tdu\\";"
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
        const classnames = \\"xnh6zc7\\";"
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
        const classnames = \\"x1fvpbjb\\";"
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
        const classnames = \\"xuxrje7\\";"
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
        const classnames = \\"x14e42zd\\";"
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
        const classnames = \\"x10w94by\\";"
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
        const classnames = \\"xlb5a52\\";"
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
        const classnames = \\"x10no89f\\";"
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
        const classnames = \\"xuufnwz\\";"
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
        const classnames = \\"xlb5a52\\";"
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
        const classnames = \\"x17y0mx6\\";"
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
        const classnames = \\"xtijo5x\\";"
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
        const classnames = \\"x1o0tod\\";"
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
        const classnames = \\"x10im51j\\";"
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
        const classnames = \\"x1g8azq5\\";"
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
        const classnames = \\"x1rjqi9y\\";"
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
        const classnames = \\"xrxpjvj\\";"
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
        const classnames = \\"x14z9mp\\";"
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
        const classnames = \\"x1lziwak\\";"
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
        const classnames = \\"xt970qd\\";"
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
        const classnames = \\"x33s65n\\";"
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
        const classnames = \\"x1wpizmb\\";"
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
        const classnames = \\"xnjsko4\\";"
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
        const classnames = \\"xyri2b\\";"
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
        const classnames = \\"x1c1uobl\\";"
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
        const classnames = \\"xnx3k43\\";"
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
        const classnames = \\"x11i5rnm\\";"
      `);
    });

    test('[non-standard] "marginHorizontal" (aka "marginInline")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { marginHorizontal: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1mh8g0r{margin-left:0}\\", 1, \\".x1mh8g0r{margin-right:0}\\");
        stylex.inject(\\".x11i5rnm{margin-right:0}\\", 1, \\".x11i5rnm{margin-left:0}\\");
        const classnames = \\"x1mh8g0r x11i5rnm\\";"
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
        const classnames = \\"x1mh8g0r\\";"
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
        const classnames = \\"xdj266r xat24cr\\";"
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
        const classnames = \\"x4uap5\\";"
      `);
    });

    test('[non-standard] "paddingHorizontal" (aka "paddingInline")', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { paddingHorizontal: 0 } });
          const classnames = stylex(styles.x);
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xkhd6sd{padding-left:0}\\", 1, \\".xkhd6sd{padding-right:0}\\");
        stylex.inject(\\".x4uap5{padding-right:0}\\", 1, \\".x4uap5{padding-left:0}\\");
        const classnames = \\"xkhd6sd x4uap5\\";"
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
        const classnames = \\"xkhd6sd\\";"
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
        const classnames = \\"xexx8yu x18d9i69\\";"
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
        const classnames = \\"xq7jlbq\\";"
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
        \\"x14bfre8 xhi7eei x1p2gmtr x15l52qr\\";"
      `);
    });
  });
});
