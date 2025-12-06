/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Link } from 'waku';
import { legacyColors } from '../theming/vars.stylex';

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
    fontWeight: 'bold',
    color: {
      default: legacyColors['--bg1'],
      ':hover': legacyColors['--bg1'],
    },
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    whiteSpace: 'nowrap',
    backgroundColor: legacyColors['--fg1'],
    paddingBlock: '0.75rem',
    paddingInline: '2rem',
    boxShadow: {
      default: '0 0 2px rgba(0,0,0,0.35)',
      ':hover': '0 0 10px rgba(0,0,0,0.75)',
    },
    scale: {
      default: '1',
      ':hover': '1.02',
      ':active': '0.98',
    },
    transitionProperty: 'scale, boxShadow',
    transitionDuration: {
      default: '0.2s',
      ':active': '0.1s',
    },
  },
  pink: {
    color: {
      default: 'white',
      ':hover': 'white',
    },
    backgroundColor: `hsl(${legacyColors['--pink-h']}, ${legacyColors['--pink-s']}, ${legacyColors['--pink-l']})`,
    boxShadow: {
      default: `0 0 2px hsla(${legacyColors['--pink-h']}, ${legacyColors['--pink-s']}, ${legacyColors['--pink-l']}, 0.35)`,
      ':hover': `0 0 10px hsla(${legacyColors['--pink-h']}, ${legacyColors['--pink-s']}, ${legacyColors['--pink-l']}, 0.75)`,
    },
  },
  blue: {
    color: {
      default: 'white',
      ':hover': 'white',
    },
    backgroundColor: `hsl(${legacyColors['--cyan-h']}, ${legacyColors['--cyan-s']}, ${legacyColors['--cyan-l']})`,
    boxShadow: {
      default: `0 0 2px hsla(${legacyColors['--cyan-h']}, ${legacyColors['--cyan-s']}, ${legacyColors['--cyan-l']}, 0.35)`,
      ':hover': `0 0 10px hsla(${legacyColors['--cyan-h']}, ${legacyColors['--cyan-s']}, ${legacyColors['--cyan-l']}, 0.75)`,
    },
  },
});
