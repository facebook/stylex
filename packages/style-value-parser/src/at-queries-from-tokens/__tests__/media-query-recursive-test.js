/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { mediaInequalityRuleParser } from '../media-query';
import { MediaQueryRecursive } from '../media-query.js';

describe('Test CSS Type: @media queries', () => {
  test('@media screen', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media screen'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "screen",
          "not": false,
          "type": "media-keyword",
        },
      }
    `);
  });

  test('@media print', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media print'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "print",
          "not": false,
          "type": "media-keyword",
        },
      }
    `);
  });

  test('@media (width: 100px)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (width: 100px)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "width",
          "type": "pair",
          "value": {
            "signCharacter": undefined,
            "type": "integer",
            "unit": "px",
            "value": 100,
          },
        },
      }
    `);
  });

  test('@media (max-width: 50em)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (max-width: 50em)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "max-width",
          "type": "pair",
          "value": {
            "signCharacter": undefined,
            "type": "integer",
            "unit": "em",
            "value": 50,
          },
        },
      }
    `);
  });

  test('@media (orientation: landscape)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (orientation: landscape)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "orientation",
          "type": "pair",
          "value": "landscape",
        },
      }
    `);
  });

  test('@media not (monochrome)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media not (monochrome)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "keyValue": "monochrome",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media screen and (min-width: 400px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media screen and (min-width: 400px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "screen",
              "not": false,
              "type": "media-keyword",
            },
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 400,
              },
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-height: 600px) and (orientation: landscape)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-height: 600px) and (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-height",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 600,
              },
            },
            {
              "key": "orientation",
              "type": "pair",
              "value": "landscape",
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media screen and (device-aspect-ratio: 16/9)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media screen and (device-aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "screen",
              "not": false,
              "type": "media-keyword",
            },
            {
              "key": "device-aspect-ratio",
              "type": "pair",
              "value": [
                16,
                "/",
                9,
              ],
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (device-height: 500px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (device-height: 500px)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "device-height",
          "type": "pair",
          "value": {
            "signCharacter": undefined,
            "type": "integer",
            "unit": "px",
            "value": 500,
          },
        },
      }
    `);
  });

  test('@media (color)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (color)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "keyValue": "color",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media (color-index)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (color-index)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "keyValue": "color-index",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media (monochrome)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (monochrome)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "keyValue": "monochrome",
          "type": "word-rule",
        },
      }
    `);
  });

  // According to MDN, it should be `(grid: 1)` or `(grid: 0)`
  test('@media (grid)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (grid)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "keyValue": "grid",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media (update: fast)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (update: fast)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "update",
          "type": "pair",
          "value": "fast",
        },
      }
    `);
  });

  test('@media (overflow-block: scroll)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (overflow-block: scroll)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "overflow-block",
          "type": "pair",
          "value": "scroll",
        },
      }
    `);
  });

  test('@media (display-mode: fullscreen)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (display-mode: fullscreen)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "fullscreen",
        },
      }
    `);
  });

  test('@media (scripting: enabled)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (scripting: enabled)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "scripting",
          "type": "pair",
          "value": "enabled",
        },
      }
    `);
  });

  test('@media (hover: hover)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (hover: hover)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "hover",
          "type": "pair",
          "value": "hover",
        },
      }
    `);
  });

  test('@media (any-hover: none)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (any-hover: none)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "any-hover",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (pointer: coarse)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (pointer: coarse)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "pointer",
          "type": "pair",
          "value": "coarse",
        },
      }
    `);
  });

  test('@media (any-pointer: fine)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (any-pointer: fine)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "any-pointer",
          "type": "pair",
          "value": "fine",
        },
      }
    `);
  });

  test('@media (light-level: dim)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (light-level: dim)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "light-level",
          "type": "pair",
          "value": "dim",
        },
      }
    `);
  });

  test('@media (inverted-colors: inverted)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (inverted-colors: inverted)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "inverted-colors",
          "type": "pair",
          "value": "inverted",
        },
      }
    `);
  });

  test('@media (prefers-reduced-motion: reduce)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (prefers-reduced-motion: reduce)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "prefers-reduced-motion",
          "type": "pair",
          "value": "reduce",
        },
      }
    `);
  });

  test('@media (prefers-contrast: more)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (prefers-contrast: more)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "prefers-contrast",
          "type": "pair",
          "value": "more",
        },
      }
    `);
  });

  test('@media (forced-colors: active)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (forced-colors: active)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "forced-colors",
          "type": "pair",
          "value": "active",
        },
      }
    `);
  });

  test('@media (prefers-reduced-transparency: reduce)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (prefers-reduced-transparency: reduce)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "prefers-reduced-transparency",
          "type": "pair",
          "value": "reduce",
        },
      }
    `);
  });

  test('@media (orientation: portrait), (orientation: landscape)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (orientation: portrait), (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "orientation",
              "type": "pair",
              "value": "portrait",
            },
            {
              "key": "orientation",
              "type": "pair",
              "value": "landscape",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 500px) or (max-width: 600px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 500px) or (max-width: 600px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 500,
              },
            },
            {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 600,
              },
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('(width > 400px)', () => {
    expect(mediaInequalityRuleParser.parseToEnd('(width > 400px)'))
      .toMatchInlineSnapshot(`
      {
        "key": "min-width",
        "type": "pair",
        "value": {
          "signCharacter": undefined,
          "type": "integer",
          "unit": "px",
          "value": 400.01,
        },
      }
    `);
  });
  test('(width >= 400px)', () => {
    expect(mediaInequalityRuleParser.parseToEnd('(width >= 400px)'))
      .toMatchInlineSnapshot(`
      {
        "key": "min-width",
        "type": "pair",
        "value": {
          "signCharacter": undefined,
          "type": "integer",
          "unit": "px",
          "value": 400,
        },
      }
    `);
  });

  test('@media (width >= 400px) and (width <= 700px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (width >= 400px) and (width <= 700px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 400,
              },
            },
            {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 700,
              },
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (768px <= width <= 1280px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (768px <= width <= 1280px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 768,
              },
            },
            {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 1280,
              },
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (height > 500px) and (aspect-ratio: 16/9)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (height > 500px) and (aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-height",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 500.01,
              },
            },
            {
              "key": "aspect-ratio",
              "type": "pair",
              "value": [
                16,
                "/",
                9,
              ],
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (color) and (min-width: 400px), screen and (max-width: 700px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (color) and (min-width: 400px), screen and (max-width: 700px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "rules": [
                {
                  "keyValue": "color",
                  "type": "word-rule",
                },
                {
                  "key": "min-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 400,
                  },
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "screen",
                  "not": false,
                  "type": "media-keyword",
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 700,
                  },
                },
              ],
              "type": "and",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media not all and (monochrome)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media not all and (monochrome)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "all",
              "not": true,
              "type": "media-keyword",
            },
            {
              "keyValue": "monochrome",
              "type": "word-rule",
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-aspect-ratio: 3/2) and (max-aspect-ratio: 16/9)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-aspect-ratio: 3/2) and (max-aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-aspect-ratio",
              "type": "pair",
              "value": [
                3,
                "/",
                2,
              ],
            },
            {
              "key": "max-aspect-ratio",
              "type": "pair",
              "value": [
                16,
                "/",
                9,
              ],
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-resolution: 300dpi) and (max-resolution: 600dpi)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-resolution: 300dpi) and (max-resolution: 600dpi)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-resolution",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "dpi",
                "value": 300,
              },
            },
            {
              "key": "max-resolution",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "dpi",
                "value": 600,
              },
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (scripting: none)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (scripting: none)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "scripting",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (update: slow)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (update: slow)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "update",
          "type": "pair",
          "value": "slow",
        },
      }
    `);
  });

  test('@media (overflow-inline: none)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (overflow-inline: none)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "overflow-inline",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (display-mode: minimal-ui)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (display-mode: minimal-ui)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "minimal-ui",
        },
      }
    `);
  });

  test('@media (hover: none)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (hover: none)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "hover",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (any-hover: hover)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (any-hover: hover)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "any-hover",
          "type": "pair",
          "value": "hover",
        },
      }
    `);
  });

  test('@media (pointer: none)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (pointer: none)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "pointer",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (any-pointer: none)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (any-pointer: none)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "any-pointer",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (light-level: washed)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (light-level: washed)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "light-level",
          "type": "pair",
          "value": "washed",
        },
      }
    `);
  });

  test('@media (inverted-colors: none)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (inverted-colors: none)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "inverted-colors",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (prefers-reduced-motion: no-preference)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (prefers-reduced-motion: no-preference)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "prefers-reduced-motion",
          "type": "pair",
          "value": "no-preference",
        },
      }
    `);
  });

  test('@media (prefers-contrast: no-preference)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (prefers-contrast: no-preference)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "prefers-contrast",
          "type": "pair",
          "value": "no-preference",
        },
      }
    `);
  });

  test('@media (forced-colors: none)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (forced-colors: none)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "forced-colors",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (prefers-reduced-transparency: no-preference)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (prefers-reduced-transparency: no-preference)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "prefers-reduced-transparency",
          "type": "pair",
          "value": "no-preference",
        },
      }
    `);
  });

  test.skip('@media (width: calc(100% - 20px))', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (width: calc(100% - 20px))',
      ),
    ).toMatchInlineSnapshot();
  });

  test.skip('@media (min-width: calc(300px + 5em))', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: calc(300px + 5em))',
      ),
    ).toMatchInlineSnapshot();
  });

  test.skip('@media (max-height: calc(100vh - 50px))', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (max-height: calc(100vh - 50px))',
      ),
    ).toMatchInlineSnapshot();
  });

  test('@media (aspect-ratio: 16 / 9)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (aspect-ratio: 16 / 9)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "aspect-ratio",
          "type": "pair",
          "value": [
            16,
            "/",
            9,
          ],
        },
      }
    `);
  });

  test('@media (device-aspect-ratio: 16 / 9)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (device-aspect-ratio: 16 / 9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "device-aspect-ratio",
          "type": "pair",
          "value": [
            16,
            "/",
            9,
          ],
        },
      }
    `);
  });

  test('@media (min-resolution: 150dpi)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (min-resolution: 150dpi)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "min-resolution",
          "type": "pair",
          "value": {
            "signCharacter": undefined,
            "type": "integer",
            "unit": "dpi",
            "value": 150,
          },
        },
      }
    `);
  });

  test('@media (max-resolution: 600dppx)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd('@media (max-resolution: 600dppx)'),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "max-resolution",
          "type": "pair",
          "value": {
            "signCharacter": undefined,
            "type": "integer",
            "unit": "dppx",
            "value": 600,
          },
        },
      }
    `);
  });

  test('@media (color-gamut: srgb)', () => {
    expect(MediaQueryRecursive.parser.parseToEnd('@media (color-gamut: srgb)'))
      .toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "color-gamut",
          "type": "pair",
          "value": "srgb",
        },
      }
    `);
  });

  test('@media (display-mode: standalone)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (display-mode: standalone)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "standalone",
        },
      }
    `);
  });

  test('@media (orientation: landscape) and (pointer: fine)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (orientation: landscape) and (pointer: fine)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "orientation",
              "type": "pair",
              "value": "landscape",
            },
            {
              "key": "pointer",
              "type": "pair",
              "value": "fine",
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (prefers-color-scheme: dark)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (prefers-color-scheme: dark)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "key": "prefers-color-scheme",
          "type": "pair",
          "value": "dark",
        },
      }
    `);
  });

  test('@media (prefers-reduced-motion: reduce) and (update: slow)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (prefers-reduced-motion: reduce) and (update: slow)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "prefers-reduced-motion",
              "type": "pair",
              "value": "reduce",
            },
            {
              "key": "update",
              "type": "pair",
              "value": "slow",
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (width: 500px), (height: 400px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (width: 500px), (height: 400px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 500,
              },
            },
            {
              "key": "height",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 400,
              },
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media not all and (monochrome) and (min-width: 600px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media not all and (monochrome) and (min-width: 600px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "all",
              "not": true,
              "type": "media-keyword",
            },
            {
              "keyValue": "monochrome",
              "type": "word-rule",
            },
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 600,
              },
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-width: 768px) and (max-width: 991px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 768px) and (max-width: 991px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 768,
              },
            },
            {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 991,
              },
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-width: 1200px) and (orientation: landscape)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 1200px) and (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 1200,
              },
            },
            {
              "key": "orientation",
              "type": "pair",
              "value": "landscape",
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-width: 992px) and (max-width: 1199px) and (pointer: fine)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 992px) and (max-width: 1199px) and (pointer: fine)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 992,
              },
            },
            {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 1199,
              },
            },
            {
              "key": "pointer",
              "type": "pair",
              "value": "fine",
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-width: 576px) and (max-width: 767px) and (hover: none)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 576px) and (max-width: 767px) and (hover: none)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 576,
              },
            },
            {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 767,
              },
            },
            {
              "key": "hover",
              "type": "pair",
              "value": "none",
            },
          ],
          "type": "and",
        },
      }
    `);
  });

  test('@media (min-width: 576px), (orientation: portrait) and (max-width: 767px)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 576px), (orientation: portrait) and (max-width: 767px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 576,
              },
            },
            {
              "rules": [
                {
                  "key": "orientation",
                  "type": "pair",
                  "value": "portrait",
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 767,
                  },
                },
              ],
              "type": "and",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 768px) and (max-width: 991px), (orientation: landscape)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 768px) and (max-width: 991px), (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "rules": [
                {
                  "key": "min-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 768,
                  },
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 991,
                  },
                },
              ],
              "type": "and",
            },
            {
              "key": "orientation",
              "type": "pair",
              "value": "landscape",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "rules": [
                {
                  "key": "min-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 992,
                  },
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 1199,
                  },
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "pointer",
                  "type": "pair",
                  "value": "fine",
                },
                {
                  "key": "hover",
                  "type": "pair",
                  "value": "hover",
                },
              ],
              "type": "and",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "rules": [
                {
                  "key": "min-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 576,
                  },
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 767,
                  },
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "hover",
                  "type": "pair",
                  "value": "none",
                },
                {
                  "key": "any-pointer",
                  "type": "pair",
                  "value": "coarse",
                },
              ],
              "type": "and",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 576px), (orientation: portrait) and (max-width: 767px), (prefers-color-scheme: dark)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 576px), (orientation: portrait) and (max-width: 767px), (prefers-color-scheme: dark)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "key": "min-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 576,
              },
            },
            {
              "rules": [
                {
                  "key": "orientation",
                  "type": "pair",
                  "value": "portrait",
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 767,
                  },
                },
              ],
              "type": "and",
            },
            {
              "key": "prefers-color-scheme",
              "type": "pair",
              "value": "dark",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 768px) and (max-width: 991px), (orientation: landscape) and (update: fast), (prefers-reduced-motion: reduce)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 768px) and (max-width: 991px), (orientation: landscape) and (update: fast), (prefers-reduced-motion: reduce)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "rules": [
                {
                  "key": "min-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 768,
                  },
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 991,
                  },
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "orientation",
                  "type": "pair",
                  "value": "landscape",
                },
                {
                  "key": "update",
                  "type": "pair",
                  "value": "fast",
                },
              ],
              "type": "and",
            },
            {
              "key": "prefers-reduced-motion",
              "type": "pair",
              "value": "reduce",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover), (any-pointer: coarse) and (any-hover: none)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover), (any-pointer: coarse) and (any-hover: none)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "rules": [
                {
                  "key": "min-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 992,
                  },
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 1199,
                  },
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "pointer",
                  "type": "pair",
                  "value": "fine",
                },
                {
                  "key": "hover",
                  "type": "pair",
                  "value": "hover",
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "any-pointer",
                  "type": "pair",
                  "value": "coarse",
                },
                {
                  "key": "any-hover",
                  "type": "pair",
                  "value": "none",
                },
              ],
              "type": "and",
            },
          ],
          "type": "or",
        },
      }
    `);
  });

  test('@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse), (prefers-reduced-transparency: reduce) and (forced-colors: active)', () => {
    expect(
      MediaQueryRecursive.parser.parseToEnd(
        '@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse), (prefers-reduced-transparency: reduce) and (forced-colors: active)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQueryRecursive {
        "queries": {
          "rules": [
            {
              "rules": [
                {
                  "key": "min-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 576,
                  },
                },
                {
                  "key": "max-width",
                  "type": "pair",
                  "value": {
                    "signCharacter": undefined,
                    "type": "integer",
                    "unit": "px",
                    "value": 767,
                  },
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "hover",
                  "type": "pair",
                  "value": "none",
                },
                {
                  "key": "any-pointer",
                  "type": "pair",
                  "value": "coarse",
                },
              ],
              "type": "and",
            },
            {
              "rules": [
                {
                  "key": "prefers-reduced-transparency",
                  "type": "pair",
                  "value": "reduce",
                },
                {
                  "key": "forced-colors",
                  "type": "pair",
                  "value": "active",
                },
              ],
              "type": "and",
            },
          ],
          "type": "or",
        },
      }
    `);
  });
});
