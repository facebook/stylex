/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Link } from 'waku';
import { vars } from '../theming/vars.stylex';

export default function CtaButton({
  children,
  color,
  to,
}: {
  children: React.ReactNode;
  color: 'pink' | 'blue';
  to: string;
}) {
  return (
    <Link
      {...stylex.props(
        styles.base,
        color === 'pink' && styles.pink,
        color === 'blue' && styles.blue,
      )}
      to={to}
    >
      {children}
    </Link>
  );
}
const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontWeight: 400,
    // color: vars['--color-fd-background'],
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    paddingBlock: '0.75rem',
    paddingInline: '2rem',
    scale: {
      default: '1',
      ':hover': '1.02',
      ':active': '0.98',
    },
    transitionProperty: 'scale, color, background-color',
    transitionDuration: {
      default: '0.2s',
      ':active': '0.05s',
    },
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'currentColor',
  },
  pink: {
    backgroundColor: {
      default: `color-mix(in srgb, ${vars['--color-fd-primary']} 10%, transparent)`,
      ':hover': vars['--color-fd-primary'],
      ':focus-visible': vars['--color-fd-primary'],
    },
    borderColor: vars['--color-fd-primary'],
    color: {
      default: vars['--color-fd-primary'],
      ':hover': vars['--color-fd-background'],
      ':focus-visible': vars['--color-fd-background'],
    },
  },
  blue: {
    backgroundColor: {
      default: `color-mix(in srgb, ${vars['--color-fd-accent-foreground']} 10%, transparent)`,
      ':hover': vars['--color-fd-accent-foreground'],
      ':focus-visible': vars['--color-fd-accent-foreground'],
    },
    borderColor: vars['--color-fd-accent-foreground'],
    color: {
      default: vars['--color-fd-accent-foreground'],
      ':hover': vars['--color-fd-background'],
      ':focus-visible': vars['--color-fd-background'],
    },
  },
});
