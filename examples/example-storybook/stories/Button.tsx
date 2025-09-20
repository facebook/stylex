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

export const buttonStyles = stylex.create({
  base: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    borderRadius: 6,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transform: {
      default: 'translateY(0)',
      ':hover': 'translateY(-1px)',
      ':active': 'translateY(0)',
    },
    boxShadow: {
      default: 'none',
      ':hover': '0 4px 8px rgba(0, 0, 0, 0.12)',
    },
  },
  primary: {
    backgroundColor: {
      default: '#0066cc',
      ':hover': '#0052a3',
    },
    color: 'white',
  },
  secondary: {
    backgroundColor: {
      default: '#f5f5f5',
      ':hover': '#e8e8e8',
    },
    color: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ddd',
  },
  danger: {
    backgroundColor: {
      default: '#dc3545',
      ':hover': '#c82333',
    },
    color: 'white',
  },
  small: {
    fontSize: 12,
    padding: '6px 12px',
    minHeight: 28,
  },
  medium: {
    fontSize: 14,
    padding: '8px 16px',
    minHeight: 36,
  },
  large: {
    fontSize: 16,
    padding: '12px 24px',
    minHeight: 44,
  },
});

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
