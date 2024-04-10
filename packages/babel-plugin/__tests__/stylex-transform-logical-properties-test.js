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
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [[stylexPlugin, { ...opts, runtimeInjection: true }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  /**
   * CSS logical properties transform
   */

  describe('[transform] CSS logical properties', () => {
    /* Border colors */

    test('"borderBlockColor"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockColor: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ed0pl6{border-block-color:0px}", 3000);
        const classnames = "x1ed0pl6";"
      `);
    });

    test('"borderBlockStartColor"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockStartColor: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1g2d423{border-top-color:0px}", 3000);
        const classnames = "x1g2d423";"
      `);
    });

    test('"borderBlockEndColor"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockEndColor: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1uxq421{border-bottom-color:0px}", 4000);
        const classnames = "x1uxq421";"
      `);
    });

    test('"borderInlineColor"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineColor: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1mdkzvo{border-inline-color:0px}", 2000);
        const classnames = "x1mdkzvo";"
      `);
    });

    test('"borderInlineStartColor"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineStartColor: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x9qt5s6{border-inline-start-color:0px}", 3000);
        const classnames = "x9qt5s6";"
      `);
    });

    test('"borderInlineEndColor"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineEndColor: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xmt3h97{border-inline-end-color:0px}", 3000);
        const classnames = "xmt3h97";"
      `);
    });

    /* Border styles */

    test('"borderBlockStyle"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockStyle: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xyinpli{border-block-style:0px}", 3000);
        const classnames = "xyinpli";"
      `);
    });

    test('"borderBlockStartStyle"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockStartStyle: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1vwv6rm{border-top-style:0px}", 3000);
        const classnames = "x1vwv6rm";"
      `);
    });

    test('"borderBlockEndStyle"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockEndStyle: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xpdgvxk{border-bottom-style:0px}", 4000);
        const classnames = "xpdgvxk";"
      `);
    });

    test('"borderInlineStyle"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineStyle: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xn5gpj6{border-inline-style:0px}", 2000);
        const classnames = "xn5gpj6";"
      `);
    });

    test('"borderInlineStartStyle"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineStartStyle: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1jac53v{border-inline-start-style:0px}", 3000);
        const classnames = "x1jac53v";"
      `);
    });

    test('"borderInlineEndStyle"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineEndStyle: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xepdarh{border-inline-end-style:0px}", 3000);
        const classnames = "xepdarh";"
      `);
    });

    /* Border widths */

    test('"borderBlockWidth"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockWidth: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1of20wf{border-block-width:0px}", 3000);
        const classnames = "x1of20wf";"
      `);
    });

    test('"borderBlockStartWidth"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockStartWidth: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ptnzft{border-top-width:0px}", 3000);
        const classnames = "x1ptnzft";"
      `);
    });

    test('"borderBlockEndWidth"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderBlockEndWidth: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1n5ok7h{border-bottom-width:0px}", 4000);
        const classnames = "x1n5ok7h";"
      `);
    });

    test('"borderInlineWidth"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineWidth: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1p0apqc{border-inline-width:0px}", 2000);
        const classnames = "x1p0apqc";"
      `);
    });

    test('"borderInlineStartWidth"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineStartWidth: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xt32w6p{border-inline-start-width:0px}", 3000);
        const classnames = "xt32w6p";"
      `);
    });

    test('"borderInlineEndWidth"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { borderInlineEndWidth: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ljmqpl{border-inline-end-width:0px}", 3000);
        const classnames = "x1ljmqpl";"
      `);
    });

    /* Position offsets */

    test('"insetBlockStart"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { insetBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x9oc6z4{top:0px}", 4000);
        const classnames = "x9oc6z4";"
      `);
    });

    test('"insetBlock"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { insetBlock: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1yutot1{inset-block:0px}", 2000);
        const classnames = "x1yutot1";"
      `);
    });

    test('"insetBlockEnd"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { insetBlockEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1sh2tzk{bottom:0px}", 4000);
        const classnames = "x1sh2tzk";"
      `);
    });

    test('"insetBlockStart"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { insetBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x9oc6z4{top:0px}", 4000);
        const classnames = "x9oc6z4";"
      `);
    });

    test('"insetInline"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { insetInline: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xl33w4x{inset-inline:0px}", 2000);
        const classnames = "xl33w4x";"
      `);
    });

    test('"insetInlineEnd"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { insetInlineEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xhw0b42{inset-inline-end:0px}", 3000);
        const classnames = "xhw0b42";"
      `);
    });

    test('"insetInlineStart"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { insetInlineStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1at4hj2{inset-inline-start:0px}", 3000);
        const classnames = "x1at4hj2";"
      `);
    });

    /* Margins */

    test('"marginBlock"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginBlock: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1yslrto{margin-block:0px}", 2000);
        const classnames = "x1yslrto";"
      `);
    });

    test('"marginBlockEnd"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginBlockEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1du4iog{margin-bottom:0px}", 4000);
        const classnames = "x1du4iog";"
      `);
    });

    test('"marginBlockStart"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1q12cbh{margin-top:0px}", 4000);
        const classnames = "x1q12cbh";"
      `);
    });

    test('"marginInline"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginInline: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xmbzetd{margin-inline:0px}", 2000);
        const classnames = "xmbzetd";"
      `);
    });

    test('"marginInlineEnd"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginInlineEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xfbia9g{margin-inline-end:0px}", 3000);
        const classnames = "xfbia9g";"
      `);
    });

    test('"marginInlineStart"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginInlineStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1tt3wx9{margin-inline-start:0px}", 3000);
        const classnames = "x1tt3wx9";"
      `);
    });

    /* Padding */

    test('"paddingBlock"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingBlock: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xa87odg{padding-block:0px}", 2000);
        const classnames = "xa87odg";"
      `);
    });

    test('"paddingBlockEnd"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingBlockEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xw0v6cn{padding-bottom:0px}", 4000);
        const classnames = "xw0v6cn";"
      `);
    });

    test('"paddingBlockStart"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingBlockStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1uu4ab4{padding-top:0px}", 4000);
        const classnames = "x1uu4ab4";"
      `);
    });

    test('"paddingInline"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingInline: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1270q1i{padding-inline:0px}", 2000);
        const classnames = "x1270q1i";"
      `);
    });

    test('"paddingInlineEnd"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingInlineEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ib0srb{padding-inline-end:0px}", 3000);
        const classnames = "x1ib0srb";"
      `);
    });

    test('"paddingInlineStart"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingInlineStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x167wa4d{padding-inline-start:0px}", 3000);
        const classnames = "x167wa4d";"
      `);
    });

    /**
     * Non-standard properties
     */

    test('[non-standard] "end" (aka "insetInlineEnd")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { end: 5 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xceh6e4{inset-inline-end:5px}", 3000);
        const classnames = "xceh6e4";"
      `);
    });

    test('[non-standard] "marginEnd" (aka "marginInlineEnd")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xfbia9g{margin-inline-end:0px}", 3000);
        const classnames = "xfbia9g";"
      `);
    });

    test('[non-standard] "marginHorizontal" (aka "marginInline")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginHorizontal: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xmbzetd{margin-inline:0px}", 2000);
        const classnames = "xmbzetd";"
      `);
    });

    test('[non-standard] "marginStart" (aka "marginInlineStart")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1tt3wx9{margin-inline-start:0px}", 3000);
        const classnames = "x1tt3wx9";"
      `);
    });

    test('[non-standard] "marginVertical" (aka "marginBlock")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { marginVertical: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1yslrto{margin-block:0px}", 2000);
        const classnames = "x1yslrto";"
      `);
    });

    test('[non-standard] "paddingEnd" (aka "paddingInlineEnd")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingEnd: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ib0srb{padding-inline-end:0px}", 3000);
        const classnames = "x1ib0srb";"
      `);
    });

    test('[non-standard] "paddingHorizontal" (aka "paddingInline")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingHorizontal: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1270q1i{padding-inline:0px}", 2000);
        const classnames = "x1270q1i";"
      `);
    });

    test('[non-standard] "paddingStart" (aka "paddingInlineStart")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingStart: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x167wa4d{padding-inline-start:0px}", 3000);
        const classnames = "x167wa4d";"
      `);
    });

    test('[non-standard] "paddingVertical" (aka "paddingBlock")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { paddingVertical: 0 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xa87odg{padding-block:0px}", 2000);
        const classnames = "xa87odg";"
      `);
    });

    test('[non-standard] "start" (aka "insetInlineStart")', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { start: 5 } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1fb7gu6{inset-inline-start:5px}", 3000);
        const classnames = "x1fb7gu6";"
      `);
    });

    /**
     * Legacy transforms
     */

    test('[legacy] short-form property value flipping', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            four: {
              margin: '1 2 3 4',
            }
          });
          stylex(styles.four);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xi71r3n{margin:1 2 3 4}", 1000);
        "xi71r3n";"
      `);
    });
  });
});
