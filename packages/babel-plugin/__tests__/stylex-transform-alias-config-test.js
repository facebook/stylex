/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */


'use strict';

import path from 'path';
import fs from 'fs';
import os from 'os';
import StateManager from '../src/utils/state-manager';

describe('StyleX Alias Configuration', () => {
  let tmpDir;
  let state;

  beforeEach(() => {
    // Create a temporary directory for our test files
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-test-'));

    // Create a mock babel state
    state = {
      file: {
        metadata: {},
      },
      filename: path.join(tmpDir, 'src/components/Button.js'),
    };
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const setupFiles = (files) => {
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(tmpDir, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
    }
  };

  test('discovers aliases from package.json', () => {
    setupFiles({
      'package.json': {
        name: 'test-package',
        stylex: {
          aliases: {
            '@components': './src/components',
            '@utils/*': ['./src/utils/*'],
          },
        },
      },
    });

    const manager = new StateManager(state);

    expect(manager.options.aliases).toEqual({
      '@components': ['./src/components'],
      '@utils/*': ['./src/utils/*'],
    });
  });

  test('discovers aliases from tsconfig.json', () => {
    setupFiles({
      'package.json': { name: 'test-package' },
      'tsconfig.json': {
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@components/*': ['src/components/*'],
            '@utils/*': ['src/utils/*'],
          },
        },
      },
    });

    const manager = new StateManager(state);

    expect(manager.options.aliases).toEqual({
      '@components': ['src/components'],
      '@utils': ['src/utils'],
    });
  });

  test('merges aliases from both package.json and tsconfig.json', () => {
    setupFiles({
      'package.json': {
        name: 'test-package',
        stylex: {
          aliases: {
            '@components': './src/components',
          },
        },
      },
      'tsconfig.json': {
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@utils/*': ['src/utils/*'],
          },
        },
      },
    });

    const manager = new StateManager(state);

    expect(manager.options.aliases).toEqual({
      '@components': ['./src/components'],
      '@utils': ['src/utils'],
    });
  });

  test('manual configuration overrides discovered aliases', () => {
    setupFiles({
      'package.json': {
        name: 'test-package',
        stylex: {
          aliases: {
            '@components': './src/components',
          },
        },
      },
    });

    state.opts = {
      aliases: {
        '@components': './custom/path',
      },
    };

    const manager = new StateManager(state);

    expect(manager.options.aliases).toEqual({
      '@components': ['./custom/path'],
    });
  });

  test('handles missing configuration files gracefully', () => {
    const manager = new StateManager(state);
    expect(manager.options.aliases).toBeNull();
  });

  test('handles invalid JSON files gracefully', () => {
    setupFiles({
      'package.json': '{invalid json',
      'tsconfig.json': '{also invalid',
    });

    const manager = new StateManager(state);
    expect(manager.options.aliases).toBeNull();
  });
});
