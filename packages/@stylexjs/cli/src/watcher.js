/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TransformConfig } from './config';

import { clearInputModuleDir } from './modules';
import { compileDirectory } from './transform';

import ansis from 'ansis';
import chokidar from 'chokidar';

export function startWatcher(config: TransformConfig) {
  const watchPath = config.input;
  const watcher = chokidar.watch(watchPath, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  console.log('Watching for style changes in', ansis.green(watchPath));

  subscribeChokidar(watcher, config);
}

function subscribeChokidar(watcher: any, config: TransformConfig) {
  let changed: Array<string> = [];
  let removed: Array<string> = [];
  let timer: null | TimeoutID = null;

  const scheduleCompile = () => {
    if (timer != null) return;
    timer = setTimeout(() => {
      const toAdd = changed;
      const toRemove = removed.filter(
        (name) => !name.startsWith('stylex_compiled_modules'),
      );
      changed = [];
      removed = [];
      timer = null;
      compileDirectory(config, toAdd, toRemove)
        .then(() => {
          clearInputModuleDir(config);
        })
        .catch((transformError) => {
          clearInputModuleDir(config);
          console.error(transformError);
        });
    }, 100);
  };

  watcher
    .on('add', (filePath: string) => {
      changed.push(filePath);
      scheduleCompile();
    })
    .on('change', (filePath: string) => {
      changed.push(filePath);
      scheduleCompile();
    })
    .on('unlink', (filePath: string) => {
      removed.push(filePath);
      scheduleCompile();
    })
    .on('error', (error: any) => {
      console.error('[stylex] watcher error:', error);
    });
}
