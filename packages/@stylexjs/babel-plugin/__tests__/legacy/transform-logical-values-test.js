/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../../src/index');

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
        _inject2({
          ltr: ".xof8tvn{clear:right}",
          rtl: ".xof8tvn{clear:left}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".x18lmvvi{clear:left}",
          rtl: ".x18lmvvi{clear:right}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".x1h0q493{float:right}",
          rtl: ".x1h0q493{float:left}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".x1kmio9f{float:left}",
          rtl: ".x1kmio9f{float:right}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".xp4054r{text-align:end}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".x1yc453h{text-align:start}",
          priority: 3000
        });
        const classnames = "x1yc453h";"
      `);
    });

    /**
     * Non-standard bidi transforms
     */

    test('[legacy] value "e-resize" for "cursor" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'e-resize' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x14mnfz1{cursor:e-resize}",
          rtl: ".x14mnfz1{cursor:w-resize}",
          priority: 3000
        });
        const classnames = "x14mnfz1";"
      `);
    });

    test('[legacy] value "w-resize" for "cursor" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'w-resize' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x14isd7o{cursor:w-resize}",
          rtl: ".x14isd7o{cursor:e-resize}",
          priority: 3000
        });
        const classnames = "x14isd7o";"
      `);
    });

    test('[legacy] value "ne-resize" for "cursor" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'ne-resize' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xc7edbc{cursor:ne-resize}",
          rtl: ".xc7edbc{cursor:nw-resize}",
          priority: 3000
        });
        const classnames = "xc7edbc";"
      `);
    });

    test('[legacy] value "nw-resize" for "cursor" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'nw-resize' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xrpsa6j{cursor:nw-resize}",
          rtl: ".xrpsa6j{cursor:ne-resize}",
          priority: 3000
        });
        const classnames = "xrpsa6j";"
      `);
    });

    test('[legacy] value "se-resize" for "cursor" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'se-resize' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xp35lg9{cursor:se-resize}",
          rtl: ".xp35lg9{cursor:sw-resize}",
          priority: 3000
        });
        const classnames = "xp35lg9";"
      `);
    });

    test('[legacy] value "sw-resize" for "cursor" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { cursor: 'sw-resize' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1egwzy8{cursor:sw-resize}",
          rtl: ".x1egwzy8{cursor:se-resize}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".x13xdq3h{animation-name:ignore}",
          priority: 3000
        });
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
        _inject2({
          ltr: ".xl0ducr{background-position:top right}",
          rtl: ".xl0ducr{background-position:top left}",
          priority: 2000
        });
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
        _inject2({
          ltr: ".xgg80n4{background-position:top left}",
          rtl: ".xgg80n4{background-position:top right}",
          priority: 2000
        });
        const classnames = "xgg80n4";"
      `);
    });

    test('[legacy] value of "paddingInline" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            x: {
              animationName: stylex.keyframes({
                '0%': {
                  paddingInline: '1px 2px'
                },
                '100%': {
                  paddingInline: '10px 20px'
                }
              })
            }
          });
          const classnames = stylex(styles.x);
        `,
          {
            enableLogicalStylesPolyfill: true,
            styleResolution: 'legacy-expand-shorthands',
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: "@keyframes x4skwlr-B{0%{padding-left:1px;padding-right:2px;}100%{padding-left:10px;padding-right:20px;}}",
          rtl: "@keyframes x4skwlr-B{0%{padding-right:1px;padding-left:2px;}100%{padding-right:10px;padding-left:20px;}}",
          priority: 0
        });
        _inject2({
          ltr: ".xzebctn{animation-name:x4skwlr-B}",
          priority: 3000
        });
        const classnames = "xzebctn";"
      `);

      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            x: {
              animationName: stylex.keyframes({
                '0%': {
                  paddingInline: '1px 2px'
                },
                '100%': {
                  paddingInline: '10px 20px'
                }
              })
            }
          });
          const classnames = stylex(styles.x);
        `,
          {
            enableLogicalStylesPolyfill: false,
            styleResolution: 'legacy-expand-shorthands',
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: "@keyframes x4skwlr-B{0%{padding-inline-start:1px;padding-inline-end:2px;}100%{padding-inline-start:10px;padding-inline-end:20px;}}",
          priority: 0
        });
        _inject2({
          ltr: ".xzebctn{animation-name:x4skwlr-B}",
          priority: 3000
        });
        const classnames = "xzebctn";"
      `);
    });

    test('[legacy] value of "boxShadow" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            x: {
              animationName: stylex.keyframes({
                '0%': {
                  boxShadow: '1px 2px 3px 4px red'
                },
                '100%': {
                  boxShadow: '10px 20px 30px 40px green'
                }
              })
            }
          });
          const classnames = stylex(styles.x);
        `,
          {
            enableLegacyValueFlipping: true,
            styleResolution: 'legacy-expand-shorthands',
          },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: "@keyframes x19mpx8i-B{0%{box-shadow:1px 2px 3px 4px red;}100%{box-shadow:10px 20px 30px 40px green;}}",
          priority: 0
        });
        _inject2({
          ltr: ".x14pamct{animation-name:x19mpx8i-B}",
          priority: 3000
        });
        const classnames = "x14pamct";"
      `);

      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: 'none' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1gnnqk1{box-shadow:none}",
          priority: 3000
        });
        const classnames = "x1gnnqk1";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '1px 1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xtgyqtp{box-shadow:1px 1px #000}",
          rtl: ".xtgyqtp{box-shadow:-1px 1px #000}",
          priority: 3000
        });
        const classnames = "xtgyqtp";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '-1px -1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1d2r41h{box-shadow:-1px -1px #000}",
          rtl: ".x1d2r41h{box-shadow:1px -1px #000}",
          priority: 3000
        });
        const classnames = "x1d2r41h";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: 'inset 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1x0mpz7{box-shadow:inset 1px 1px #000}",
          rtl: ".x1x0mpz7{box-shadow:inset -1px 1px #000}",
          priority: 3000
        });
        const classnames = "x1x0mpz7";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1fumi7f{box-shadow:1px 1px 1px 1px #000}",
          rtl: ".x1fumi7f{box-shadow:-1px 1px 1px 1px #000}",
          priority: 3000
        });
        const classnames = "x1fumi7f";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: 'inset 1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1fs23zf{box-shadow:inset 1px 1px 1px 1px #000}",
          rtl: ".x1fs23zf{box-shadow:inset -1px 1px 1px 1px #000}",
          priority: 3000
        });
        const classnames = "x1fs23zf";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { boxShadow: '2px 2px 2px 2px red, inset 1px 1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xtgmjod{box-shadow:2px 2px 2px 2px red,inset 1px 1px 1px 1px #000}",
          rtl: ".xtgmjod{box-shadow:-2px 2px 2px 2px red,inset -1px 1px 1px 1px #000}",
          priority: 3000
        });
        const classnames = "xtgmjod";"
      `);
    });

    test('[legacy] value of "textShadow" property', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: 'none' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x19pm5ym{text-shadow:none}",
          priority: 3000
        });
        const classnames = "x19pm5ym";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: '1px 1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x12y90mb{text-shadow:1px 1px #000}",
          rtl: ".x12y90mb{text-shadow:-1px 1px #000}",
          priority: 3000
        });
        const classnames = "x12y90mb";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: '-1px -1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1l3mtsg{text-shadow:-1px -1px #000}",
          rtl: ".x1l3mtsg{text-shadow:1px -1px #000}",
          priority: 3000
        });
        const classnames = "x1l3mtsg";"
      `);
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({ x: { textShadow: '1px 1px 1px #000' } });
          const classnames = stylex(styles.x);
        `,
          { enableLegacyValueFlipping: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x67hq7l{text-shadow:1px 1px 1px #000}",
          rtl: ".x67hq7l{text-shadow:-1px 1px 1px #000}",
          priority: 3000
        });
        const classnames = "x67hq7l";"
      `);
    });
  });
});
