/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Tokens and themes for the defineTheme demo.
 *
 * In production, you'd use:
 *   export const { tokens, themes } = stylex.defineTheme({...});
 *
 * Here we use the primitives directly so that cross-file resolution
 * works with the current Next.js + Turbopack build pipeline.
 * The demo page shows the defineTheme API side-by-side.
 */

import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

// ─── Tokens (defineVarsNested) ───────────────────────────────
export const tokens = stylex.unstable_defineVarsNested({
  color: {
    accent: { default: '#2563eb', [DARK]: '#60a5fa' },
    accentSoft: {
      default: 'rgba(37, 99, 235, 0.08)',
      [DARK]: 'rgba(96, 165, 250, 0.12)',
    },
    accentBorder: {
      default: 'rgba(37, 99, 235, 0.25)',
      [DARK]: 'rgba(96, 165, 250, 0.25)',
    },
    bg: { default: '#fafafa', [DARK]: '#0f1117' },
    surface: { default: 'white', [DARK]: '#1a1b26' },
    surfaceHover: {
      default: 'rgba(0,0,0,0.02)',
      [DARK]: 'rgba(255,255,255,0.04)',
    },
    textPrimary: { default: '#111827', [DARK]: '#e5e7eb' },
    textSecondary: { default: '#6b7280', [DARK]: '#9ca3af' },
    textMuted: { default: '#9ca3af', [DARK]: '#6b7280' },
    border: {
      default: 'rgba(0,0,0,0.08)',
      [DARK]: 'rgba(255,255,255,0.1)',
    },
    success: { default: '#16a34a', [DARK]: '#4ade80' },
    warning: { default: '#d97706', [DARK]: '#fbbf24' },
    error: { default: '#dc2626', [DARK]: '#f87171' },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadow: {
    sm: {
      default: '0 1px 3px rgba(0,0,0,0.08)',
      [DARK]: '0 1px 3px rgba(0,0,0,0.3)',
    },
    md: {
      default: '0 4px 16px rgba(0,0,0,0.06)',
      [DARK]: '0 4px 16px rgba(0,0,0,0.3)',
    },
    lg: {
      default: '0 8px 32px rgba(0,0,0,0.08)',
      [DARK]: '0 8px 32px rgba(0,0,0,0.4)',
    },
  },
});

// ─── Themes (createThemeNested) ──────────────────────────────
export const sunsetTheme = stylex.unstable_createThemeNested(tokens, {
  color: {
    accent: '#e8590c',
    accentSoft: 'rgba(232, 89, 12, 0.08)',
    accentBorder: 'rgba(232, 89, 12, 0.25)',
    bg: '#fff7ed',
    surface: '#fffbf5',
    surfaceHover: 'rgba(180, 100, 0, 0.04)',
    border: 'rgba(180, 100, 0, 0.1)',
  },
  shadow: {
    md: '0 4px 16px rgba(180, 100, 0, 0.1)',
  },
});

export const forestTheme = stylex.unstable_createThemeNested(tokens, {
  color: {
    accent: '#16a34a',
    accentSoft: 'rgba(22, 163, 74, 0.08)',
    accentBorder: 'rgba(22, 163, 74, 0.25)',
    bg: '#f0fdf4',
    surface: '#f7fef9',
    surfaceHover: 'rgba(0, 100, 50, 0.04)',
    border: 'rgba(0, 100, 50, 0.08)',
  },
  shadow: {
    md: '0 4px 16px rgba(0, 100, 50, 0.08)',
  },
});

export const lavenderTheme = stylex.unstable_createThemeNested(tokens, {
  color: {
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.08)',
    accentBorder: 'rgba(124, 58, 237, 0.25)',
    bg: '#f5f3ff',
    surface: '#faf8ff',
    surfaceHover: 'rgba(124, 58, 237, 0.03)',
    border: 'rgba(124, 58, 237, 0.1)',
  },
  shadow: {
    md: '0 4px 16px rgba(124, 58, 237, 0.08)',
  },
});
