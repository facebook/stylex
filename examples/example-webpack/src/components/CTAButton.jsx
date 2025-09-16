/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens.stylex';

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
    backgroundColor: colors.fg1,
    borderRadius: 8,
    boxShadow: {
      default: '0 0 2px rgba(0,0,0,0.35)',
      ':hover': '0 0 10px rgba(0,0,0,0.75)',
    },
    color: {
      default: colors.bg1,
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
    backgroundColor: `hsl(${colors.pinkH}, ${colors.pinkS}, ${colors.pinkL})`,
    boxShadow: {
      default:
        `0 0 2px hsla(${colors.pinkH}, ${colors.pinkS}, ${colors.pinkL}, 0.35)`,
      ':hover':
        `0 0 10px hsla(${colors.pinkH}, ${colors.pinkS}, ${colors.pinkL}, 0.75)`,
    },
    color: {
      default: colors.white,
    },
  },
  blue: {
    backgroundColor: `hsl(${colors.cyanH}, ${colors.cyanS}, ${colors.cyanL})`,
    boxShadow: {
      default:
        `0 0 2px hsla(${colors.cyanH}, ${colors.cyanS}, ${colors.cyanL}, 0.35)`,
      ':hover':
        `0 0 10px hsla(${colors.cyanH}, ${colors.cyanS}, ${colors.cyanL}, 0.75)`,
    },
    color: {
      default: colors.white,
    },
  },
});
