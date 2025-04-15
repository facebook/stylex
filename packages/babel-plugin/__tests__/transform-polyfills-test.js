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
  const { code, metadata } = transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [[stylexPlugin, opts]],
  });
  return { code, metadata };
}

describe('@stylexjs/babel-plugin', () => {
  /**
   * CSS polyfills
   */

  describe('[transform] CSS property polyfills', () => {
    test.skip('lineClamp', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { lineClamp: 3 } });
      `);

      expect(metadata).toMatchInlineSnapshot();
    });

    test.skip('pointerEvents', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({
          a: { pointerEvents: 'auto' },
          b: { pointerEvents: 'box-none' },
          c: { pointerEvents: 'box-only' },
          d: { pointerEvents: 'none' }
        });
      `);
      expect(metadata).toMatchInlineSnapshot();
    });

    test.skip('scrollbarWidth', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { scrollbarWidth: 'none' } });
      `);
      expect(metadata).toMatchInlineSnapshot();
    });

    /**
     * Non-standard properties
     * These are deprecated and should be removed once Meta has migrated off them.
     */

    test('[non-standard] "end" (aka "insetInlineEnd")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { end: 5 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xceh6e4",
              {
                "ltr": ".xceh6e4{inset-inline-end:5px}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginEnd" (aka "marginInlineEnd")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginEnd: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x14z9mp",
              {
                "ltr": ".x14z9mp{margin-inline-end:0}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginHorizontal" (aka "marginInline")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginHorizontal: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xrxpjvj",
              {
                "ltr": ".xrxpjvj{margin-inline:0}",
                "rtl": null,
              },
              2000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginStart" (aka "marginInlineStart")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginStart: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1lziwak",
              {
                "ltr": ".x1lziwak{margin-inline-start:0}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginVertical" (aka "marginBlock")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginVertical: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x10im51j",
              {
                "ltr": ".x10im51j{margin-block:0}",
                "rtl": null,
              },
              2000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingEnd" (aka "paddingInlineEnd")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingEnd: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xyri2b",
              {
                "ltr": ".xyri2b{padding-inline-end:0}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingHorizontal" (aka "paddingInline")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingHorizontal: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xnjsko4",
              {
                "ltr": ".xnjsko4{padding-inline:0}",
                "rtl": null,
              },
              2000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingStart" (aka "paddingInlineStart")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingStart: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1c1uobl",
              {
                "ltr": ".x1c1uobl{padding-inline-start:0}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingVertical" (aka "paddingBlock")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingVertical: 0 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xt970qd",
              {
                "ltr": ".xt970qd{padding-block:0}",
                "rtl": null,
              },
              2000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "start" (aka "insetInlineStart")', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { start: 5 } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1fb7gu6",
              {
                "ltr": ".x1fb7gu6{inset-inline-start:5px}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });
  });

  describe('[transform] CSS value polyfills', () => {
    /**
     * Non-standard values
     * These are deprecated and should be removed once Meta has migrated off them.
     */

    test('[non-standard] value "end" (aka "inlineEnd") for "clear" property', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { clear: 'end' } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xodj72a",
              {
                "ltr": ".xodj72a{clear:right}",
                "rtl": ".xodj72a{clear:left}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "clear" property', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { clear: 'start' } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x390i0x",
              {
                "ltr": ".x390i0x{clear:left}",
                "rtl": ".x390i0x{clear:right}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "end" (aka "inlineEnd") for "float" property', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { float: 'end' } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1guec7k",
              {
                "ltr": ".x1guec7k{float:right}",
                "rtl": ".x1guec7k{float:left}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "float" property', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { float: 'start' } });
      `);
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xrbpyxo",
              {
                "ltr": ".xrbpyxo{float:left}",
                "rtl": ".xrbpyxo{float:right}",
              },
              3000,
            ],
          ],
        }
      `);
    });
  });
});
