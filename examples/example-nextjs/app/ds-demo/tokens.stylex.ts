/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * XDS-style three-tier token architecture using the nested APIs.
 *
 *   Tier 1: Primitives  → unstable_defineConstsNested (compile-time, no CSS vars)
 *   Tier 2: Semantics   → unstable_defineVarsNested   (CSS vars, themeable)
 *   Tier 3: Themes      → unstable_createThemeNested  (override semantic tokens)
 */

// @ts-nocheck — nested APIs are experimental and lack TS type definitions.

import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER 1 — Primitives (compile-time constants, zero runtime cost)
//
// Raw palette values. Never referenced directly in components —
// only consumed by Tier 2 semantic tokens.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const primitives = stylex.unstable_defineConstsNested({
  color: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
    },
    red: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    white: '#ffffff',
    black: '#000000',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '999px',
  },
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER 2 — Semantic tokens (CSS custom properties, themeable)
//
// Meaningful names that map primitives to intent.
// These are the ONLY tokens components should reference.
// Each value can have light/dark mode variants.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const tokens = stylex.unstable_defineVarsNested({
  color: {
    // Surfaces
    bg: {
      default: primitives.color.gray[50],
      [DARK]: primitives.color.gray[950],
    },
    surface: {
      default: primitives.color.white,
      [DARK]: primitives.color.gray[900],
    },
    surfaceHover: {
      default: primitives.color.gray[100],
      [DARK]: primitives.color.gray[800],
    },
    divider: {
      default: primitives.color.gray[200],
      [DARK]: primitives.color.gray[700],
    },

    // Text
    textPrimary: {
      default: primitives.color.gray[900],
      [DARK]: primitives.color.gray[100],
    },
    textSecondary: {
      default: primitives.color.gray[500],
      [DARK]: primitives.color.gray[400],
    },
    textMuted: {
      default: primitives.color.gray[400],
      [DARK]: primitives.color.gray[600],
    },

    // Accent (brand)
    accent: {
      default: primitives.color.blue[600],
      [DARK]: primitives.color.blue[500],
    },
    accentHover: {
      default: primitives.color.blue[700],
      [DARK]: primitives.color.blue[600],
    },
    accentSoft: {
      default: primitives.color.blue[50],
      [DARK]: 'rgba(59, 130, 246, 0.12)',
    },
    accentText: {
      default: primitives.color.white,
      [DARK]: primitives.color.white,
    },

    // Status
    success: {
      default: primitives.color.green[600],
      [DARK]: primitives.color.green[500],
    },
    successSoft: {
      default: primitives.color.green[50],
      [DARK]: 'rgba(34, 197, 94, 0.12)',
    },
    warning: {
      default: primitives.color.orange[600],
      [DARK]: primitives.color.orange[500],
    },
    warningSoft: {
      default: primitives.color.orange[50],
      [DARK]: 'rgba(249, 115, 22, 0.12)',
    },
    error: {
      default: primitives.color.red[600],
      [DARK]: primitives.color.red[500],
    },
    errorSoft: {
      default: primitives.color.red[50],
      [DARK]: 'rgba(239, 68, 68, 0.12)',
    },
  },

  elevation: {
    sm: {
      default: '0 1px 2px rgba(0,0,0,0.05)',
      [DARK]: '0 1px 2px rgba(0,0,0,0.3)',
    },
    md: {
      default: '0 4px 12px rgba(0,0,0,0.08)',
      [DARK]: '0 4px 12px rgba(0,0,0,0.4)',
    },
    lg: {
      default: '0 8px 24px rgba(0,0,0,0.12)',
      [DARK]: '0 8px 24px rgba(0,0,0,0.5)',
    },
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIER 3 — Theme overrides
//
// Override semantic tokens to create branded experiences.
// Only the values that change need to be specified.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const purpleTheme = stylex.unstable_createThemeNested(tokens, {
  color: {
    bg: primitives.color.purple[50],
    accent: primitives.color.purple[600],
    accentHover: primitives.color.purple[700],
    accentSoft: primitives.color.purple[100],
    accentText: primitives.color.white,
  },
});

export const greenTheme = stylex.unstable_createThemeNested(tokens, {
  color: {
    bg: primitives.color.green[50],
    accent: primitives.color.green[600],
    accentHover: primitives.color.green[700],
    accentSoft: primitives.color.green[100],
    accentText: primitives.color.white,
  },
});

export const orangeTheme = stylex.unstable_createThemeNested(tokens, {
  color: {
    bg: primitives.color.orange[50],
    accent: primitives.color.orange[600],
    accentHover: primitives.color.orange[700],
    accentSoft: primitives.color.orange[100],
    accentText: primitives.color.white,
  },
});
