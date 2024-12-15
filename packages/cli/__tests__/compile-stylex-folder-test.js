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

const fs = require('fs').promises;
import { isDir, getRelativePath } from '../src/files';
import * as path from 'path';

const cp = require('child_process');

process.chdir('__tests__/__mocks__');

async function clearTestDir(config: CliConfig) {
  for (const output of config.output) {
    await fs.rm(output, { recursive: true, force: true });
  }
}

function runCli(
  args: string,
  config: CliConfig,
  onClose: () => void | Promise<void>,
) {
  const cmd = 'node ' + path.resolve('../../lib/index.js ') + args;
  console.log(cmd);
  const script = cp.exec(cmd);

  script.addListener('error', async (err) => {
    await clearTestDir(config);
    throw err;
  });

  script.stderr.on('data', async (data) => {
    process.kill(script.pid);
    await clearTestDir(config);
    throw new Error('failed to start StyleX CLI', data);
  });

  script.addListener('close', () => {
    Promise.resolve(onClose()).catch((err) => {
      throw new Error(`Error in onClose callback: ${err.message}`);
    });
  });
}

const snapshot = './snapshot';

const cachePath = getDefaultCachePath();
describe('compiling __mocks__/source to __mocks__/src correctly such that it matches __mocks__/snapshot', () => {
  afterAll(async () => {
    await fs.rm(config.output, { recursive: true, force: true });
    await fs.rm(cachePath, { recursive: true, force: true });
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

  afterAll(async () => {
    await fs.rm(config.output, { recursive: true, force: true });
  });

  test(config.input, async () => {
    expect(await isDir(config.input)).toBe(true);
  });

  test(config.output, async () => {
    await fs.mkdir(config.output, { recursive: true });
    expect(await isDir(config.output)).toBe(true);
    await compileDirectory(config);
    const outputDir = await fs.readdir(config.output);
    for (const file of outputDir) {
      const outputPath = path.join(config.output, file);
      const snapshotPath = path.join(snapshot, file);
      expect(
        await fs
          .access(snapshotPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);
      if (path.extname(outputPath) === '.js') {
        const outputContent = await fs.readFile(outputPath, 'utf-8');
        const snapshotContent = await fs.readFile(snapshotPath, 'utf-8');
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
  afterAll(async () => await clearTestDir(config));

  test('script start', (done) => {
    const onClose = async () => {
      for (const dir of config.output) {
        const outputDir = await fs.readdir(dir);
        for (const file of outputDir) {
          const snapshotDir = path.resolve(path.join(snapshot, file));
          expect(
            await fs
              .access(snapshotDir)
              .then(() => true)
              .catch(() => false),
          ).toBe(true);
          const outputPath = path.join(dir, file);
          if (path.extname(outputPath) === '.js') {
            const outputContent = await fs.readFile(outputPath, 'utf-8');
            const snapshotContent = await fs.readFile(snapshotDir, 'utf-8');
            expect(outputContent).toEqual(snapshotContent);
          }
        }
      }
      await clearTestDir(config);
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
    const onClose = async () => {
      expect(
        await fs
          .access(config.output[0])
          .then(() => true)
          .catch(() => false),
      ).toBe(true);
      done();
    };
    clearTestDir(absConfig).then(() => {
      runCli(
        `-i ${absConfig.input[0]} -o ${absConfig.output[0]}`,
        absConfig,
        onClose,
      );
    });
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
  afterAll(async () => await clearTestDir(config));

  test('script compiles multiple directories', (done) => {
    const onClose = async () => {
      let isSecondOutput = false;
      for (const dir of config.output) {
        if (dir.endsWith('src2')) {
          isSecondOutput = true;
        }
        const outputDir = await fs.readdir(dir);
        for (const file of outputDir) {
          if (isSecondOutput) {
            expect(file).not.toContain(config.styleXBundleName);
          }
          const outputPath = path.join(dir, file);
          const snapshotDir = isSecondOutput ? snapshot + '2' : snapshot;
          const snapshotPath = path.join(snapshotDir, file);
          expect(
            await fs
              .access(snapshotPath)
              .then(() => true)
              .catch(() => false),
          ).toBe(true);
          if (path.extname(outputPath) === '.js') {
            const outputContent = await fs.readFile(outputPath, 'utf-8');
            const snapshotContent = await fs.readFile(snapshotPath, 'utf-8');
            expect(outputContent).toEqual(snapshotContent);
          }
        }
      }
      await clearTestDir(config);
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
  test('file to relative css path', async () => {
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

  afterAll(async () => {
    await fs.rm(config.output, { recursive: true, force: true });
    await fs.rm(cachePath, { recursive: true, force: true });
  });

  test('first compilation populates the cache', async () => {
    await fs.mkdir(config.output, { recursive: true });
    await fs.mkdir(cachePath, { recursive: true });
    writeSpy = jest.spyOn(cacheModule, 'writeCache');

    await compileDirectory(config);
    expect(writeSpy).toHaveBeenCalledTimes(3);

    const cacheFiles = await fs.readdir(cachePath);
    expect(cacheFiles.length).toEqual(3);

    for (const cacheFile of cacheFiles) {
      const cacheFilePath = path.join(cachePath, cacheFile);
      const cacheContent = JSON.parse(
        await fs.readFile(cacheFilePath, 'utf-8'),
      );
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
    const originalContent = await fs.readFile(mockFilePath, 'utf-8');
    const originalOutputContent = await fs.readFile(
      mockFileOutputPath,
      'utf-8',
    );

    await fs.appendFile(mockFilePath, newContent, 'utf-8');

    await compileDirectory(config);

    // Ensure index.js is rewritten due to cache invalidation
    expect(writeSpy).toHaveBeenCalledTimes(1);

    await fs.writeFile(mockFilePath, originalContent, 'utf-8');
    await fs.writeFile(mockFileOutputPath, originalOutputContent, 'utf-8');

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

  beforeEach(async () => {
    if (
      await fs
        .access(customCachePath)
        .then(() => true)
        .catch(() => false)
    ) {
      await fs.rm(customCachePath, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    await fs.rm(config.output, { recursive: true, force: true });
    if (
      await fs
        .access(customCachePath)
        .then(() => true)
        .catch(() => false)
    ) {
      await fs.rm(customCachePath, { recursive: true, force: true });
    }
  });

  test('uses the custom cache path for caching', async () => {
    await compileDirectory(config);

    const customFilePath = path.join(config.input, 'index.js');

    const cacheFilePath = path.join(
      customCachePath,
      path.relative(config.input, customFilePath) + '.json',
    );

    expect(
      await fs
        .access(customCachePath)
        .then(() => true)
        .catch(() => false),
    ).toBe(true);
    expect(
      await fs
        .access(cacheFilePath)
        .then(() => true)
        .catch(() => false),
    ).toBe(true);

    const cacheData = JSON.parse(await fs.readFile(cacheFilePath, 'utf-8'));
    expect(cacheData).toHaveProperty('inputHash');
    expect(cacheData).toHaveProperty('outputHash');
    expect(cacheData).toHaveProperty('collectedCSS');

    await fs.rm(cacheFilePath, { recursive: true, force: true });
  });
});
