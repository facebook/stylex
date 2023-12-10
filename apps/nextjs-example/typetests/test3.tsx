/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

/* eslint-disable no-unused-vars */

import stylex from '@stylexjs/stylex';
import type { StaticStyles, StyleXStyles } from '@stylexjs/stylex';

type Props = {
  xstyle?: StyleXStyles;
  staticXstyle?: StaticStyles;
};

function Component({ xstyle, staticXstyle }: Props): null {
  // @ts-expect-error - `stylex` can only accept StaticStyles. Not StyleXStyles.
  <div className={stylex(xstyle)} />;

  <div className={stylex(staticXstyle)} />;

  <div {...stylex.props(xstyle)} />;

  <div {...stylex.props([staticXstyle])} />;

  return null;
}

const styles = stylex.create({
  base: {
    color: 'red',
  },
});

function OtherComponent() {
  <Component xstyle={styles.base} />;
}
