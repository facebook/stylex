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
import watchman from 'fb-watchman';

type Subscription = {
  fields: Array<string>,
  relative_root?: string,
};
type Watcher = {};

type Response = {
  watch: Watcher,
  relative_path: string,
  warning: string,
  subscribe: string,
};

type OnEvent = {
  subscription: string,
  files: Array<$ReadOnly<Object>>,
};

declare class WatchmanClient {
  capabilityCheck(config: Object, callback: (error: any) => void): void;
  command(
    config:
      | ['watch-project', string]
      | ['subscribe', Watcher, 'jsFileChanged', Subscription],
    callback: (error: any, response: Response) => void,
  ): void;

  on(eventName: string, callback: (event: OnEvent) => void): void;
  end(): void;
}

export function startWatcher(config: TransformConfig) {
  const watchmanClient: WatchmanClient = new watchman.Client();

  watchmanClient.capabilityCheck(
    { optional: [], required: ['relative_root'] },
    function (error, _resp) {
      if (error) {
        console.log(error);
        watchmanClient.end();
        return;
      }

      // Initiate the watch
      watchmanClient.command(
        ['watch-project', config.input],
        function (error, resp) {
          if (error) {
            console.error('Error initiating watch:', error);
            return;
          }
          if ('warning' in resp) {
            console.log('warning: ', resp.warning);
          }
          subscribe(watchmanClient, resp.watch, resp.relative_path, config);
          console.log(
            'Watching for style changes in',
            ansis.green(resp.relative_path),
          );
        },
      );
    },
  );
}

function subscribe(
  client: WatchmanClient,
  watcher: Watcher,
  relative_path: string,
  config: TransformConfig,
) {
  const subscription: Subscription = {
    fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
  };
  if (relative_path) {
    subscription.relative_root = relative_path;
  }

  client.command(
    ['subscribe', watcher, 'jsFileChanged', subscription],
    function (error: string, _resp: Response) {
      if (error) {
        console.error('failed to subscribe: ', error);
        return;
      }
    },
  );

  client.on('subscription', function (resp: OnEvent) {
    if (resp.subscription !== 'jsFileChanged') return;
    // on file change, recompile the whole directory for now
    compileDirectory(
      config,
      resp.files.filter((file) => file.exists).map((file) => file.name),
      resp.files
        .filter(
          (file) =>
            // don't trigger recompile when the cli deletes the compiled modules folder
            !file.exists && !file.name.startsWith('stylex_compiled_modules'),
        )
        .map((file) => file.name),
    )
      .then(() => {
        clearInputModuleDir(config);
      })
      .catch((transformError) => {
        clearInputModuleDir(config);
        console.error(transformError);
      });
  });
}
