/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
    plugins: [[stylexPlugin, opts]],
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
        "import stylex from 'stylex';
        stylex.inject(".x18qx21s{transform:rotate(10deg) translate3d(0,0,0)}", 3000);"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { color: 'rgba( 1, 222,  33 , 0.5)' } });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xe1l9yr{color:rgba(1,222,33,.5)}", 3000);"
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
        "import stylex from 'stylex';
        stylex.inject(".x1ghz6dp{margin:0}", 1000);
        stylex.inject(".xgsvwom{margin-left:1px}", 4000);"
      `);
    });

    test('0 timings are all "0s"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { transitionDuration: '500ms' } });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1wsgiic{transition-duration:.5s}", 3000);"
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
        "import stylex from 'stylex';
        stylex.inject(".x1jpfit1{transform:0deg}", 3000);"
      `);
    });

    test('calc() preserves spaces aroung "+" and "-"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { width: 'calc((100% + 3% -   100px) / 7)' } });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1hauit9{width:calc((100% + 3% - 100px) / 7)}", 4000);"
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
        "import stylex from 'stylex';
        stylex.inject(".xpvlhck{transition-duration:.01s}", 3000);
        stylex.inject(".xxziih7{transition-timing-function:cubic-bezier(.08,.52,.52,1)}", 3000);"
      `);
    });

    test('use double quotes in empty strings', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { quotes: "''" } });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x169joja{quotes:\\"\\"}", 3000);"
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
        "import stylex from 'stylex';
        stylex.inject(".xsa3hc2{transition-duration:1.234s}", 3000);
        stylex.inject(".xpvlhck{transition-duration:.01s}", 3000);
        stylex.inject(".xjd9b36{transition-duration:1ms}", 3000);"
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
              opacity: 0.5
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1egiwwb{height:500px}", 4000);
        stylex.inject(".x1oin6zd{margin:10px}", 1000);
        stylex.inject(".xvue9z{width:500px}", 4000);
        stylex.inject(".xk50ysn{font-weight:500}", 3000);
        stylex.inject(".x1evy7pa{line-height:1.5}", 3000);
        stylex.inject(".xbyyjgo{opacity:.5}", 3000);"
      `);
    });

    test('number values rounded down to four decimal points', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { height: 100 / 3 } });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1vvwc6p{height:33.3333px}", 4000);"
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
        "import stylex from 'stylex';
        stylex.inject(".x14axycx{content:\\"\\"}", 3000);
        stylex.inject(".xmmpjw1{content:\\"next\\"}", 3000);
        stylex.inject(".x12vzfr8{content:\\"prev\\"}", 3000);"
      `);
    });

    test('[legacy] transforms font size from px to rem', () => {
      expect(
        transform(`
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
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xngnso2{font-size:1.5rem}", 3000);
        stylex.inject(".x1c3i2sq{font-size:1.125rem}", 3000);
        stylex.inject(".x1603h9y{font-size:1.25rem}", 3000);
        stylex.inject(".x1qlqyl8{font-size:inherit}", 3000);"
      `);
    });

    test('[legacy] transforms font size from px to rem even with calc', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              fontSize: 'calc(100% - 24px)',
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x37c5sx{font-size:calc(100% - 1.5rem)}", 3000);"
      `);
    });

    test('[legacy] no space before "!important"', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({ x: { color: 'red !important' } });
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".xzw3067{color:red!important}", 3000);"
      `);
    });
  });
});
