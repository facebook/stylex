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

config = {
  input: path.normalize(input),
  output: path.normalize('./src'),
  cssBundleName: 'stylex_bundle.css',
};

describe('compiling __mocks__/source to __mocks__/src correctly such that it matches __mocks__/snapshot', () => {
  test(input, () => {
    expect(files.isDir(input)).toBe(true);
  });

  test(output, async () => {
    fs.mkdirSync(output);
    expect(files.isDir(output)).toBe(true);

    try {
      await transform.compileDirectory(config);

      const outputDir = fs.readdirSync(config.output);
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
    } finally {
      fs.rmSync(output, { recursive: true, force: true });
    }
  });
});

describe('individual testing of util functions', () => {
  test('file to relative css path', () => {
    const mockFileName = './source/pages/home/page.js';
    const relativePath = files.getCssPathFromFilePath(mockFileName, config);
    expect(relativePath).toEqual(`../../${config.cssBundleName}`);
  });
});

describe('watch mode starts successfully', () => {
  test('script start', (done) => {
    const cmd = 'node ' + path.resolve('../../lib/index.js -d source', ' -w');
    const script = cp.exec(cmd);
    // ignore ascii art
    let firstStd = false;
    script.stdout.on('data', (data) => {
      if (!firstStd) {
        firstStd = true;
        return;
      }

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