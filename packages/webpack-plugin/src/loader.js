/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const PLUGIN_NAME = 'stylex';

module.exports = function stylexLoader(inputCode) {
  const callback = this.async();
  const { stylexPlugin } = this.getOptions();
  const logger = this._compiler.getInfrastructureLogger(PLUGIN_NAME);

  stylexPlugin.transformCode(inputCode, this.resourcePath, logger).then(
    ({ code, map }) => {
      callback(null, code, map);
    },
    (error) => {
      callback(error);
    },
  );
};
