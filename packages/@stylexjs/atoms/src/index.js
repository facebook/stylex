/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const valueProxy = (_propName) =>
  new Proxy(function () {}, {
    get() {
      return valueProxy('');
    },
    apply() {
      return undefined;
    },
  });

const utilityStyles = new Proxy(function () {}, {
  get(_target, prop) {
    if (typeof prop === 'string') {
      return valueProxy(prop);
    }
    return undefined;
  },
  apply() {
    throw new Error(
      '@stylexjs/atoms is a compile-time helper. Attempted to call it as a function, but the StyleX compiler did not run.',
    );
  },
});

module.exports = utilityStyles;
module.exports.default = utilityStyles;
