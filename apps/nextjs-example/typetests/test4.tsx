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
import type { StaticStyles } from '@stylexjs/stylex';

type Props = {
  xstyle?: StaticStyles<{
    backgroundColor?: string;
  }>;
};

function Component({ xstyle }: Props) {
  return <div className={stylex(xstyle)} />; // Error at function call
}

const styles = stylex.create({
  valid: {
    backgroundColor: 'red',
  },
  invalid: {
    color: 'red',
  },
});

function OtherComponent() {
  <Component xstyle={styles.valid} />;

  // @ts-expect-error - `styles.invalid` contains `color` which is not allowed by Component's `xstyle` prop.
  <Component xstyle={styles.invalid} />;
}
