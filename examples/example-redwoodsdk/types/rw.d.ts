/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { AppContext } from '../src/worker';

declare module 'rwsdk/worker' {
  // eslint-disable-next-line no-unused-vars
  interface DefaultAppContext extends AppContext {}
}
