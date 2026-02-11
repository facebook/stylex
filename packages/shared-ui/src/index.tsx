/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

export function Button({
  children,
  onClick,
  xstyle,
}: {
  children: any;
  onClick?: () => void;
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <button {...stylex.props(styles.button, xstyle)} onClick={onClick}>
      {children}
    </button>
  );
}

const styles = stylex.create({
  button: {
    backgroundColor: {
      default: tokens.primaryColor,
      ':hover': tokens.secondaryColor,
    },
    color: 'white',
    padding: tokens.padding,
    borderStyle: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
  },
});
