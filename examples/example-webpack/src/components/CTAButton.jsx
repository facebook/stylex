/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

export default function CtaButton({ children, color, to }) {
  return (
    <a
      {...stylex.props(
        styles.base,
        color === 'pink' && styles.pink,
        color === 'blue' && styles.blue,
      )}
      href={to}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
const styles = stylex.create({
  base: {
    alignItems: 'center',
    backgroundColor: 'var(--fg1)',
    borderRadius: 8,
    boxShadow: {
      default: '0 0 2px rgba(0,0,0,0.35)',
      ':hover': '0 0 10px rgba(0,0,0,0.75)',
    },
    color: {
      default: 'var(--bg1)',
      ':hover': 'var(--bg1)',
    },
    display: 'flex',
    fontWeight: 'bold',
    justifyContent: 'center',
    paddingBlock: '0.75rem',
    paddingInline: '2rem',
    scale: {
      default: '1',
      ':hover': '1.02',
      ':active': '0.98',
    },
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    transitionDuration: {
      default: '0.2s',
      ':active': '0.1s',
    },
    transitionProperty: 'scale, boxShadow',
    whiteSpace: 'nowrap',
  },
  pink: {
    backgroundColor: 'hsl(var(--pink-h), var(--pink-s), var(--pink-l))',
    boxShadow: {
      default:
        '0 0 2px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.35)',
      ':hover':
        '0 0 10px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.75)',
    },
    color: {
      default: 'white',
      ':hover': 'white',
    },
  },
  blue: {
    backgroundColor: 'hsl(var(--cyan-h), var(--cyan-s), var(--cyan-l))',
    boxShadow: {
      default:
        '0 0 2px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.35)',
      ':hover':
        '0 0 10px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.75)',
    },
    color: {
      default: 'white',
      ':hover': 'white',
    },
  },
});
