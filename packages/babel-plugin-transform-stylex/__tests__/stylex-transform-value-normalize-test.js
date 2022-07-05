/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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
      flow: {
        all: true,
      },
    },
    plugins: [[stylexPlugin, opts]],
  }).code;
}

/* eslint-disable quotes */
describe('babel-plugin-transform-stylex', () => {
  /**
   * CSS value normalization
   */

  describe('[transform] CSS value normalization', () => {
    test('normalize whitespace in CSS values', () => {
      expect(
        transform(`
          const styles = stylex.create({
            x: {
              transform: '  rotate(10deg)  translate3d( 0 , 0 , 0 )  '
            }
          });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".x18qx21s{transform:rotate(10deg) translate3d(0,0,0)}\\", 0.1);"'
      );
      expect(
        transform(`
          const styles = stylex.create({ x: { color: 'rgba( 1, 222,  33 , 0.5)' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".xe1l9yr{color:rgba(1,222,33,.5)}\\", 1);"'
      );
    });

    test('no dimensions for 0 values', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: {
            margin: '0px',
            marginLeft: '1px'
          } });
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xdj266r{margin-top:0}\\", 1);
        stylex.inject(\\".x11i5rnm{margin-right:0}\\", 1, \\".x11i5rnm{margin-left:0}\\");
        stylex.inject(\\".xat24cr{margin-bottom:0}\\", 1);
        stylex.inject(\\".x1mh8g0r{margin-left:0}\\", 1, \\".x1mh8g0r{margin-right:0}\\");
        stylex.inject(\\".xgsvwom{margin-left:1px}\\", 1);"
      `);
    });

    test('0 timings are all "0s"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { transitionDuration: '500ms' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".x1wsgiic{transition-duration:.5s}\\", 1);"'
      );
    });

    test('0 angles are all "0deg"', () => {
      expect(
        transform(`
          const styles = stylex.create({
            x: { transform: '0rad' },
            y: { transform: '0turn' },
            z: { transform: '0grad' }
          });
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1jpfit1{transform:0deg}\\", 0.1);
        stylex.inject(\\".x1jpfit1{transform:0deg}\\", 0.1);
        stylex.inject(\\".x1jpfit1{transform:0deg}\\", 0.1);"
      `);
    });

    test('calc() preserves spaces aroung "+" and "-"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { width: 'calc((100% + 3% -   100px) / 7)' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".x1hauit9{width:calc((100% + 3% - 100px) / 7)}\\", 1);"'
      );
    });

    test('strip leading zeros', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: {
            transitionDuration: '0.01s',
            transitionTimingFunction: 'cubic-bezier(.08,.52,.52,1)'
          } });
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xpvlhck{transition-duration:.01s}\\", 1);
        stylex.inject(\\".xxziih7{transition-timing-function:cubic-bezier(.08,.52,.52,1)}\\", 1);"
      `);
    });

    test('use double quotes in empty strings', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { quotes: "''" } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".x169joja{quotes:\\\\\\"\\\\\\"}\\", 1);"'
      );
    });

    test('timing values are converted to seconds unless < 10ms', () => {
      expect(
        transform(`
          const styles = stylex.create({
            x: { transitionDuration: '1234ms' },
            y: { transitionDuration: '10ms' },
            z: { transitionDuration: '1ms' }
          });
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xsa3hc2{transition-duration:1.234s}\\", 1);
        stylex.inject(\\".xpvlhck{transition-duration:.01s}\\", 1);
        stylex.inject(\\".xjd9b36{transition-duration:1ms}\\", 1);"
      `);
    });

    test('transforms non-unitless property values', () => {
      expect(
        transform(`
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
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x1egiwwb{height:500px}\\", 1);
        stylex.inject(\\".x1anpbxc{margin-top:10px}\\", 1);
        stylex.inject(\\".xmo9yow{margin-right:10px}\\", 1, \\".xmo9yow{margin-left:10px}\\");
        stylex.inject(\\".xyorhqc{margin-bottom:10px}\\", 1);
        stylex.inject(\\".x17adc0v{margin-left:10px}\\", 1, \\".x17adc0v{margin-right:10px}\\");
        stylex.inject(\\".xvue9z{width:500px}\\", 1);
        stylex.inject(\\".xk50ysn{font-weight:500}\\", 1);
        stylex.inject(\\".x1evy7pa{line-height:1.5}\\", 1);
        stylex.inject(\\".xbyyjgo{opacity:.5}\\", 1);"
      `);
    });

    test('number values rounded down to four decimal points', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { height: 100 / 3 } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".x1vvwc6p{height:33.3333px}\\", 1);"'
      );
    });

    test('"content" property values are wrapped in quotes', () => {
      expect(
        transform(`
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
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".x14axycx{content:\\\\\\"\\\\\\"}\\", 1);
        stylex.inject(\\".xmmpjw1{content:\\\\\\"next\\\\\\"}\\", 1);
        stylex.inject(\\".x12vzfr8{content:\\\\\\"prev\\\\\\"}\\", 1);"
      `);
    });

    test('[legacy] transforms font size from px to rem', () => {
      expect(
        transform(`
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
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".xngnso2{font-size:1.5rem}\\", 1);
        stylex.inject(\\".x1c3i2sq{font-size:1.125rem}\\", 1);
        stylex.inject(\\".x1603h9y{font-size:1.25rem}\\", 1);
        stylex.inject(\\".x1qlqyl8{font-size:inherit}\\", 1);"
      `);
    });

    test('[legacy] transforms font size from px to rem even with calc', () => {
      expect(
        transform(`
          const styles = stylex.create({
            foo: {
              fontSize: 'calc(100% - 24px)',
            },
          });
        `)
      ).toMatchInlineSnapshot(
        `"stylex.inject(\\".x37c5sx{font-size:calc(100% - 1.5rem)}\\", 1);"`
      );
    });

    test('[legacy] no space before "!important"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { color: 'red !important' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".xzw3067{color:red!important}\\", 1);"'
      );
    });
  });
});
