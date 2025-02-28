/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { mediaInequalityRuleParser } from '../media-query.js';
import { MediaQuery } from '../media-query.js';

describe('Test CSS Type: @media queries', () => {
  test('@media screen', () => {
    expect(MediaQuery.parser.parseToEnd('@media screen'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "screen",
          "not": false,
          "type": "media-keyword",
        },
      }
    `);
  });

  test('@media print', () => {
    expect(MediaQuery.parser.parseToEnd('@media print')).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "print",
          "not": false,
          "type": "media-keyword",
        },
      }
    `);
  });

  test('@media (width: 100px)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (width: 100px)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (max-width: 50em)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (orientation: landscape)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "orientation",
          "type": "pair",
          "value": "landscape",
        },
      }
    `);
  });

  test('@media not (monochrome)', () => {
    expect(MediaQuery.parser.parseToEnd('@media not (monochrome)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "monochrome",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media screen and (min-width: 400px)', () => {
    expect(MediaQuery.parser.parseToEnd('@media screen and (min-width: 400px)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-height: 600px) and (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media screen and (device-aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (device-height: 500px)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (color)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "color",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media (color-index)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (color-index)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "color-index",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media (monochrome)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (monochrome)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "monochrome",
          "type": "word-rule",
        },
      }
    `);
  });

  // According to MDN, it should be `(grid: 1)` or `(grid: 0)`
  test('@media (grid)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (grid)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "grid",
          "type": "word-rule",
        },
      }
    `);
  });

  test('@media (update: fast)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (update: fast)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "update",
          "type": "pair",
          "value": "fast",
        },
      }
    `);
  });

  test('@media (overflow-block: scroll)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (overflow-block: scroll)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "overflow-block",
          "type": "pair",
          "value": "scroll",
        },
      }
    `);
  });

  test('@media (display-mode: fullscreen)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (display-mode: fullscreen)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "fullscreen",
        },
      }
    `);
  });

  test('@media (scripting: enabled)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (scripting: enabled)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "scripting",
          "type": "pair",
          "value": "enabled",
        },
      }
    `);
  });

  test('@media (hover: hover)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (hover: hover)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "hover",
          "type": "pair",
          "value": "hover",
        },
      }
    `);
  });

  test('@media (any-hover: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-hover: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "any-hover",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (pointer: coarse)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (pointer: coarse)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "pointer",
          "type": "pair",
          "value": "coarse",
        },
      }
    `);
  });

  test('@media (any-pointer: fine)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-pointer: fine)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "any-pointer",
          "type": "pair",
          "value": "fine",
        },
      }
    `);
  });

  test('@media (light-level: dim)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (light-level: dim)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "light-level",
          "type": "pair",
          "value": "dim",
        },
      }
    `);
  });

  test('@media (inverted-colors: inverted)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (inverted-colors: inverted)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd('@media (prefers-reduced-motion: reduce)'),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "prefers-reduced-motion",
          "type": "pair",
          "value": "reduce",
        },
      }
    `);
  });

  test('@media (prefers-contrast: more)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (prefers-contrast: more)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "prefers-contrast",
          "type": "pair",
          "value": "more",
        },
      }
    `);
  });

  test('@media (forced-colors: active)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (forced-colors: active)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (prefers-reduced-transparency: reduce)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (orientation: portrait), (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 500px) or (max-width: 600px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (width >= 400px) and (width <= 700px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (768px <= width <= 1280px)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (height > 500px) and (aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (color) and (min-width: 400px), screen and (max-width: 700px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media not all and (monochrome)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-aspect-ratio: 3/2) and (max-aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-resolution: 300dpi) and (max-resolution: 600dpi)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (scripting: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "scripting",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (update: slow)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (update: slow)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "update",
          "type": "pair",
          "value": "slow",
        },
      }
    `);
  });

  test('@media (overflow-inline: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (overflow-inline: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "overflow-inline",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (display-mode: minimal-ui)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (display-mode: minimal-ui)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "minimal-ui",
        },
      }
    `);
  });

  test('@media (hover: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (hover: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "hover",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (any-hover: hover)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-hover: hover)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "any-hover",
          "type": "pair",
          "value": "hover",
        },
      }
    `);
  });

  test('@media (pointer: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (pointer: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "pointer",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (any-pointer: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-pointer: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "any-pointer",
          "type": "pair",
          "value": "none",
        },
      }
    `);
  });

  test('@media (light-level: washed)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (light-level: washed)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "light-level",
          "type": "pair",
          "value": "washed",
        },
      }
    `);
  });

  test('@media (inverted-colors: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (inverted-colors: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (prefers-reduced-motion: no-preference)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd('@media (prefers-contrast: no-preference)'),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "prefers-contrast",
          "type": "pair",
          "value": "no-preference",
        },
      }
    `);
  });

  test('@media (forced-colors: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (forced-colors: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (prefers-reduced-transparency: no-preference)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd('@media (width: calc(100% - 20px))'),
    ).toMatchInlineSnapshot();
  });

  test.skip('@media (min-width: calc(300px + 5em))', () => {
    expect(
      MediaQuery.parser.parseToEnd('@media (min-width: calc(300px + 5em))'),
    ).toMatchInlineSnapshot();
  });

  test.skip('@media (max-height: calc(100vh - 50px))', () => {
    expect(
      MediaQuery.parser.parseToEnd('@media (max-height: calc(100vh - 50px))'),
    ).toMatchInlineSnapshot();
  });

  test('@media (aspect-ratio: 16 / 9)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (aspect-ratio: 16 / 9)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (device-aspect-ratio: 16 / 9)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (min-resolution: 150dpi)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (max-resolution: 600dppx)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (color-gamut: srgb)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "color-gamut",
          "type": "pair",
          "value": "srgb",
        },
      }
    `);
  });

  test('@media (display-mode: standalone)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (display-mode: standalone)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (orientation: landscape) and (pointer: fine)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
    expect(MediaQuery.parser.parseToEnd('@media (prefers-color-scheme: dark)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (prefers-reduced-motion: reduce) and (update: slow)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd('@media (width: 500px), (height: 400px)'),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media not all and (monochrome) and (min-width: 600px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 768px) and (max-width: 991px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 1200px) and (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 992px) and (max-width: 1199px) and (pointer: fine)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 576px) and (max-width: 767px) and (hover: none)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 576px), (orientation: portrait) and (max-width: 767px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 768px) and (max-width: 991px), (orientation: landscape)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 576px), (orientation: portrait) and (max-width: 767px), (prefers-color-scheme: dark)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 768px) and (max-width: 991px), (orientation: landscape) and (update: fast), (prefers-reduced-motion: reduce)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover), (any-pointer: coarse) and (any-hover: none)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse), (prefers-reduced-transparency: reduce) and (forced-colors: active)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
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
