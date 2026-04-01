/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Demonstrates cross-file nested token consumption.
 * Tokens are defined in NestedTokensDemo.stylex.ts via defineVarsNested
 * and consumed here in a separate stylex.create call.
 */

// @ts-nocheck — nested APIs are experimental and lack TS type definitions.

import * as stylex from '@stylexjs/stylex';
import { nestedTokens, nestedConsts } from './NestedTokensDemo.stylex';

const DARK_MODE = '@media (prefers-color-scheme: dark)';

const crossStyles = stylex.create({
  card: {
    width: '100%',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: nestedTokens.surface.hover,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'center',
  },
  label: {
    margin: 0,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    opacity: 0.5,
  },
  swatch: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  swatchItem: {
    width: 40,
    height: 40,
    borderRadius: nestedConsts.badge.borderRadius,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  infoSwatch: {
    backgroundColor: nestedTokens.badge.info.bg,
    borderColor: nestedTokens.badge.info.border,
  },
  successSwatch: {
    backgroundColor: nestedTokens.badge.success.bg,
    borderColor: nestedTokens.badge.success.border,
  },
  warningSwatch: {
    backgroundColor: nestedTokens.badge.warning.bg,
    borderColor: nestedTokens.badge.warning.border,
  },
  text: {
    margin: 0,
    fontSize: '0.8rem',
    lineHeight: 1.5,
    textAlign: 'center',
    opacity: 0.6,
  },
  code: {
    fontFamily: 'ui-monospace, Menlo, Monaco, monospace',
    fontSize: '0.85em',
    backgroundColor: {
      default: 'rgba(0,0,0,0.05)',
      [DARK_MODE]: 'rgba(255,255,255,0.08)',
    },
    paddingInline: '0.3em',
    paddingBlock: '0.1em',
    borderRadius: '4px',
  },
});

export default function CrossFileNestedDemo() {
  return (
    <div {...stylex.props(crossStyles.card)}>
      <p {...stylex.props(crossStyles.label)}>Cross-file import</p>
      <div {...stylex.props(crossStyles.swatch)}>
        <div
          {...stylex.props(crossStyles.swatchItem, crossStyles.infoSwatch)}
        />
        <div
          {...stylex.props(crossStyles.swatchItem, crossStyles.successSwatch)}
        />
        <div
          {...stylex.props(crossStyles.swatchItem, crossStyles.warningSwatch)}
        />
      </div>
      <p {...stylex.props(crossStyles.text)}>
        These swatches import{' '}
        <code {...stylex.props(crossStyles.code)}>nestedTokens</code> from a
        separate file and use them in their own{' '}
        <code {...stylex.props(crossStyles.code)}>stylex.create</code>.
      </p>
      <p {...stylex.props(crossStyles.text)}>
        Source:{' '}
        <code {...stylex.props(crossStyles.code)}>
          components/CrossFileNestedDemo.tsx
        </code>
      </p>
    </div>
  );
}
