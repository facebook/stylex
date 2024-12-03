/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { CliConfig, TransformConfig } from '../src/config';

import { compileDirectory } from '../src/transform';
import * as cacheModule from '../src/cache';
import { getDefaultCachePath } from '../src/cache';

import fs from 'fs';
import { isDir, getRelativePath } from '../src/files';
import * as path from 'path';

const cp = require('child_process');

process.chdir('__tests__/__mocks__');

function clearTestDir(config: CliConfig) {
  for (const output of config.output) {
    fs.rmSync(output, { recursive: true, force: true });
  }
}

function runCli(args: string, config: CliConfig, onClose: () => void) {
  const cmd = 'node ' + path.resolve('../../lib/index.js ') + args;
  console.log(cmd);
  const script = cp.exec(cmd);
  script.addListener('error', (err) => {
    clearTestDir(config);
    throw err;
  });
  script.stderr.on('data', (data) => {
    process.kill(script.pid);
    clearTestDir(config);
    throw new Error('failed to start StyleX CLI', data);
  });
  script.addListener('close', onClose);
}

const snapshot = './snapshot';

const cachePath = getDefaultCachePath();
describe('compiling __mocks__/source to __mocks__/src correctly such that it matches __mocks__/snapshot', () => {
  afterAll(() => {
    fs.rmSync(config.output, { recursive: true, force: true });
    fs.rmSync(cachePath, { recursive: true, force: true });
  });
  // need to resolve to absolute paths because the compileDirectory function is expecting them.
  const config: TransformConfig = {
    input: path.resolve('./source'),
    output: path.resolve('./src'),
    styleXBundleName: 'stylex_bundle.css',
    modules_EXPERIMENTAL: [] as Array<string>,
    watch: false,
    babelPresets: [],
    state: {
      compiledCSSDir: null,
      compiledNodeModuleDir: null,
      compiledJS: new Map(),
      styleXRules: new Map(),
      copiedNodeModules: false,
    },
  };

  afterAll(() => fs.rmSync(config.output, { recursive: true, force: true }));

  test(config.input, () => {
    expect(isDir(config.input)).toBe(true);
  });

  test(config.output, async () => {
    fs.mkdirSync(config.output, { recursive: true });
    expect(isDir(config.output)).toBe(true);
    await compileDirectory(config);
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
  });
});

describe('cli works with -i and -o args', () => {
  const config: CliConfig = {
    input: ['./source'],
    output: ['./src'],
    styleXBundleName: 'stylex_bundle.css',
    modules_EXPERIMENTAL: [] as Array<string>,
    watch: false,
    babelPresets: [],
  };
  afterAll(() => clearTestDir(config));
  test('script start', (done) => {
    const onClose = () => {
      for (const dir of config.output) {
        const outputDir = fs.readdirSync(dir, { recursive: true });
        for (const file of outputDir) {
          const snapshotDir = path.resolve(path.join(snapshot, file));
          expect(fs.existsSync(snapshotDir)).toBe(true);
          const outputPath = path.join(dir, file);
          if (path.extname(outputPath) === '.js') {
            const outputContent = fs.readFileSync(outputPath).toString();
            const snapshotContent = fs.readFileSync(snapshotDir).toString();
            expect(outputContent).toEqual(snapshotContent);
          }
        }
      }
      clearTestDir(config);
      done();
    };

    runCli(`-i ${config.input[0]} -o ${config.output[0]}`, config, onClose);
  }, 10000);

  test('script runs with absolute input and output paths', (done) => {
    const absConfig: CliConfig = {
      ...config,
      input: [path.resolve(config.input[0])],
      output: [path.resolve(config.output[0])],
    };
    const onClose = () => {
      expect(fs.existsSync(config.output[0])).toBe(true);
      done();
    };
    clearTestDir(absConfig);
    runCli(
      `-i ${absConfig.input[0]} -o ${absConfig.output[0]}`,
      absConfig,
      onClose,
    );
  }, 10000);
});

describe('cli works with multiple inputs and outputs', () => {
  const config: CliConfig = {
    input: ['./source', './source2'],
    output: ['./src', './src2'],
    styleXBundleName: 'stylex_bundle.css',
    modules_EXPERIMENTAL: [] as Array<string>,
    watch: false,
    babelPresets: [],
  };
  afterAll(() => clearTestDir(config));
  test('script compiles multiple directories', (done) => {
    const onClose = () => {
      let isSecondOutput = false;
      for (const dir of config.output) {
        if (dir.endsWith('src2')) {
          isSecondOutput = true;
        }
        const outputDir = fs.readdirSync(dir, { recursive: true });
        for (const file of outputDir) {
          if (isSecondOutput) {
            expect(file).not.toContain(config.styleXBundleName);
          }
          const outputPath = path.join(dir, file);
          const snapshotDir = isSecondOutput ? snapshot + '2' : snapshot;
          const snapshotPath = path.join(snapshotDir, file);
          expect(fs.existsSync(snapshotPath)).toBe(true);
          if (path.extname(outputPath) === '.js') {
            const outputContent = fs.readFileSync(outputPath).toString();
            const snapshotContent = fs.readFileSync(snapshotPath).toString();
            expect(outputContent).toEqual(snapshotContent);
          }
        }
      }
      clearTestDir(config);
      done();
    };
    const input = config.input.join(' ');
    const output = config.output.join(' ');
    const args = `-i ${input} -o ${output}`;
    runCli(args, config, onClose);
  }, 10000);
});

