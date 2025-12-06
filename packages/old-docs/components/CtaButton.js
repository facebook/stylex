/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import Link from '@docusaurus/Link';

export default function CtaButton({ children, color, to }) {
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
      default: 'var(--bg1)',
      ':hover': 'var(--bg1)',
    },
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    whiteSpace: 'nowrap',
    backgroundColor: 'var(--fg1)',
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
    backgroundColor: 'hsl(var(--pink-h), var(--pink-s), var(--pink-l))',
    boxShadow: {
      default:
        '0 0 2px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.35)',
      ':hover':
        '0 0 10px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.75)',
    },
  },
  blue: {
    color: {
      default: 'white',
      ':hover': 'white',
    },
    backgroundColor: 'hsl(var(--cyan-h), var(--cyan-s), var(--cyan-l))',
    boxShadow: {
      default:
        '0 0 2px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.35)',
      ':hover':
        '0 0 10px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.75)',
    },
  },
});
