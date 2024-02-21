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

const fadeAnimation = "xgnty7z-B";
const styles = {
  foo: {
    animationName: "xeuoslp",
    display: "x78zum5",
    marginInlineStart: "x1hm9lzh",
    marginLeft: null,
    marginRight: null,
    marginTop: "xlrshdv",
    height: "x1egiwwb",
    ":hover_background": "x1oz5o6v",
    ":hover_backgroundAttachment": null,
    ":hover_backgroundClip": null,
    ":hover_backgroundColor": null,
    ":hover_backgroundImage": null,
    ":hover_backgroundOrigin": null,
    ":hover_backgroundPosition": null,
    ":hover_backgroundPositionX": null,
    ":hover_backgroundPositionY": null,
    ":hover_backgroundRepeat": null,
    ":hover_backgroundSize": null,
    $$css: true
  }
};
function Home() {
  return stylex.props(_otherStyles.default.bar, styles.foo, _npmStyles.default.baz).className;
}