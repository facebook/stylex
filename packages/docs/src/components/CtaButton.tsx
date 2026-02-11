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
    paddingBlock: '1rem',
    paddingInline: '2rem',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    // color: vars['--color-fd-background'],
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    backgroundColor: 'transparent',
    borderColor: 'currentColor',
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 10,
    scale: {
      default: '1',
      ':hover': '1.02',
      ':active': '0.98',
    },
    transitionDuration: {
      default: '0.2s',
      ':active': '0.05s',
    },
    transitionProperty: 'scale, color, background-color',
  },
  pink: {
    color: {
      default: vars['--color-fd-background'],
      ':focus-visible': vars['--color-fd-primary'],
      ':hover': vars['--color-fd-primary'],
    },
    backgroundColor: {
      default: vars['--color-fd-primary'],
      ':focus-visible': `color-mix(in srgb, ${vars['--color-fd-primary']} 10%, transparent)`,
      ':hover': `color-mix(in srgb, ${vars['--color-fd-primary']} 10%, transparent)`,
    },
    borderColor: vars['--color-fd-primary'],
  },
  blue: {
    color: {
      default: vars['--color-fd-background'],
      ':focus-visible': vars['--color-fd-accent-foreground'],
      ':hover': vars['--color-fd-accent-foreground'],
    },
    backgroundColor: {
      default: vars['--color-fd-accent-foreground'],
      ':focus-visible': `color-mix(in srgb, ${vars['--color-fd-accent-foreground']} 10%, transparent)`,
      ':hover': `color-mix(in srgb, ${vars['--color-fd-accent-foreground']} 10%, transparent)`,
    },
    borderColor: vars['--color-fd-accent-foreground'],
  },
});
