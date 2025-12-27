/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';
import { vars } from '../../theming/vars.stylex';

export const buttonStyles = stylex.create({
  base: {
    // 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring'
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 8,
    fontSize: `${14 / 16}rem`,
    fontWeight: 500,
    transitionProperty: 'background-color',
    transitionDuration: '0.1s',
    transitionTimingFunction: 'ease-in-out',
    outline: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible': `0 0 0 2px ${vars['--color-fd-primary']}`,
    },
  },
});

export const buttonVariantStyles = stylex.create({
  primary: {
    backgroundColor: {
      default: vars['--color-fd-primary'],
      ':hover': `color-mix(in srgb, ${vars['--color-fd-primary']} 80%, transparent)`,
    },
    color: vars['--color-fd-primary-foreground'],
  },
  outline: {
    backgroundColor: {
      default: 'transparent',
      ':hover': `${vars['--color-fd-accent']}`,
    },
    color: {
      default: null,
      ':hover': `${vars['--color-fd-accent-foreground']}`,
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: `${vars['--color-fd-accent']}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: {
      default: vars['--color-fd-foreground'],
      ':hover': vars['--color-fd-primary'],
    },
  },
  secondary: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: `${vars['--color-fd-accent']}`,
    backgroundColor: {
      default: `${vars['--color-fd-secondary']}`,
      ':hover': `${vars['--color-fd-accent']}`,
    },
    color: {
      default: `${vars['--color-fd-secondary-foreground']}`,
      ':hover': `${vars['--color-fd-accent-foreground']}`,
    },
  },
});

export const buttonSizeVariants = stylex.create({
  sm: {
    gap: 4,
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: `${12 / 16}rem`,
    lineHeight: 1.4,
  },
  icon: {
    padding: 12,
    '--svg-size': '20px',
  },
  'icon-sm': {
    padding: 6,
    '--svg-size': '18px',
  },
  'icon-xs': {
    padding: 4,
    '--svg-size': '16px',
  },
});

export type ButtonProps = {
  color?: keyof typeof buttonVariantStyles | null | undefined;
  variant?: keyof typeof buttonVariantStyles | null | undefined;
  size?: keyof typeof buttonSizeVariants | null | undefined;
};
