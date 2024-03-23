/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

const fs = require('fs');
const transform = require('../src/transform');
const files = require('../src/files');
const path = require('path');

const cp = require('child_process');

process.chdir('__tests__/__mocks__');

const snapshot = './snapshot';

describe('compiling __mocks__/source to __mocks__/src correctly such that it matches __mocks__/snapshot', () => {
  // need to resolve to aboslute paths because the compileDirectory function is expecting them.
  const config = {
    input: path.resolve('./source'),
    output: path.resolve('./src'),
    cssBundleName: 'stylex_bundle.css',
  };

  test(config.input, () => {
    expect(files.isDir(config.input)).toBe(true);
  });

  test(config.output, async () => {
    fs.mkdirSync(config.output);
    expect(files.isDir(config.output)).toBe(true);

    try {
      await transform.compileDirectory(config);
      const outputDir = fs.readdirSync(config.output, { recursive: true });
      for (const file of outputDir) {
        const outputPath = path.join(config.output, file);
        const snapshotPath = path.join(snapshot, file);
        expect(fs.existsSync(snapshotPath)).toBe(true);
        if (path.extname(outputPath) === '.js') {
          const outputContent = fs.readFileSync(outputPath).toString();
          const snapshotContent = fs.readFileSync(snapshotPath).toString();
          expect(outputContent).toEqual(snapshotContent);
        }
      }
    } finally {
      fs.rmSync(config.output, { recursive: true, force: true });
    }
  });
});

describe('individual testing of util functions', () => {
  const config = {
    input: './source',
    output: './src',
    cssBundleName: 'stylex_bundle.css',
  };
  test('file to relative css path', () => {
    const mockFileName = './source/pages/home/page.js';
    const relativePath = files.getCssPathFromFilePath(mockFileName, config);
    expect(relativePath).toEqual(`../../${config.cssBundleName}`);
  });
});

describe('cli works with -i and -o args', () => {
  const config = {
    input: './source',
    output: './src',
    cssBundleName: 'stylex_bundle.css',
  };
  test('script start', (done) => {
    const cmd =
      'node ' +
      path.resolve('../../lib/index.js ') +
      `-i ${config.input} -o ${config.output}`;
    const script = cp.exec(cmd);

    script.addListener('error', (err) => {
      throw new Error('failed to start StyleX CLI watch mode:', err);
    });

    script.addListener('close', () => {
      const outputDir = fs.readdirSync(config.output, { recursive: true });
      for (const file of outputDir) {
        const outputPath = path.join(config.output, file);
        const snapshotPath = path.join(snapshot, file);
        expect(fs.existsSync(snapshotPath)).toBe(true);
        if (path.extname(outputPath) === '.js') {
          const outputContent = fs.readFileSync(outputPath).toString();
          const snapshotContent = fs.readFileSync(snapshotPath).toString();
          expect(outputContent).toEqual(snapshotContent);
        }
      }
      fs.rmSync(config.output, { recursive: true, force: true });
      done();
    });

    script.stderr.on('data', (data) => {
      process.kill(script.pid);
      fs.rmSync(config.output, { recursive: true, force: true });
      throw new Error('failed to start StyleX CLI watch mode:', data);
    });
  });
});