describe('individual testing of util functions', () => {
  const config = {
    input: './source',
    output: './src',
    cssBundleName: 'stylex_bundle.css',
  };
  test('file to relative css path', () => {
    const mockFileName = './src/pages/home/page.js';
    const relativePath = getRelativePath(
      mockFileName,
      path.join(config.output, config.cssBundleName),
    );
    expect(relativePath).toEqual(`../../${config.cssBundleName}`);
  });
});

describe('cache mechanism works as expected', () => {
  let writeSpy;
  const config: TransformConfig = {
    input: path.resolve('./source'),
    output: path.resolve('./src'),
    styleXBundleName: 'stylex_bundle.css',
    modules_EXPERIMENTAL: [] as Array<string>,
    watch: false,
    babelPresets: [],
    state: {
      compiledCSSDir: null,
      compiledNodeModuleDir: null,
      compiledJS: new Map(),
      styleXRules: new Map(),
      copiedNodeModules: false,
    },
  };

  beforeEach(() => {
    writeSpy = jest.spyOn(cacheModule, 'writeCache');
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  afterAll(() => {
    fs.rmSync(config.output, { recursive: true, force: true });
    fs.rmSync(cachePath, { recursive: true, force: true });
  });

  test('first compilation populates the cache', async () => {
    fs.mkdirSync(config.output, { recursive: true });
    fs.mkdirSync(cachePath, { recursive: true });
    writeSpy = jest.spyOn(cacheModule, 'writeCache');

    await compileDirectory(config);
    expect(writeSpy).toHaveBeenCalledTimes(3);

    const cacheFiles = fs.readdirSync(cachePath);
    expect(cacheFiles.length).toEqual(3);

    for (const cacheFile of cacheFiles) {
      const cacheFilePath = path.join(cachePath, cacheFile);
      const cacheContent = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
      expect(cacheContent).toHaveProperty('inputHash');
      expect(cacheContent).toHaveProperty('outputHash');
      expect(cacheContent).toHaveProperty('collectedCSS');
    }
  });

  test('skips transformation when cache is valid', async () => {
    await compileDirectory(config);

    // Ensure no additional writes were made due to no file changes
    expect(writeSpy).toHaveBeenCalledTimes(0);
    writeSpy.mockRestore();
  });

  test('recompiles when input changes', async () => {
    const mockFilePath = path.join(config.input, 'index.js');
    const mockFileOutputPath = path.join(config.output, 'index.js');
    const newContent = 'console.log("Updated content");';
    const originalContent = fs.readFileSync(mockFilePath, 'utf-8');
    const originalOutputContent = fs.readFileSync(mockFileOutputPath, 'utf-8');

    fs.appendFileSync(mockFilePath, newContent, 'utf-8');

    await compileDirectory(config);

    // Ensure index.js is rewritten due to cache invalidation
    expect(writeSpy).toHaveBeenCalledTimes(1);

    fs.writeFileSync(mockFilePath, originalContent, 'utf-8');
    fs.writeFileSync(mockFileOutputPath, originalOutputContent, 'utf-8');

    writeSpy.mockRestore();
  });
});

describe('CLI works with a custom cache path', () => {
  const customCachePath = path.join(__dirname, '__custom_cache__');
  const config: TransformConfig = {
    input: path.resolve('./source'),
    output: path.resolve('./src'),
    styleXBundleName: 'stylex_bundle.css',
    modules_EXPERIMENTAL: [] as Array<string>,
    watch: false,
    babelPresets: [],
    cachePath: customCachePath,
    state: {
      compiledCSSDir: null,
      compiledNodeModuleDir: null,
      compiledJS: new Map(),
      styleXRules: new Map(),
      copiedNodeModules: false,
    },
  };
  config.cachePath = customCachePath;

  beforeEach(() => {
    // Clear custom cache directory before each test
    if (fs.existsSync(customCachePath)) {
      fs.rmSync(customCachePath, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    // Cleanup: Remove the custom cache directory after all tests
    if (fs.existsSync(customCachePath)) {
      fs.rmSync(customCachePath, { recursive: true, force: true });
    }
  });

  test('uses the custom cache path for caching', async () => {
    fs.mkdirSync(config.input, { recursive: true });
    fs.mkdirSync(config.output, { recursive: true });

    await compileDirectory(config);

    const customFilePath = path.join(config.input, 'index.js');

    const cacheFilePath = path.join(
      customCachePath,
      path.relative(config.input, customFilePath) + '.json',
    );

    expect(fs.existsSync(customCachePath)).toBe(true);
    expect(fs.existsSync(cacheFilePath)).toBe(true);

    const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
    expect(cacheData).toHaveProperty('inputHash');
    expect(cacheData).toHaveProperty('outputHash');
    expect(cacheData).toHaveProperty('collectedCSS');
  });
});
