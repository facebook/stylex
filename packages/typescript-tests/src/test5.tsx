/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

/* eslint-disable no-unused-vars */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  base: {
    color: {
      // Flow doesn't allow using a "string" type after a string literal type
      // So if we manually give it a less specific type, things work as expected.
      default: 'red',
      [stylex.when.ancestor(':hover')]: 'blue',
      [stylex.when.ancestor(':active')]: 'green',
    },
  },
});

styles.base satisfies stylex.StyleXStyles<{ color: 'red' | 'blue' | 'green' }>;
