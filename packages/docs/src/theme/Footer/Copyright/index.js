/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  copyright: {
    textAlign: 'center',
  },
});

export default function FooterCopyright({ copyright, xstyle }) {
  return (
    <div
      {...stylex.props(styles.copyright, xstyle)}
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: copyright }}
    />
  );
}
