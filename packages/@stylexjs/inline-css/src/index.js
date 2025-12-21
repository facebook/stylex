/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const valueProxy = (propName) =>
  new Proxy(
    {},
    {
      get() {
        throw new Error(
          `@stylexjs/inline-css is a compile-time helper. Attempted to read the value '${propName}', but the StyleX compiler did not run.`,
        );
      },
    },
  );

const inlineCSS = new Proxy(
  {},
  {
    get(_target, prop) {
      if (typeof prop === 'string') {
        return valueProxy(prop);
      }
      return undefined;
    },
  },
);

module.exports = inlineCSS;
module.exports.default = inlineCSS;
