/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { compileDirectory } from './transform';

import watchman from 'fb-watchman';
import path from 'path';

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

export default function watch() {
  const watchmanClient: WatchmanClient = new watchman.Client();
  const watchDir = path.resolve(global.INPUT_DIR);

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
        ['watch-project', watchDir],
        function (error, resp) {
          if (error) {
            console.error('Error initiating watch:', error);
            return;
          }
          if ('warning' in resp) {
            console.log('warning: ', resp.warning);
          }
          subscribe(watchmanClient, resp.watch, resp.relative_path);
          console.log('watching for style changes in', watchDir);
        },
      );
    },
  );
}

function subscribe(
  client: WatchmanClient,
  watcher: Watcher,
  relative_path: string,
) {
  const subscription: Subscription = {
    expression: ['allof', ['match', '*.js']],
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
    compileDirectory(global.INPUT_DIR);
  });
}
