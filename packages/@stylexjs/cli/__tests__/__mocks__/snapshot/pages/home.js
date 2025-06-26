/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import * as stylex from '@stylexjs/stylex';
import otherStyles from './otherStyles';
import npmStyles from './npmStyles';
import "../stylex_bundle.css";
const fadeAnimation = "xgnty7z-B";
const styles = {
  foo: {
    kKVMdj: "xeuoslp",
    kWkggS: "x1gykpug",
    k1xSpc: "x78zum5",
    kZKoxP: "x1egiwwb",
    keoZOQ: "xlrshdv",
    keTefX: "x1hm9lzh",
    $$css: true
  }
};
export default function Home() {
  return stylex.props(otherStyles.bar, styles.foo, npmStyles.baz).className;
}
