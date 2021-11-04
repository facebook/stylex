/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
        '"stylex.inject(\\".jr0nlbo0{transform:rotate(10deg) translate3d(0,0,0)}\\", 0.1);"'
      );
      expect(
        transform(`
          const styles = stylex.create({ x: { color: 'rgba( 1, 222,  33 , 0.5)' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".s89qmqjn{color:rgba(1,222,33,.5)}\\", 1);"'
      );
    });

    test('no space before "!important"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { color: 'red !important' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".fg1v9vue{color:red!important}\\", 1);"'
      );
    });

    test('no dimensions for 0 values', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { margin: '0px 1px 0rem -1pt' } });
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".m8h3af8h{margin-top:0}\\", 1);
        stylex.inject(\\".ewco64xe{margin-right:1px}\\", 1, \\".ewco64xe{margin-left:1px}\\");
        stylex.inject(\\".kjdc1dyq{margin-bottom:0}\\", 1);
        stylex.inject(\\".jqrqz23d{margin-left:-1pt}\\", 1, \\".jqrqz23d{margin-right:-1pt}\\");"
      `);
    });

    test('0 timings are all "0s"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { transitionDuration: '500ms 0ms 0s' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".kf9ztemh{transition-duration:.5s 0s 0s}\\", 1);"'
      );
    });

    test('0 angles are all "0deg"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { transform: '0deg 0rad 0turn 0grad' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".bf5qcrrg{transform:0deg 0deg 0deg 0deg}\\", 0.1);"'
      );
    });

    test('calc() preserves spaces aroung "+" and "-"', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { width: 'calc((100% + 3% -   100px) / 7)' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".dztgb271{width:calc((100% + 3% - 100px) / 7)}\\", 1);"'
      );
    });

    test('strip leading zeros', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { transitionDuration: '0.01s 0.02s', transitionTimingFunction: 'cubic-bezier(.08,.52,.52,1)' } });
        `)
      ).toMatchInlineSnapshot(`
        "stylex.inject(\\".qi7d2a38{transition-duration:.01s .02s}\\", 1);
        stylex.inject(\\".lvdmvkcg{transition-timing-function:cubic-bezier(.08,.52,.52,1)}\\", 1);"
      `);
    });

    test('use double quotes in empty strings', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { quotes: "''" } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".prnalohw{quotes:\\\\\\"\\\\\\"}\\", 1);"'
      );
    });

    test('timing values are converted to seconds unless < 10ms', () => {
      expect(
        transform(`
          const styles = stylex.create({ x: { transitionDuration: '1s 1234ms 500ms 100ms 10ms 1ms 90deg 0ms' } });
        `)
      ).toMatchInlineSnapshot(
        '"stylex.inject(\\".fyaq63wf{transition-duration:1s 1.234s .5s .1s .01s 1ms 90deg 0s}\\", 1);"'
      );
    });
  });
});
