/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

/* eslint-disable no-unused-vars */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import type { StaticStyles } from '@stylexjs/stylex';

type Props = {
  xstyle?: StaticStyles;
};

function Component({ xstyle }: Props) {
  return <div {...stylex.props(xstyle)} />;
}

const styles = stylex.create({
  base: {
    color: 'red',
  },
});

function OtherComponent() {
  return <Component xstyle={styles.base} />;
}

function OtherComponent2() {
  return <Component xstyle={[styles.base, undefined]} />;
}
