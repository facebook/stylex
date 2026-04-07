/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Demo of the three nested experimental APIs.
 * Tokens and same-file styles live here; CrossFileNestedDemo.tsx
 * demonstrates cross-file consumption of these same tokens.
 */

// @ts-nocheck — nested APIs are experimental and lack TS type definitions.
// The babel plugin compiles all calls away before runtime.

import * as stylex from '@stylexjs/stylex';

const DARK_MODE = '@media (prefers-color-scheme: dark)';

// ─── 1. unstable_defineVarsNested (CSS custom properties) ─────
export const nestedTokens = stylex.unstable_defineVarsNested({
  surface: {
    bg: { default: '#fafafa', [DARK_MODE]: '#0f1117' },
    card: { default: 'white', [DARK_MODE]: '#1a1b26' },
    cardShadow: {
      default: '0 4px 24px rgba(0,0,0,0.06)',
      [DARK_MODE]: '0 4px 24px rgba(0,0,0,0.3)',
    },
    hover: {
      default: 'rgba(0,0,0,0.02)',
      [DARK_MODE]: 'rgba(255,255,255,0.04)',
    },
  },
  badge: {
    info: {
      bg: {
        default: 'rgba(28, 126, 214, 0.08)',
        [DARK_MODE]: 'rgba(28, 126, 214, 0.15)',
      },
      text: { default: '#1c7ed6', [DARK_MODE]: '#74c0fc' },
      border: {
        default: 'rgba(28, 126, 214, 0.25)',
        [DARK_MODE]: 'rgba(116, 192, 252, 0.25)',
      },
    },
    success: {
      bg: {
        default: 'rgba(12, 166, 120, 0.08)',
        [DARK_MODE]: 'rgba(12, 166, 120, 0.15)',
      },
      text: { default: '#0ca678', [DARK_MODE]: '#63e6be' },
      border: {
        default: 'rgba(12, 166, 120, 0.25)',
        [DARK_MODE]: 'rgba(99, 230, 190, 0.25)',
      },
    },
    warning: {
      bg: {
        default: 'rgba(116, 184, 22, 0.08)',
        [DARK_MODE]: 'rgba(116, 184, 22, 0.15)',
      },
      text: { default: '#74b816', [DARK_MODE]: '#a9e34b' },
      border: {
        default: 'rgba(116, 184, 22, 0.25)',
        [DARK_MODE]: 'rgba(169, 227, 75, 0.25)',
      },
    },
  },
});

// ─── 2. unstable_defineConstsNested (compile-time constants) ──
export const nestedConsts = stylex.unstable_defineConstsNested({
  badge: {
    borderRadius: '999px',
    paddingInline: '0.625rem',
    paddingBlock: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.025em',
  },
});

// ─── 3. unstable_createThemeNested (theme override) ───────────
export const warmTheme = stylex.unstable_createThemeNested(nestedTokens, {
  surface: {
    card: '#fff0e0',
    cardShadow: '0 4px 24px rgba(180, 100, 0, 0.25)',
    hover: 'rgba(180, 100, 0, 0.1)',
  },
  badge: {
    info: {
      bg: 'rgba(91, 69, 222, 0.08)',
      text: '#5B45DE',
      border: 'rgba(91, 69, 222, 0.25)',
    },
    success: {
      bg: 'rgba(224, 49, 49, 0.08)',
      text: '#e03131',
      border: 'rgba(224, 49, 49, 0.25)',
    },
    warning: {
      bg: 'rgba(247, 103, 7, 0.08)',
      text: '#f76707',
      border: 'rgba(247, 103, 7, 0.25)',
    },
  },
});

// ─── 4. stylex.create consuming nested tokens ────────────────
// These styles can also be consumed cross-file — see CrossFileNestedDemo.tsx.
export const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    maxWidth: 600,
    padding: '1.5rem',
    borderRadius: '0.75rem',
    backgroundColor: nestedTokens.surface.card,
    boxShadow: nestedTokens.surface.cardShadow,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  heading: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
  },
  description: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: 0,
    opacity: 0.7,
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
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badgeBase: {
    borderRadius: nestedConsts.badge.borderRadius,
    paddingInline: nestedConsts.badge.paddingInline,
    paddingBlock: nestedConsts.badge.paddingBlock,
    fontSize: nestedConsts.badge.fontSize,
    fontWeight: nestedConsts.badge.fontWeight,
    letterSpacing: nestedConsts.badge.letterSpacing,
    borderWidth: 1,
    borderStyle: 'solid',
    textTransform: 'uppercase',
  },
  badgeInfo: {
    backgroundColor: nestedTokens.badge.info.bg,
    color: nestedTokens.badge.info.text,
    borderColor: nestedTokens.badge.info.border,
  },
  badgeSuccess: {
    backgroundColor: nestedTokens.badge.success.bg,
    color: nestedTokens.badge.success.text,
    borderColor: nestedTokens.badge.success.border,
  },
  badgeWarning: {
    backgroundColor: nestedTokens.badge.warning.bg,
    color: nestedTokens.badge.warning.text,
    borderColor: nestedTokens.badge.warning.border,
  },
  card: {
    width: '100%',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: nestedTokens.surface.hover,
  },
  cardText: {
    margin: 0,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    textAlign: 'center',
  },
  sourceHint: {
    marginTop: '0.5rem',
    opacity: 0.5,
    fontSize: '0.75rem',
  },
});
