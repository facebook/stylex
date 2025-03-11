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
// const rootDir = path.resolve(__dirname, './__fixtures__');
const classNamePrefix = 'x';
const defaultOpts = {
  stylexSheetName: '<>',
  unstable_moduleResolution: { type: 'haste' },
  classNamePrefix,
};

function transform(file, opts = defaultOpts) {
  const result = transformFileSync(file, {
    filename: opts.filename || '/stylex/packages/TestTheme.stylex.js',
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

const themeFile = path.resolve(__dirname, '../__fixtures__/colorThemes.js');

describe('create theme', () => {
  it('should transform complex theme file', () => {
    const result = transform(themeFile);
    expect(result.code).toMatchSnapshot();
    expect(result.styles).toMatchSnapshot();
  });
});
