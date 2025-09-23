/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../../src/index';

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
   * Non-standard CSS polyfills
   * These are deprecated and should be removed once Meta has migrated off them.
   */
  describe('[transform] CSS property polyfills (styleResolution: application-order)', () => {
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

  describe('[transform] CSS value polyfills (styleResolution: application-order)', () => {
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
              "x1s2rbg3",
              {
                "ltr": ".x1s2rbg3{clear:var(--1t497je)}",
                "rtl": null,
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
              "xnaenqf",
              {
                "ltr": ".xnaenqf{clear:var(--1bs9lmi)}",
                "rtl": null,
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
              "x1vdj7i2",
              {
                "ltr": ".x1vdj7i2{float:var(--1t497je)}",
                "rtl": null,
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
              "x3e4l88",
              {
                "ltr": ".x3e4l88{float:var(--1bs9lmi)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });
  });

  describe('[transform] CSS property polyfills (styleResolution: legacy-expand-shorthands and enableLogicalStylesPolyfill: true)', () => {
    const legacyOpts = {
      enableLogicalStylesPolyfill: true,
      styleResolution: 'legacy-expand-shorthands',
    };

    test('[non-standard] "end" (aka "insetInlineEnd")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { end: 5 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xceh6e4",
              {
                "ltr": ".xceh6e4{right:5px}",
                "rtl": ".xceh6e4{left:5px}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginEnd" (aka "marginInlineEnd")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginEnd: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x14z9mp",
              {
                "ltr": ".x14z9mp{margin-right:0}",
                "rtl": ".x14z9mp{margin-left:0}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginHorizontal" (aka "marginInline")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginHorizontal: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1lziwak",
              {
                "ltr": ".x1lziwak{margin-left:0}",
                "rtl": ".x1lziwak{margin-right:0}",
              },
              3000,
            ],
            [
              "x14z9mp",
              {
                "ltr": ".x14z9mp{margin-right:0}",
                "rtl": ".x14z9mp{margin-left:0}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginStart" (aka "marginInlineStart")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginStart: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1lziwak",
              {
                "ltr": ".x1lziwak{margin-left:0}",
                "rtl": ".x1lziwak{margin-right:0}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "marginVertical" (aka "marginBlock")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginVertical: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xdj266r",
              {
                "ltr": ".xdj266r{margin-top:0}",
                "rtl": null,
              },
              4000,
            ],
            [
              "xat24cr",
              {
                "ltr": ".xat24cr{margin-bottom:0}",
                "rtl": null,
              },
              4000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingEnd" (aka "paddingInlineEnd")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingEnd: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xyri2b",
              {
                "ltr": ".xyri2b{padding-right:0}",
                "rtl": ".xyri2b{padding-left:0}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingHorizontal" (aka "paddingInline")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingHorizontal: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1c1uobl",
              {
                "ltr": ".x1c1uobl{padding-left:0}",
                "rtl": ".x1c1uobl{padding-right:0}",
              },
              3000,
            ],
            [
              "xyri2b",
              {
                "ltr": ".xyri2b{padding-right:0}",
                "rtl": ".xyri2b{padding-left:0}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingStart" (aka "paddingInlineStart")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingStart: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1c1uobl",
              {
                "ltr": ".x1c1uobl{padding-left:0}",
                "rtl": ".x1c1uobl{padding-right:0}",
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingVertical" (aka "paddingBlock")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingVertical: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xexx8yu",
              {
                "ltr": ".xexx8yu{padding-top:0}",
                "rtl": null,
              },
              4000,
            ],
            [
              "x18d9i69",
              {
                "ltr": ".x18d9i69{padding-bottom:0}",
                "rtl": null,
              },
              4000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "start" (aka "insetInlineStart")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { start: 5 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1fb7gu6",
              {
                "ltr": ".x1fb7gu6{left:5px}",
                "rtl": ".x1fb7gu6{right:5px}",
              },
              3000,
            ],
          ],
        }
      `);
    });
  });

  describe('[transform] CSS value polyfills (styleResolution: legacy-expand-shorthands and enableLogicalStylesPolyfill: true)', () => {
    const legacyOpts = {
      enableLogicalStylesPolyfill: true,
      styleResolution: 'legacy-expand-shorthands',
    };

    test('[non-standard] value "end" (aka "inlineEnd") for "clear" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { clear: 'end' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1s2rbg3",
              {
                "ltr": ".x1s2rbg3{clear:var(--1t497je)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "clear" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { clear: 'start' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xnaenqf",
              {
                "ltr": ".xnaenqf{clear:var(--1bs9lmi)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "end" (aka "inlineEnd") for "float" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { float: 'end' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1vdj7i2",
              {
                "ltr": ".x1vdj7i2{float:var(--1t497je)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "float" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { float: 'start' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x3e4l88",
              {
                "ltr": ".x3e4l88{float:var(--1bs9lmi)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });
  });

  describe('[transform] CSS property polyfills (styleResolution: legacy-expand-shorthands and enableLogicalStylesPolyfill: false)', () => {
    const legacyOpts = {
      enableLogicalStylesPolyfill: false,
      styleResolution: 'legacy-expand-shorthands',
    };

    test('[non-standard] "end" (aka "insetInlineEnd")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { end: 5 } });
      `,
        legacyOpts,
      );
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
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginEnd: 0 } });
      `,
        legacyOpts,
      );
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
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginHorizontal: 0 } });
      `,
        legacyOpts,
      );
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

    test('[non-standard] "marginStart" (aka "marginInlineStart")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginStart: 0 } });
      `,
        legacyOpts,
      );
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
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { marginVertical: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xdj266r",
              {
                "ltr": ".xdj266r{margin-top:0}",
                "rtl": null,
              },
              4000,
            ],
            [
              "xat24cr",
              {
                "ltr": ".xat24cr{margin-bottom:0}",
                "rtl": null,
              },
              4000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "paddingEnd" (aka "paddingInlineEnd")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingEnd: 0 } });
      `,
        legacyOpts,
      );
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
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingHorizontal: 0 } });
      `,
        legacyOpts,
      );
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

    test('[non-standard] "paddingStart" (aka "paddingInlineStart")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingStart: 0 } });
      `,
        legacyOpts,
      );
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
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { paddingVertical: 0 } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xexx8yu",
              {
                "ltr": ".xexx8yu{padding-top:0}",
                "rtl": null,
              },
              4000,
            ],
            [
              "x18d9i69",
              {
                "ltr": ".x18d9i69{padding-bottom:0}",
                "rtl": null,
              },
              4000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] "start" (aka "insetInlineStart")', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { start: 5 } });
      `,
        legacyOpts,
      );
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

  describe('[transform] CSS value polyfills (styleResolution: legacy-expand-shorthands and enableLogicalStylesPolyfill: false)', () => {
    const legacyOpts = {
      enableLogicalStylesPolyfill: false,
      styleResolution: 'legacy-expand-shorthands',
    };

    test('[non-standard] value "end" (aka "inlineEnd") for "clear" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { clear: 'end' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1s2rbg3",
              {
                "ltr": ".x1s2rbg3{clear:var(--1t497je)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "clear" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { clear: 'start' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "xnaenqf",
              {
                "ltr": ".xnaenqf{clear:var(--1bs9lmi)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "end" (aka "inlineEnd") for "float" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { float: 'end' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x1vdj7i2",
              {
                "ltr": ".x1vdj7i2{float:var(--1t497je)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });

    test('[non-standard] value "start" (aka "inlineStart") for "float" property', () => {
      const { metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({ x: { float: 'start' } });
      `,
        legacyOpts,
      );
      expect(metadata).toMatchInlineSnapshot(`
        {
          "stylex": [
            [
              "x3e4l88",
              {
                "ltr": ".x3e4l88{float:var(--1bs9lmi)}",
                "rtl": null,
              },
              3000,
            ],
          ],
        }
      `);
    });
  });
});
