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
    const query = '@media screen';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "screen",
          "not": false,
          "only": false,
          "type": "media-keyword",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media print', () => {
    const query = '@media print';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "print",
          "not": false,
          "only": false,
          "type": "media-keyword",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (width: 100px)', () => {
    const query = '@media (width: 100px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (max-width: 50em)', () => {
    const query = '@media (max-width: 50em)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (orientation: landscape)', () => {
    const query = '@media (orientation: landscape)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "orientation",
          "type": "pair",
          "value": "landscape",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media not all and (monochrome)', () => {
    const query = '@media not all and (monochrome)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "rules": [
            {
              "key": "all",
              "not": true,
              "only": false,
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media screen and (min-width: 400px)', () => {
    const query = '@media screen and (min-width: 400px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "rules": [
            {
              "key": "screen",
              "not": false,
              "only": false,
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-height: 600px) and (orientation: landscape)', () => {
    const query = '@media (min-height: 600px) and (orientation: landscape)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media screen and (device-aspect-ratio: 16/9)', () => {
    const query = '@media screen and (device-aspect-ratio: 16/9)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "rules": [
            {
              "key": "screen",
              "not": false,
              "only": false,
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(
      '@media screen and (device-aspect-ratio: 16 / 9)',
    );
  });

  test('@media (device-height: 500px)', () => {
    const query = '@media (device-height: 500px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (color)', () => {
    const query = '@media (color)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "color",
          "type": "word-rule",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (color-index)', () => {
    const query = '@media (color-index)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "color-index",
          "type": "word-rule",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (monochrome)', () => {
    const query = '@media (monochrome)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "monochrome",
          "type": "word-rule",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (grid)', () => {
    const query = '@media (grid)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "keyValue": "grid",
          "type": "word-rule",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (update: fast)', () => {
    const query = '@media (update: fast)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "update",
          "type": "pair",
          "value": "fast",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (overflow-block: scroll)', () => {
    const query = '@media (overflow-block: scroll)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "overflow-block",
          "type": "pair",
          "value": "scroll",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (display-mode: fullscreen)', () => {
    const query = '@media (display-mode: fullscreen)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "fullscreen",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (scripting: enabled)', () => {
    const query = '@media (scripting: enabled)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (hover: hover)', () => {
    const query = '@media (hover: hover)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (any-hover: none)', () => {
    const query = '@media (any-hover: none)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (pointer: coarse)', () => {
    const query = '@media (pointer: coarse)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (any-pointer: fine)', () => {
    const query = '@media (any-pointer: fine)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (light-level: dim)', () => {
    const query = '@media (light-level: dim)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (inverted-colors: inverted)', () => {
    const query = '@media (inverted-colors: inverted)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-reduced-motion: reduce)', () => {
    const query = '@media (prefers-reduced-motion: reduce)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-contrast: more)', () => {
    const query = '@media (prefers-contrast: more)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (forced-colors: active)', () => {
    const query = '@media (forced-colors: active)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-reduced-transparency: reduce)', () => {
    const query = '@media (prefers-reduced-transparency: reduce)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (orientation: portrait), (orientation: landscape)', () => {
    const query = '@media (orientation: portrait), (orientation: landscape)';
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 500px) or (max-width: 600px)', () => {
    const query = '@media (min-width: 500px) or (max-width: 600px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(
      '@media (min-width: 500px), (max-width: 600px)',
    );
  });

  test('(width > 400px)', () => {
    const query = '(width > 400px)';
    expect(mediaInequalityRuleParser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    const query = '(width >= 400px)';

    expect(mediaInequalityRuleParser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    const query = '@media (width >= 400px) and (width <= 700px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(
      '@media (min-width: 400px) and (max-width: 700px)',
    );
  });

  test('@media (768px <= width <= 1280px)', () => {
    const query = '@media (768px <= width <= 1280px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(
      '@media (min-width: 768px) and (max-width: 1280px)',
    );
  });

  test('@media (height > 500px) and (aspect-ratio: 16/9)', () => {
    const query = '@media (height > 500px) and (aspect-ratio: 16/9)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(
      '@media (min-height: 500.01px) and (aspect-ratio: 16 / 9)',
    );
  });

  test('@media (color) and (min-width: 400px), screen and (max-width: 700px)', () => {
    const query =
      '@media (color) and (min-width: 400px), screen and (max-width: 700px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
                  "only": false,
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media not all and (monochrome)', () => {
    const query = '@media not all and (monochrome)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "rules": [
            {
              "key": "all",
              "not": true,
              "only": false,
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-aspect-ratio: 3/2) and (max-aspect-ratio: 16/9)', () => {
    const query =
      '@media (min-aspect-ratio: 3 / 2) and (max-aspect-ratio: 16 / 9)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-resolution: 300dpi) and (max-resolution: 600dpi)', () => {
    const query =
      '@media (min-resolution: 300dpi) and (max-resolution: 600dpi)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (scripting: none)', () => {
    const query = '@media (scripting: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "scripting",
          "type": "pair",
          "value": "none",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (update: slow)', () => {
    const query = '@media (update: slow)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "update",
          "type": "pair",
          "value": "slow",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (overflow-inline: none)', () => {
    const query = '@media (overflow-inline: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "overflow-inline",
          "type": "pair",
          "value": "none",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (display-mode: minimal-ui)', () => {
    const query = '@media (display-mode: minimal-ui)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "minimal-ui",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (hover: none)', () => {
    const query = '@media (hover: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "hover",
          "type": "pair",
          "value": "none",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (any-hover: hover)', () => {
    const query = '@media (any-hover: hover)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "any-hover",
          "type": "pair",
          "value": "hover",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (pointer: none)', () => {
    const query = '@media (pointer: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "pointer",
          "type": "pair",
          "value": "none",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (any-pointer: none)', () => {
    const query = '@media (any-pointer: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "any-pointer",
          "type": "pair",
          "value": "none",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (light-level: washed)', () => {
    const query = '@media (light-level: washed)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "light-level",
          "type": "pair",
          "value": "washed",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (inverted-colors: none)', () => {
    const query = '@media (inverted-colors: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "inverted-colors",
          "type": "pair",
          "value": "none",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-reduced-motion: no-preference)', () => {
    const query = '@media (prefers-reduced-motion: no-preference)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "prefers-reduced-motion",
          "type": "pair",
          "value": "no-preference",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-contrast: no-preference)', () => {
    const query = '@media (prefers-contrast: no-preference)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "prefers-contrast",
          "type": "pair",
          "value": "no-preference",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (forced-colors: none)', () => {
    const query = '@media (forced-colors: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "forced-colors",
          "type": "pair",
          "value": "none",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-reduced-transparency: no-preference)', () => {
    const query = '@media (prefers-reduced-transparency: no-preference)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "prefers-reduced-transparency",
          "type": "pair",
          "value": "no-preference",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: calc(300px + 5em))', () => {
    const query = '@media (min-width: calc(300px + 5em))';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "min-width",
          "type": "pair",
          "value": "calc(300px + 5em)",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (max-height: calc(100vh - 50px))', () => {
    const query = '@media (max-height: calc(100vh - 50px))';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "max-height",
          "type": "pair",
          "value": "calc(100vh - 50px)",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (aspect-ratio: 16 / 9)', () => {
    const query = '@media (aspect-ratio: 16 / 9)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (device-aspect-ratio: 16 / 9)', () => {
    const query = '@media (device-aspect-ratio: 16 / 9)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-resolution: 150dpi)', () => {
    const query = '@media (min-resolution: 150dpi)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (max-resolution: 600dppx)', () => {
    const query = '@media (max-resolution: 600dppx)';

    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (color-gamut: srgb)', () => {
    const query = '@media (color-gamut: srgb)';

    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "color-gamut",
          "type": "pair",
          "value": "srgb",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (display-mode: standalone)', () => {
    const query = '@media (display-mode: standalone)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "display-mode",
          "type": "pair",
          "value": "standalone",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (orientation: landscape) and (pointer: fine)', () => {
    const query = '@media (orientation: landscape) and (pointer: fine)';

    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-color-scheme: dark)', () => {
    const query = '@media (prefers-color-scheme: dark)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "prefers-color-scheme",
          "type": "pair",
          "value": "dark",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (prefers-reduced-motion: reduce) and (update: slow)', () => {
    const query = '@media (prefers-reduced-motion: reduce) and (update: slow)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (width: 500px), (height: 400px)', () => {
    const query = '@media (width: 500px), (height: 400px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media not all and (monochrome) and (min-width: 600px)', () => {
    const query = '@media not all and (monochrome) and (min-width: 600px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "rules": [
            {
              "key": "all",
              "not": true,
              "only": false,
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 768px) and (max-width: 991px)', () => {
    const query = '@media (min-width: 768px) and (max-width: 991px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 1200px) and (orientation: landscape)', () => {
    const query = '@media (min-width: 1200px) and (orientation: landscape)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 992px) and (max-width: 1199px) and (pointer: fine)', () => {
    const query =
      '@media (min-width: 992px) and (max-width: 1199px) and (pointer: fine)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 576px) and (max-width: 767px) and (hover: none)', () => {
    const query =
      '@media (min-width: 576px) and (max-width: 767px) and (hover: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 576px), (orientation: portrait) and (max-width: 767px)', () => {
    const query =
      '@media (min-width: 576px), (orientation: portrait) and (max-width: 767px)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 768px) and (max-width: 991px), (orientation: landscape)', () => {
    const query =
      '@media (min-width: 768px) and (max-width: 991px), (orientation: landscape)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover)', () => {
    const query =
      '@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse)', () => {
    const query =
      '@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 576px), (orientation: portrait) and (max-width: 767px), (prefers-color-scheme: dark)', () => {
    const query =
      '@media (min-width: 576px), (orientation: portrait) and (max-width: 767px), (prefers-color-scheme: dark)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 768px) and (max-width: 991px), (orientation: landscape) and (update: fast), (prefers-reduced-motion: reduce)', () => {
    const query =
      '@media (min-width: 768px) and (max-width: 991px), (orientation: landscape) and (update: fast), (prefers-reduced-motion: reduce)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover), (any-pointer: coarse) and (any-hover: none)', () => {
    const query =
      '@media (min-width: 992px) and (max-width: 1199px), (pointer: fine) and (hover: hover), (any-pointer: coarse) and (any-hover: none)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse), (prefers-reduced-transparency: reduce) and (forced-colors: active)', () => {
    const query =
      '@media (min-width: 576px) and (max-width: 767px), (hover: none) and (any-pointer: coarse), (prefers-reduced-transparency: reduce) and (forced-colors: active)';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
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
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(query);
  });

  test('@media not (not (not (min-width: 400px)))', () => {
    const query = '@media not (not (not (min-width: 400px)))';
    const mediaQuery = MediaQuery.parser.parseToEnd(query);
    expect(mediaQuery).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "rule": {
            "key": "min-width",
            "type": "pair",
            "value": {
              "signCharacter": undefined,
              "type": "integer",
              "unit": "px",
              "value": 400,
            },
          },
          "type": "not",
        },
      }
    `);
    expect(mediaQuery.toString()).toEqual('@media (not (min-width: 400px))');
  });

  test('@media not ((min-width: 500px) and (max-width: 600px) and (max-width: 400px))', () => {
    const query =
      '@media not ((min-width: 500px) and (max-width: 600px) and (max-width: 400px))';
    expect(MediaQuery.parser.parseToEnd(query)).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "rule": {
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
              {
                "key": "max-width",
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
          "type": "not",
        },
      }
    `);
    expect(MediaQuery.parser.parseToEnd(query).toString()).toEqual(
      '@media (not ((min-width: 500px) and (max-width: 600px) and (max-width: 400px)))',
    );
  });
  test('flattens nested and rules', () => {
    const query =
      '@media (min-width: 400px) and ((max-width: 700px) and (orientation: landscape))';
    const mediaQuery = MediaQuery.parser.parseToEnd(query);
    expect(mediaQuery).toMatchInlineSnapshot(`
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
    expect(mediaQuery.toString()).toEqual(
      '@media (min-width: 400px) and (max-width: 700px) and (orientation: landscape)',
    );
  });

  test('flattens complex nested and rules', () => {
    const query =
      '@media ((min-width: 400px) and ((max-width: 700px) and (orientation: landscape)))';
    const mediaQuery = MediaQuery.parser.parseToEnd(query);
    expect(mediaQuery).toMatchInlineSnapshot(`
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
    expect(mediaQuery.toString()).toEqual(
      '@media (min-width: 400px) and (max-width: 700px) and (orientation: landscape)',
    );
  });

  test('removes duplicate nots', () => {
    const query = '@media not (not (min-width: 400px))';
    const mediaQuery = MediaQuery.parser.parseToEnd(query);
    expect(mediaQuery).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": {
          "key": "min-width",
          "type": "pair",
          "value": {
            "signCharacter": undefined,
            "type": "integer",
            "unit": "px",
            "value": 400,
          },
        },
      }
    `);
    expect(mediaQuery.toString()).toEqual('@media (min-width: 400px)');
  });

  test('@media only screen', () => {
    const query = '@media only screen';
    const parsed = MediaQuery.parser.parseToEnd(query);
    expect(parsed.queries).toMatchInlineSnapshot(`
      {
        "key": "screen",
        "not": false,
        "only": true,
        "type": "media-keyword",
      }
    `);
    expect(parsed.toString()).toBe('@media only screen');
  });

  test('@media only print and (color)', () => {
    const query = '@media only print and (color)';
    const parsed = MediaQuery.parser.parseToEnd(query);
    expect(parsed.toString()).toBe('@media only print and (color)');
  });

  test('@media not screen', () => {
    const query = '@media not screen';
    const parsed = MediaQuery.parser.parseToEnd(query);
    expect(parsed.queries).toMatchInlineSnapshot(`
      {
        "key": "screen",
        "not": true,
        "only": false,
        "type": "media-keyword",
      }
    `);
    expect(parsed.toString()).toBe('@media not screen');
  });

  test('@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px)) and (not (max-width: 458px))', () => {
    const query =
      '@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px)) and (not (max-width: 458px))';
    const parsed = MediaQuery.parser.parseToEnd(query);
    expect(parsed.queries).toMatchInlineSnapshot(`
      {
        "rules": [
          {
            "key": "max-width",
            "type": "pair",
            "value": {
              "signCharacter": undefined,
              "type": "integer",
              "unit": "px",
              "value": 1440,
            },
          },
          {
            "rule": {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 1024,
              },
            },
            "type": "not",
          },
          {
            "rule": {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 768,
              },
            },
            "type": "not",
          },
          {
            "rule": {
              "key": "max-width",
              "type": "pair",
              "value": {
                "signCharacter": undefined,
                "type": "integer",
                "unit": "px",
                "value": 458,
              },
            },
            "type": "not",
          },
        ],
        "type": "and",
      }
    `);
    expect(parsed.toString()).toBe(
      '@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px)) and (not (max-width: 458px))',
    );
  });

  test('rejects invalid media queries', () => {
    const parse = (str: string) => MediaQuery.parser.parseToEnd(str);

    // empty / missing rules
    expect(() => parse('@media')).toThrow();
    expect(() => parse('@media ')).toThrow();
    expect(() => parse('@media ()')).toThrow();

    // incorrect operators or delimiters
    expect(() => parse('@media (width > )')).toThrow();
    expect(() => parse('@media ( > 600px)')).toThrow();
    expect(() => parse('@media (600px > width) or')).toThrow();
    expect(() => parse('@media (width < )')).toThrow();
    expect(() => parse('@media (width <=)')).toThrow();
    expect(() => parse('@media (>= width)')).toThrow();
    expect(() => parse('@media (width :)')).toThrow();
    expect(() => parse('@media (: 600px)')).toThrow();
    expect(() => parse('@media (min-width 600px)')).toThrow();

    // illegal identifiers or token types
    expect(() => parse('@media (width @ 600px)')).toThrow();
    expect(() => parse('@media (width: #$%)')).toThrow();
    expect(() => parse('@media (width: [])')).toThrow();

    // unmatched or misnested parens
    expect(() => parse('@media (width < 600px')).toThrow();
    expect(() => parse('@media ((min-width: 600px)')).toThrow();
    expect(() => parse('@media (min-width: 600px))')).toThrow();
    expect(() =>
      parse('@media ((min-width: 600px) and (max-width: 1200px)) and )'),
    ).toThrow();
    expect(() =>
      parse('@media (min-width: 600px and max-width: 1200px)'),
    ).toThrow();

    // bad logical structure
    expect(() => parse('@media and (min-width: 600px)')).toThrow();
    expect(() => parse('@media or (max-width: 1200px)')).toThrow();
    expect(() => parse('@media not and (print)')).toThrow();
    expect(() => parse('@media not or (print)')).toThrow();
    expect(() => parse('@media (min-width: 600px) or')).toThrow();
    expect(() => parse('@media and')).toThrow();
    expect(() => parse('@media (color) and')).toThrow();
    expect(() =>
      parse('@media (width > 1024px), and (height > 1024px)'),
    ).toThrow();

    // illegal use of variables in media queries
    expect(() => parse('@media (min-width: var(--test))')).toThrow();
    expect(() =>
      parse('@media (min-width: var(--foo) and (max-width: 700px))'),
    ).toThrow();
    expect(() =>
      parse('@media (min-width: var(foo) and (max-width: 700px))'),
    ).toThrow();

    // invalid `not` usage
    expect(() => parse('@media not')).toThrow();
    expect(() => parse('@media not (min-width: )')).toThrow();
    expect(() => parse('@media (not)')).toThrow();
    expect(() => parse('@media ((not (min-width: 600px))')).toThrow();

    // incomplete rules
    expect(() => parse('@media (width:)')).toThrow();
    expect(() => parse('@media (min-width:)')).toThrow();
    expect(() => parse('@media (max-width: )')).toThrow();

    // unknown keyword or media types
    expect(() => parse('@media 100gecs')).toThrow();
    expect(() => parse('@media only 100gecs')).toThrow();
    expect(() => parse('@media not 100gecs')).toThrow();

    // malformed double inequalities
    expect(() => parse('@media (300px < width <)')).toThrow();
    expect(() => parse('@media (< width < 700px)')).toThrow();
    expect(() => parse('@media (300px > > width < 700px)')).toThrow();

    // broken groupings
    expect(() => parse('@media ((width: 600px) and)')).toThrow();
    expect(() => parse('@media ((and (width: 600px)))')).toThrow();
    expect(() => parse('@media (())')).toThrow();

    expect(() => parse('@media (only max-width: 500px)')).toThrow();
    expect(() => parse('@media screen and (only screen) ')).toThrow();
    expect(() => parse('@media not (only (screen))')).toThrow();
  });
});
