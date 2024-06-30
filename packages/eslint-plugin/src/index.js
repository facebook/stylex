/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import validStyles from './stylex-valid-styles';
import sortKeys from './stylex-sort-keys';
import validShorthands from './stylex-valid-shorthands';

const rules: {
  'valid-styles': typeof validStyles,
  'sort-keys': typeof sortKeys,
  'valid-shorthands': typeof validShorthands,
} = {
  'valid-styles': validStyles,
  'sort-keys': sortKeys,
  'valid-shorthands': validShorthands,
};

export { rules };
