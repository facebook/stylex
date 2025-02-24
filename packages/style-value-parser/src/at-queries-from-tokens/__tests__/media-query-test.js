/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { MediaQuery } from '../media-query.js';

describe('Test CSS Type: @media queries', () => {
  test('@media screen', () => {
    expect(MediaQuery.parser.parseToEnd('@media screen'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaQueryKeywords {
                  "key": "screen",
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media print', () => {
    expect(MediaQuery.parser.parseToEnd('@media print')).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaQueryKeywords {
                  "key": "print",
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (width: 100px)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (width: 100px)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "width",
                    "value": "100px",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (max-width: 50em)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (max-width: 50em)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "50em",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (orientation: landscape)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (orientation: landscape)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "landscape",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  // test('@media not (monochrome)', () => {
  //   expect(
  //     MediaQuery.parser.parseToEnd('@media not (monochrome)'),
  //   ).toMatchInlineSnapshot();
  // });

  test('@media screen and (min-width: 400px)', () => {
    expect(MediaQuery.parser.parseToEnd('@media screen and (min-width: 400px)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaQueryKeywords {
                  "key": "screen",
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "400px",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-height",
                    "value": "600px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "landscape",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaQueryKeywords {
                  "key": "screen",
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "device-aspect-ratio",
                    "value": [
                      16,
                      "/",
                      9,
                    ],
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (device-height: 500px)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (device-height: 500px)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "device-height",
                    "value": "500px",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (color)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (color)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySingleWordCondition {
                    "keyValue": "color",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (color-index)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (color-index)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySingleWordCondition {
                    "keyValue": "color-index",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (monochrome)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (monochrome)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySingleWordCondition {
                    "keyValue": "monochrome",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  // According to MDN, it should be `(grid: 1)` or `(grid: 0)`
  test('@media (grid)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (grid)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySingleWordCondition {
                    "keyValue": "grid",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (update: fast)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (update: fast)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "update",
                    "value": "fast",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (overflow-block: scroll)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (overflow-block: scroll)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "overflow-block",
                    "value": "scroll",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (display-mode: fullscreen)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (display-mode: fullscreen)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "display-mode",
                    "value": "fullscreen",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (scripting: enabled)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (scripting: enabled)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "scripting",
                    "value": "enabled",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (hover: hover)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (hover: hover)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "hover",
                    "value": "hover",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (any-hover: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-hover: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-hover",
                    "value": "none",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (pointer: coarse)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (pointer: coarse)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "pointer",
                    "value": "coarse",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (any-pointer: fine)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-pointer: fine)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-pointer",
                    "value": "fine",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (light-level: dim)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (light-level: dim)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "light-level",
                    "value": "dim",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (inverted-colors: inverted)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (inverted-colors: inverted)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "inverted-colors",
                    "value": "inverted",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (prefers-reduced-motion: reduce)', () => {
    expect(
      MediaQuery.parser.parseToEnd('@media (prefers-reduced-motion: reduce)'),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-reduced-motion",
                    "value": "reduce",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (prefers-contrast: more)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (prefers-contrast: more)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-contrast",
                    "value": "more",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (forced-colors: active)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (forced-colors: active)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "forced-colors",
                    "value": "active",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-reduced-transparency",
                    "value": "reduce",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "portrait",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "landscape",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "500px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "600px",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test.skip('@media (width >= 400px) and (width <= 700px)', () => {
    expect(
      MediaQuery.parser.parseToEnd(
        '@media (width >= 400px) and (width <= 700px)',
      ),
    ).toMatchInlineSnapshot();
  });

  test.skip('@media (height > 500px) and (aspect-ratio: 16/9)', () => {
    expect(
      MediaQuery.parser.parseToEnd(
        '@media (height > 500px) and (aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot();
  });

  test('@media (color) and (min-width: 400px), screen and (max-width: 700px)', () => {
    expect(
      MediaQuery.parser.parseToEnd(
        '@media (color) and (min-width: 400px), screen and (max-width: 700px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySingleWordCondition {
                    "keyValue": "color",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "400px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaQueryKeywords {
                  "key": "screen",
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "700px",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test.skip('@media not all and (monochrome)', () => {
    expect(
      MediaQuery.parser.parseToEnd('@media not all and (monochrome)'),
    ).toMatchInlineSnapshot();
  });

  test('@media (min-aspect-ratio: 3/2) and (max-aspect-ratio: 16/9)', () => {
    expect(
      MediaQuery.parser.parseToEnd(
        '@media (min-aspect-ratio: 3/2) and (max-aspect-ratio: 16/9)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-aspect-ratio",
                    "value": [
                      3,
                      "/",
                      2,
                    ],
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-aspect-ratio",
                    "value": [
                      16,
                      "/",
                      9,
                    ],
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-resolution",
                    "value": "300dpi",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-resolution",
                    "value": "600dpi",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (scripting: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (scripting: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "scripting",
                    "value": "none",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (update: slow)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (update: slow)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "update",
                    "value": "slow",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (overflow-inline: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (overflow-inline: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "overflow-inline",
                    "value": "none",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (display-mode: minimal-ui)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (display-mode: minimal-ui)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "display-mode",
                    "value": "minimal-ui",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (hover: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (hover: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "hover",
                    "value": "none",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (any-hover: hover)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-hover: hover)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-hover",
                    "value": "hover",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (pointer: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (pointer: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "pointer",
                    "value": "none",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (any-pointer: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (any-pointer: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-pointer",
                    "value": "none",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (light-level: washed)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (light-level: washed)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "light-level",
                    "value": "washed",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (inverted-colors: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (inverted-colors: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "inverted-colors",
                    "value": "none",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-reduced-motion",
                    "value": "no-preference",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (prefers-contrast: no-preference)', () => {
    expect(
      MediaQuery.parser.parseToEnd('@media (prefers-contrast: no-preference)'),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-contrast",
                    "value": "no-preference",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (forced-colors: none)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (forced-colors: none)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "forced-colors",
                    "value": "none",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-reduced-transparency",
                    "value": "no-preference",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "aspect-ratio",
                    "value": [
                      16,
                      "/",
                      9,
                    ],
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (device-aspect-ratio: 16 / 9)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (device-aspect-ratio: 16 / 9)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "device-aspect-ratio",
                    "value": [
                      16,
                      "/",
                      9,
                    ],
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (min-resolution: 150dpi)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (min-resolution: 150dpi)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-resolution",
                    "value": "150dpi",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (max-resolution: 600dppx)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (max-resolution: 600dppx)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-resolution",
                    "value": "600dppx",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (color-gamut: srgb)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (color-gamut: srgb)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "color-gamut",
                    "value": "srgb",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (display-mode: standalone)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (display-mode: standalone)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "display-mode",
                    "value": "standalone",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "landscape",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "pointer",
                    "value": "fine",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (prefers-color-scheme: dark)', () => {
    expect(MediaQuery.parser.parseToEnd('@media (prefers-color-scheme: dark)'))
      .toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-color-scheme",
                    "value": "dark",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-reduced-motion",
                    "value": "reduce",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "update",
                    "value": "slow",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('@media (width: 500px), (height: 400px)', () => {
    expect(
      MediaQuery.parser.parseToEnd('@media (width: 500px), (height: 400px)'),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "width",
                    "value": "500px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "height",
                    "value": "400px",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });

  // test('@media not all and (monochrome) and (min-width: 600px)', () => {
  //   expect(
  //     MediaQuery.parser.parseToEnd(
  //       '@media not all and (monochrome) and (min-width: 600px)',
  //     ),
  //   ).toMatchInlineSnapshot();
  // });

  test('@media (min-width: 768px) and (max-width: 991px)', () => {
    expect(
      MediaQuery.parser.parseToEnd(
        '@media (min-width: 768px) and (max-width: 991px)',
      ),
    ).toMatchInlineSnapshot(`
      MediaQuery {
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "768px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "991px",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "1200px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "landscape",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "992px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "1199px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "pointer",
                    "value": "fine",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "576px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "767px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "hover",
                    "value": "none",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "576px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "portrait",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "767px",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "768px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "991px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "landscape",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "992px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "1199px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "pointer",
                    "value": "fine",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "hover",
                    "value": "hover",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "576px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "767px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "hover",
                    "value": "none",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-pointer",
                    "value": "coarse",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "576px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "portrait",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "767px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-color-scheme",
                    "value": "dark",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "768px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "991px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "orientation",
                    "value": "landscape",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "update",
                    "value": "fast",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-reduced-motion",
                    "value": "reduce",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "992px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "1199px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "pointer",
                    "value": "fine",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "hover",
                    "value": "hover",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-pointer",
                    "value": "coarse",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-hover",
                    "value": "none",
                  },
                },
              ],
            },
          ],
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
        "queries": OrSeparatedMediaRules {
          "queries": [
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "min-width",
                    "value": "576px",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "max-width",
                    "value": "767px",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "hover",
                    "value": "none",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "any-pointer",
                    "value": "coarse",
                  },
                },
              ],
            },
            AndSeparatedMediaRules {
              "queries": [
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "prefers-reduced-transparency",
                    "value": "reduce",
                  },
                },
                MediaRule {
                  "rules": MediaQuerySinglePair {
                    "key": "forced-colors",
                    "value": "active",
                  },
                },
              ],
            },
          ],
        },
      }
    `);
  });
});
