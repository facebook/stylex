/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import watchman from 'fb-watchman';
import path from 'path';

export default function watch() {
  const watchmanClient = new watchman.Client();
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

          // It is considered to be best practice to show any 'warning' or
          // 'error' information to the user, as it may suggest steps
          // for remediation
          if ('warning' in resp) {
            console.log('warning: ', resp.warning);
          }

          // `watch-project` can consolidate the watch for your
          // dir_of_interest with another watch at a higher level in the
          // tree, so it is very important to record the `relative_path`
          // returned in resp
          console.log(
            'watch established on ',
            resp.watch,
            ' relative_path',
            resp.relative_path,
          );
        },
      );
    },
  );
}
