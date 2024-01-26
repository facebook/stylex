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
    plugins: [[stylexPlugin, { runtimeInjection: true, ...opts }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
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
          import stylex from 'stylex';
          const styles = stylex.create({ x: { clear: 'inline-end' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xof8tvn{clear:inline-end}", 3000);
        const classnames = "xof8tvn";"
      `);
    });

    test('value "inline-start" for "clear" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { clear: 'inline-start' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x18lmvvi{clear:inline-start}", 3000);
        const classnames = "x18lmvvi";"
      `);
    });

    test('value "inline-end" for "float" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { float: 'inline-end' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1h0q493{float:inline-end}", 3000);
        const classnames = "x1h0q493";"
      `);
    });

    test('value "inline-start" for "float" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { float: 'inline-start' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1kmio9f{float:inline-start}", 3000);
        const classnames = "x1kmio9f";"
      `);
    });

    test('value "end" for "textAlign" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textAlign: 'end' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xp4054r{text-align:right}", 3000, ".xp4054r{text-align:left}");
        const classnames = "xp4054r";"
      `);
    });

    test('value "start" for "textAlign" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textAlign: 'start' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1yc453h{text-align:left}", 3000, ".x1yc453h{text-align:right}");
        const classnames = "x1yc453h";"
      `);
    });

    /**
     * Non-standard values
     */

    test('[non-standard] value "end" (aka "inlineEnd") for "clear" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { clear: 'end' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xodj72a{clear:right}", 3000, ".xodj72a{clear:left}");
        const classnames = "xodj72a";"
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "clear" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { clear: 'start' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x390i0x{clear:left}", 3000, ".x390i0x{clear:right}");
        const classnames = "x390i0x";"
      `);
    });

    test('[non-standard] value "end" (aka "inlineEnd") for "float" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { float: 'end' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1guec7k{float:right}", 3000, ".x1guec7k{float:left}");
        const classnames = "x1guec7k";"
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "float" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { float: 'start' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrbpyxo{float:left}", 3000, ".xrbpyxo{float:right}");
        const classnames = "xrbpyxo";"
      `);
    });

    /**
     * Non-standard bidi transforms
     */

    test('[legacy] value "e-resize" for "cursor" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'e-resize' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x14mnfz1{cursor:e-resize}", 3000, ".x14mnfz1{cursor:w-resize}");
        const classnames = "x14mnfz1";"
      `);
    });

    test('[legacy] value "w-resize" for "cursor" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'w-resize' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x14isd7o{cursor:w-resize}", 3000, ".x14isd7o{cursor:e-resize}");
        const classnames = "x14isd7o";"
      `);
    });

    test('[legacy] value "ne-resize" for "cursor" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'ne-resize' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xc7edbc{cursor:ne-resize}", 3000, ".xc7edbc{cursor:nw-resize}");
        const classnames = "xc7edbc";"
      `);
    });

    test('[legacy] value "nw-resize" for "cursor" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'nw-resize' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrpsa6j{cursor:nw-resize}", 3000, ".xrpsa6j{cursor:ne-resize}");
        const classnames = "xrpsa6j";"
      `);
    });

    test('[legacy] value "se-resize" for "cursor" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'se-resize' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xp35lg9{cursor:se-resize}", 3000, ".xp35lg9{cursor:sw-resize}");
        const classnames = "xp35lg9";"
      `);
    });

    test('[legacy] value "sw-resize" for "cursor" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'sw-resize' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1egwzy8{cursor:sw-resize}", 3000, ".x1egwzy8{cursor:se-resize}");
        const classnames = "x1egwzy8";"
      `);
    });

    /**
     * Legacy transforms
     * TODO(#33): Remove once support for multi-sided values is removed from shortforms.
     */

    test('[legacy] value of "animationName" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { animationName: 'ignore' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x13xdq3h{animation-name:ignore}", 3000);
        const classnames = "x13xdq3h";"
      `);
    });

    test('[legacy] value of "backgroundPosition" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { backgroundPosition: 'top end' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xl0ducr{background-position:top right}", 2000, ".xl0ducr{background-position:top left}");
        const classnames = "xl0ducr";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { backgroundPosition: 'top start' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xgg80n4{background-position:top left}", 2000, ".xgg80n4{background-position:top right}");
        const classnames = "xgg80n4";"
      `);
    });

    test('[legacy] value of "boxShadow" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: 'none' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1gnnqk1{box-shadow:none}", 3000);
        const classnames = "x1gnnqk1";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '1px 1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xtgyqtp{box-shadow:1px 1px #000}", 3000, ".xtgyqtp{box-shadow:-1px 1px #000}");
        const classnames = "xtgyqtp";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '-1px -1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1d2r41h{box-shadow:-1px -1px #000}", 3000, ".x1d2r41h{box-shadow:1px -1px #000}");
        const classnames = "x1d2r41h";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: 'inset 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1x0mpz7{box-shadow:inset 1px 1px #000}", 3000, ".x1x0mpz7{box-shadow:inset -1px 1px #000}");
        const classnames = "x1x0mpz7";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1fumi7f{box-shadow:1px 1px 1px 1px #000}", 3000, ".x1fumi7f{box-shadow:-1px 1px 1px 1px #000}");
        const classnames = "x1fumi7f";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: 'inset 1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1fs23zf{box-shadow:inset 1px 1px 1px 1px #000}", 3000, ".x1fs23zf{box-shadow:inset -1px 1px 1px 1px #000}");
        const classnames = "x1fs23zf";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '2px 2px 2px 2px red, inset 1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xtgmjod{box-shadow:2px 2px 2px 2px red,inset 1px 1px 1px 1px #000}", 3000, ".xtgmjod{box-shadow:-2px 2px 2px 2px red, inset -1px 1px 1px 1px #000}");
        const classnames = "xtgmjod";"
      `);
    });

    test('[legacy] value of "textShadow" property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: 'none' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x19pm5ym{text-shadow:none}", 3000);
        const classnames = "x19pm5ym";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: '1px 1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x12y90mb{text-shadow:1px 1px #000}", 3000, ".x12y90mb{text-shadow:-1px 1px #000}");
        const classnames = "x12y90mb";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: '-1px -1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1l3mtsg{text-shadow:-1px -1px #000}", 3000, ".x1l3mtsg{text-shadow:1px -1px #000}");
        const classnames = "x1l3mtsg";"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: '1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x67hq7l{text-shadow:1px 1px 1px #000}", 3000, ".x67hq7l{text-shadow:-1px 1px 1px #000}");
        const classnames = "x67hq7l";"
      `);
    });
  });
});
