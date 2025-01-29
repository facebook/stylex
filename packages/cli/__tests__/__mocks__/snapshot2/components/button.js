/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import * as stylex from '@stylexjs/stylex';
import otherStyles from './otherStyles';
import npmStyles from './npmStyles';
import "../../src/stylex_bundle.css";
const fadeAnimation = "xgnty7z-B";
const styles = {
  foo: {
    zba70f: "xeuoslp",
    "1p303ag": "x78zum5",
    "1jcfj6v": "x1hm9lzh",
    cbn5dw: null,
    br2gl8: null,
    p4ik3q: "xlrshdv",
    "1i36v6j": "x1egiwwb",
    "1d41aeb": "x1oz5o6v",
    "1nqjm4h": null,
    bygufj: null,
    ygddfn: null,
    "2scyum": null,
    jr2mr9: null,
    edxvk7: null,
    "1eeay1m": null,
    "1yc9v4u": null,
    "4ksdn9": null,
    "2g5vb7": null,
    $$css: true
  }
};
export default function Button() {
  return stylex.props(otherStyles.bar, styles.foo, npmStyles.baz).className;
}
