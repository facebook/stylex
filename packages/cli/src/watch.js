/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Config } from './config';

import { compileDirectory } from './transform';

import chalk from 'chalk';
import watchman from 'fb-watchman';

type Subscription = {
  expression: Array<string | Array<string>>,
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

export default function watch(config: Config) {
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
            chalk.green(resp.relative_path),
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
  config: Config,
) {
  const subscription: Subscription = {
    expression: [
      'anyof',
      ['match', '*.js'],
      ['match', '*.ts'],
      ['match', '*.jsx'],
      ['match', '*.tsx'],
      ['match', '*.cjs'],
      ['match', '*.mjs'],
    ],
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
    compileDirectory(config);
  });
}
