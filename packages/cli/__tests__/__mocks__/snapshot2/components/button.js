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
import "../../src/stylex_bundle.css";
const fadeAnimation = "xgnty7z-B";
const styles = {
  foo: {
    kKVMdj: "xeuoslp",
    k1xSpc: "x78zum5",
    keTefX: "x1hm9lzh",
    koQZXg: null,
    km5ZXQ: null,
    keoZOQ: "xlrshdv",
    kZKoxP: "x1egiwwb",
    kEyE8R: "x1oz5o6v",
    kwRxUf: null,
    kmvik3: null,
    kGzVvX: null,
    kBPHsk: null,
    kIpHjZ: null,
    kwsBex: null,
    kKEIo6: null,
    kdqC5e: null,
    kIjLOv: null,
    kA1KOB: null,
    $$css: true
  }
};
export default function Button() {
  return stylex.props(otherStyles.bar, styles.foo, npmStyles.baz).className;
}
