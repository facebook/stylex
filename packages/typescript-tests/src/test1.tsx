/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

/* eslint-disable no-unused-vars, react/no-unknown-property */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import type { StaticStyles, StyleXSxProp } from '@stylexjs/stylex';

type Props = {
  xstyle?: StaticStyles;
};

function Component({ xstyle }: Props) {
  return <div {...stylex.props(xstyle)} />;
}

function PlainComponent() {
  return null;
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

function SxComponent() {
  return <div sx={styles.base} />;
}

function SxComponentMultiStyle() {
  return <div sx={[styles.base, undefined]} />;
}

function InvalidSxValue() {
  // @ts-expect-error - `sx` only accepts StyleX styles.
  return <div sx="not-stylex" />;
}

function CustomComponentSx() {
  // @ts-expect-error - `sx` is only transformed on lowercase JSX host elements.
  return <PlainComponent sx={styles.base} />;
}
