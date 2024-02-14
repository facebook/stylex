/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

const fs = require('fs');
const transform = require('../src/transform');
const files = require('../src/files');
const path = require('path');

const cp = require('child_process');

process.chdir('__tests__/__mocks__');

const input = 'source';
const output = 'src';
const snapshot = 'snapshot';

global.INPUT_DIR = path.normalize(input);
global.INPUT_PARENT = path.dirname(global.INPUT_DIR);
global.COMPILED_DIR = path.join(global.INPUT_PARENT, 'src');
global.CSS_BUNDLE_NAME = 'stylex_bundle.css';
global.CSS_BUNDLE_PATH = path.join(global.COMPILED_DIR, global.CSS_BUNDLE_NAME);

describe('compiling __mocks__/source to __mocks__/src correctly such that it matches __mocks__/output', () => {
  test(input, () => {
    expect(files.isDir(input)).toBe(true);
  });

  test(output, async () => {
    fs.mkdirSync(output);
    expect(files.isDir(output)).toBe(true);
    await transform
      .compileDirectory(input)
      .then(() => {
        const outputDir = fs.readdirSync(output);
        for (const file of outputDir) {
          const outputPath = path.join(output, file);
          const snapshotPath = path.join(snapshot, file);
          expect(fs.existsSync(snapshotPath)).toBe(true);
          if (path.extname(outputPath) === '.js') {
            const outputContent = fs.readFileSync(outputPath).toString();
            const snapshotContent = fs.readFileSync(snapshotPath).toString();
            expect(outputContent).toEqual(snapshotContent);
          }
        }
        fs.rmSync(output, { recursive: true, force: true });
      })
      .catch((err) => {
        fs.rmSync(output, { recursive: true, force: true });
        throw err;
      });
  });
});

describe('indivual testing of util functions', () => {
  test('file to relative css path', () => {
    const mockFileName = './source/pages/home/page.js';
    const relativePath = files.getCssPathFromFilePath(mockFileName);
    expect(relativePath).toEqual('../../stylex_bundle.css');
  });
});

describe('watch mode starts successfully', () => {
  test('script', (done) => {
    const cmd = 'node ' + path.resolve('../../lib/index.js -d source', ' -w');
    const script = cp.exec(cmd);
    script.stdout.on('data', (data) => {
      expect(data).toContain('watching for style changes');
      fs.rmSync(output, { recursive: true, force: true });
      process.kill(script.pid);
      done();
    });
    script.stderr.on('data', (data) => {
      console.error('stderr: ' + data);
      process.kill(script.pid);
      fs.rmSync(output, { recursive: true, force: true });
      done();
    });
  });
});
