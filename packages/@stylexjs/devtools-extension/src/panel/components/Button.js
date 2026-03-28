/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */
'use strict';

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme.stylex';

export function Button({
  onClick,
  children,
  title,
  xstyle,
}: {
  onClick: (e: MouseEvent) => mixed,
  children: React.Node,
  title?: string,
  xstyle?: stylex.StyleXStyles<>,
}): React.Node {
  return (
    <button
      type="button"
      {...stylex.props(styles.button, xstyle)}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

const styles = stylex.create({
  button: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: {
      default: colors.bgRaised,
      ':hover': colors.bg,
      ':active': colors.bg,
    },
    transform: { default: null, ':active': 'scale(0.95)' },
    paddingBlock: 4,
    paddingInline: 8,
    borderRadius: 8,
  },
});
