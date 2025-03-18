/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

const { transformFileSync } = require('@babel/core');
const stylexPlugin = require('../src/index');
const path = require('path');

const classNamePrefix = 'x';
const defaultOpts = {
  stylexSheetName: '<>',
  unstable_moduleResolution: { type: 'haste' },
  classNamePrefix,
};

const simpleThemeFile = path.resolve(
  __dirname,
  '../__fixtures__/simpleTheme.js',
);
const themeFile = path.resolve(__dirname, '../__fixtures__/colorThemes.js');

function transform(file, opts = defaultOpts) {
  const result = transformFileSync(file, {
    filename: opts.filename || file || themeFile,
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      ['babel-plugin-syntax-hermes-parser', { flow: 'detect' }],
      [stylexPlugin, { ...defaultOpts, ...opts }],
    ],
  });
  return { code: result.code, styles: result.metadata.stylex };
}

describe('create theme', () => {
  test('transform complex theme file', () => {
    // warm up
    transform(simpleThemeFile);

    const simpleStart = performance.now();
    const simpleResult = transform(simpleThemeFile);
    const simpleEnd = performance.now();
    expect(simpleResult.code).toMatchSnapshot();
    expect(simpleResult.styles).toMatchSnapshot();
    const simpleTimeTaken = simpleEnd - simpleStart;
    console.log('simpleTimeTaken', simpleTimeTaken);

    const start = performance.now();
    const result = transform(themeFile);
    const end = performance.now();
    const timeTaken = end - start;
    expect(result.code).toMatchSnapshot();
    expect(result.styles).toMatchSnapshot();
    console.log('timeTaken', timeTaken);

    expect(timeTaken).toBeLessThan(simpleTimeTaken * 20);
  });
});
