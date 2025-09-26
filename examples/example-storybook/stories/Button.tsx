/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import { FC } from 'react';
import * as stylex from '@stylexjs/stylex';
import { buttonStyles } from './Button.stylex';

type ButtonProps = {
  /**
   * The size of the button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /** The variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * The label of the button
   * @example 'Click me'
   */
  label: string;
  /**
   * Function to call when the button is clicked
   */
  onClick?: () => void;
};

export const Button: FC<ButtonProps> = ({
  size = 'medium',
  variant = 'primary',
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      {...stylex.props(
        buttonStyles.base,
        buttonStyles[size],
        buttonStyles[variant],
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
