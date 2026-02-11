/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [
      [
        stylexPlugin,
        {
          runtimeInjection: true,
          ...opts,
        },
      ],
    ],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  /**
   * CSS value normalization
   */

  describe('[transform] CSS value normalization', () => {
    test('normalize whitespace in CSS values', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            x: {
              transform: '  rotate(10deg)  translate3d( 0 , 0 , 0 )  '
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x18qx21s{transform:rotate(10deg) translate3d(0,0,0)}",
          priority: 3000
        });"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { color: 'rgba( 1, 222,  33 , 0.5)' } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xe1l9yr{color:rgba(1,222,33,.5)}",
          priority: 3000
        });"
      `);
    });

    test('no dimensions for 0 values', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: {
            margin: '0px',
            marginLeft: '1px'
          } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1ghz6dp{margin:0}",
          priority: 1000
        });
        _inject2({
          ltr: ".xgsvwom{margin-left:1px}",
          priority: 4000
        });"
      `);
    });

    test('0 timings are all "0s"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { transitionDuration: '500ms' } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1wsgiic{transition-duration:.5s}",
          priority: 3000
        });"
      `);
    });

    test('0 angles are all "0deg"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            x: { transform: '0rad' },
            y: { transform: '0turn' },
            z: { transform: '0grad' }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1jpfit1{transform:0deg}",
          priority: 3000
        });"
      `);
    });

    test('calc() preserves spaces around "+" and "-"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { width: 'calc((100% + 3% -   100px) / 7)' } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1hauit9{width:calc((100% + 3% - 100px) / 7)}",
          priority: 4000
        });"
      `);
    });

    test('strip leading zeros', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: {
            transitionDuration: '0.01s',
            transitionTimingFunction: 'cubic-bezier(.08,.52,.52,1)'
          } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xpvlhck{transition-duration:.01s}",
          priority: 3000
        });
        _inject2({
          ltr: ".xxziih7{transition-timing-function:cubic-bezier(.08,.52,.52,1)}",
          priority: 3000
        });"
      `);
    });

    test('use double quotes in empty strings', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { quotes: "''" } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x169joja{quotes:\\"\\"}",
          priority: 3000
        });"
      `);
    });

    test('timing values are converted to seconds unless < 10ms', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            x: { transitionDuration: '1234ms' },
            y: { transitionDuration: '10ms' },
            z: { transitionDuration: '1ms' }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xsa3hc2{transition-duration:1.234s}",
          priority: 3000
        });
        _inject2({
          ltr: ".xpvlhck{transition-duration:.01s}",
          priority: 3000
        });
        _inject2({
          ltr: ".xjd9b36{transition-duration:1ms}",
          priority: 3000
        });"
      `);
    });

    test('transforms non-unitless property values', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            normalize: {
              height: 500,
              margin: 10,
              width: 500
            },
            unitless: {
              fontWeight: 500,
              lineHeight: 1.5,
              opacity: 0.5,
              zoom: 2,
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1egiwwb{height:500px}",
          priority: 4000
        });
        _inject2({
          ltr: ".x1oin6zd{margin:10px}",
          priority: 1000
        });
        _inject2({
          ltr: ".xvue9z{width:500px}",
          priority: 4000
        });
        _inject2({
          ltr: ".xk50ysn{font-weight:500}",
          priority: 3000
        });
        _inject2({
          ltr: ".x1evy7pa{line-height:1.5}",
          priority: 3000
        });
        _inject2({
          ltr: ".xbyyjgo{opacity:.5}",
          priority: 3000
        });
        _inject2({
          ltr: ".xy2o3ld{zoom:2}",
          priority: 3000
        });"
      `);
    });

    test('number values rounded down to four decimal points', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { height: 100 / 3 } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x1vvwc6p{height:33.3333px}",
          priority: 4000
        });"
      `);
    });

    test('"content" property values are wrapped in quotes', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              content: '',
            },
            other: {
              content: 'next',
            },
            withQuotes: {
              content: '"prev"',
            }
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".x14axycx{content:\\"\\"}",
          priority: 3000
        });
        _inject2({
          ltr: ".xmmpjw1{content:\\"next\\"}",
          priority: 3000
        });
        _inject2({
          ltr: ".x12vzfr8{content:\\"prev\\"}",
          priority: 3000
        });"
      `);
    });

    test('[legacy] no space before "!important"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { color: 'red !important' } });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2({
          ltr: ".xzw3067{color:red!important}",
          priority: 3000
        });"
      `);
    });
  });

  describe('[transform] fontSize with:', () => {
    describe('enableFontSizePxToRem: true', () => {
      test('transforms font size from px to rem', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                fontSize: '24px',
              },
              bar: {
                fontSize: 18,
              },
              baz: {
                fontSize: '1.25rem',
              },
              qux: {
                fontSize: 'inherit',
              }
            });
          `,
            { enableFontSizePxToRem: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2({
            ltr: ".xngnso2{font-size:1.5rem}",
            priority: 3000
          });
          _inject2({
            ltr: ".x1c3i2sq{font-size:1.125rem}",
            priority: 3000
          });
          _inject2({
            ltr: ".x1603h9y{font-size:1.25rem}",
            priority: 3000
          });
          _inject2({
            ltr: ".x1qlqyl8{font-size:inherit}",
            priority: 3000
          });"
        `);
      });

      test('transforms font size from px to rem even with calc', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                fontSize: 'calc(100% - 24px)',
              },
            });
          `,
            { enableFontSizePxToRem: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2({
            ltr: ".x37c5sx{font-size:calc(100% - 1.5rem)}",
            priority: 3000
          });"
        `);
      });
    });

    describe('enableFontSizePxToRem: false', () => {
      test('ignores px font size', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                fontSize: '24px',
              },
              bar: {
                fontSize: 18,
              },
              baz: {
                fontSize: '1.25rem',
              },
              qux: {
                fontSize: 'inherit',
              }
            });
          `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2({
            ltr: ".x1pvqxga{font-size:24px}",
            priority: 3000
          });
          _inject2({
            ltr: ".xosj86m{font-size:18px}",
            priority: 3000
          });
          _inject2({
            ltr: ".x1603h9y{font-size:1.25rem}",
            priority: 3000
          });
          _inject2({
            ltr: ".x1qlqyl8{font-size:inherit}",
            priority: 3000
          });"
        `);
      });

      test('ignores px font size within calc', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              foo: {
                fontSize: 'calc(100% - 24px)',
              },
            });
          `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2({
            ltr: ".x1upkca{font-size:calc(100% - 24px)}",
            priority: 3000
          });"
        `);
      });
    });
  });
});
