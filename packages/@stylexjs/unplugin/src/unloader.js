/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createUnloaderPlugin } from 'unplugin';

import { unpluginFactory } from './core';

export default createUnloaderPlugin(unpluginFactory);
