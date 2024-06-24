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
import marginPadding from './stylex-margin-padding-shorthand';

const rules: {
  'valid-styles': typeof validStyles,
  'sort-keys': typeof sortKeys,
  'margin-padding': typeof marginPadding,  
} = {
  'valid-styles': validStyles,
  'sort-keys': sortKeys,
  'margin-padding': marginPadding,
};

export { rules };
