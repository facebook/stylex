/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Design tokens for the nested API demo, defined entirely with
 * unstable_defineVarsNested and unstable_defineConstsNested.
 */

// @ts-nocheck — nested APIs are experimental and lack TS type definitions.

import * as stylex from '@stylexjs/stylex';
import { unstable_conditional as cond } from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

// ─── Dynamic tokens (CSS custom properties) ──────────────────
export const tokens = stylex.unstable_defineVarsNested({
  surface: {
    bg: cond({ default: '#fafafa', [DARK]: '#0f1117' }),
    card: cond({ default: 'white', [DARK]: '#1a1b26' }),
    cardShadow: cond({
      default: '0 4px 24px rgba(0,0,0,0.06)',
      [DARK]: '0 4px 24px rgba(0,0,0,0.3)',
    }),
    hover: cond({
      default: 'rgba(0,0,0,0.02)',
      [DARK]: 'rgba(255,255,255,0.04)',
    }),
    divider: cond({
      default: 'rgba(0,0,0,0.06)',
      [DARK]: 'rgba(255,255,255,0.08)',
    }),
  },
  text: {
    primary: cond({ default: '#111', [DARK]: '#e1e1e1' }),
    secondary: cond({ default: '#555', [DARK]: '#999' }),
    muted: cond({ default: '#888', [DARK]: '#666' }),
  },
  accent: {
    base: cond({ default: '#1c7ed6', [DARK]: '#74c0fc' }),
    light: cond({
      default: 'rgba(28, 126, 214, 0.08)',
      [DARK]: 'rgba(116, 192, 252, 0.12)',
    }),
    faded: cond({
      default: 'rgba(28, 126, 214, 0.19)',
      [DARK]: 'rgba(116, 192, 252, 0.19)',
    }),
    border: cond({
      default: 'rgba(28, 126, 214, 0.25)',
      [DARK]: 'rgba(116, 192, 252, 0.25)',
    }),
  },
  badge: {
    info: {
      bg: cond({
        default: 'rgba(28, 126, 214, 0.08)',
        [DARK]: 'rgba(28, 126, 214, 0.15)',
      }),
      text: cond({ default: '#1c7ed6', [DARK]: '#74c0fc' }),
      border: cond({
        default: 'rgba(28, 126, 214, 0.25)',
        [DARK]: 'rgba(116, 192, 252, 0.25)',
      }),
    },
    success: {
      bg: cond({
        default: 'rgba(12, 166, 120, 0.08)',
        [DARK]: 'rgba(12, 166, 120, 0.15)',
      }),
      text: cond({ default: '#0ca678', [DARK]: '#63e6be' }),
      border: cond({
        default: 'rgba(12, 166, 120, 0.25)',
        [DARK]: 'rgba(99, 230, 190, 0.25)',
      }),
    },
    warning: {
      bg: cond({
        default: 'rgba(116, 184, 22, 0.08)',
        [DARK]: 'rgba(116, 184, 22, 0.15)',
      }),
      text: cond({ default: '#74b816', [DARK]: '#a9e34b' }),
      border: cond({
        default: 'rgba(116, 184, 22, 0.25)',
        [DARK]: 'rgba(169, 227, 75, 0.25)',
      }),
    },
    error: {
      bg: cond({
        default: 'rgba(224, 49, 49, 0.08)',
        [DARK]: 'rgba(224, 49, 49, 0.15)',
      }),
      text: cond({ default: '#e03131', [DARK]: '#ff6b6b' }),
      border: cond({
        default: 'rgba(224, 49, 49, 0.25)',
        [DARK]: 'rgba(255, 107, 107, 0.25)',
      }),
    },
  },
});

// ─── Theme overrides (unstable_createThemeNested) ────────────
export const sunsetTheme = stylex.unstable_createThemeNested(tokens, {
  surface: {
    bg: '#fff4e6',
    card: '#fff8f0',
    cardShadow: '0 4px 24px rgba(180, 100, 0, 0.15)',
    hover: 'rgba(180, 100, 0, 0.06)',
    divider: 'rgba(180, 100, 0, 0.12)',
  },
  accent: {
    base: '#e8590c',
    light: 'rgba(232, 89, 12, 0.08)',
    faded: 'rgba(232, 89, 12, 0.19)',
    border: 'rgba(232, 89, 12, 0.25)',
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
    error: {
      bg: 'rgba(190, 75, 219, 0.08)',
      text: '#be4bdb',
      border: 'rgba(190, 75, 219, 0.25)',
    },
  },
});

export const forestTheme = stylex.unstable_createThemeNested(tokens, {
  surface: {
    bg: '#e6f9ed',
    card: '#f0faf4',
    cardShadow: '0 4px 24px rgba(0, 100, 50, 0.12)',
    hover: 'rgba(0, 100, 50, 0.04)',
    divider: 'rgba(0, 100, 50, 0.1)',
  },
  accent: {
    base: '#2f9e44',
    light: 'rgba(47, 158, 68, 0.08)',
    faded: 'rgba(47, 158, 68, 0.19)',
    border: 'rgba(47, 158, 68, 0.25)',
  },
  badge: {
    info: {
      bg: 'rgba(32, 201, 151, 0.08)',
      text: '#0ca678',
      border: 'rgba(12, 166, 120, 0.25)',
    },
    success: {
      bg: 'rgba(55, 178, 77, 0.08)',
      text: '#37b24d',
      border: 'rgba(55, 178, 77, 0.25)',
    },
    warning: {
      bg: 'rgba(148, 216, 45, 0.08)',
      text: '#74b816',
      border: 'rgba(116, 184, 22, 0.25)',
    },
    error: {
      bg: 'rgba(230, 73, 128, 0.08)',
      text: '#e64980',
      border: 'rgba(230, 73, 128, 0.25)',
    },
  },
});

// ─── Static constants (inlined at compile time) ──────────────
export const consts = stylex.unstable_defineConstsNested({
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, Menlo, Monaco, "Cascadia Mono", monospace',
  },
  radius: {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.75rem',
    pill: '999px',
  },
  badge: {
    paddingInline: '0.625rem',
    paddingBlock: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.025em',
  },
});
