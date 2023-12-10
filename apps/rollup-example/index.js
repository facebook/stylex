/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import stylex from '@stylexjs/stylex';
import { lotsOfStyles } from './lotsOfStyles';

const styles = lotsOfStyles.map((defs) => Object.values(defs));

export default function App() {
  return stylex.props(styles);
}
