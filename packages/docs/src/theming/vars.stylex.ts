/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';

const fdFadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fdFadeOut = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const fdSidebarIn = stylex.keyframes({
  from: {
    transform: 'translateX(var(--fd-sidebar-mobile-offset))',
  },
});

const fdSidebarOut = stylex.keyframes({
  to: {
    transform: 'translateX(var(--fd-sidebar-mobile-offset))',
  },
});

const fdDialogIn = stylex.keyframes({
  from: {
    opacity: 0,
    // transform: 'scale(1.06)',
    scale: 1.06,
  },
  to: {
    // transform: 'scale(1)',
    scale: 1,
  },
});

const fdDialogOut = stylex.keyframes({
  from: {
    // transform: 'scale(1)',
    scale: 1,
  },
  to: {
    opacity: 0,
    // transform: 'scale(1.04)',
    scale: 1.04,
  },
});

const pulse = stylex.keyframes({
  '50%': {
    opacity: 0.5,
  },
});

const lightDark = (light: string, dark: string) =>
  `light-dark(${light}, ${dark})`;

export const vars = stylex.defineVars({
  '--font-sans': [
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ]
    .map((font) => (font.includes(' ') ? `"${font}"` : font))
    .join(', '),
  '--font-mono': [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
  ]
    .map((font) => (font.includes(' ') ? `"${font}"` : font))
    .join(', '),

  '--color-black': '#000',
  '--spacing': '0.25rem',
  '--breakpoint-sm': '40rem',
  '--container-sm': '24rem',
  '--text-xs': '0.75rem',
  '--text-xs--line-height': 'calc(1 / 0.75)',
  '--text-sm': '0.875rem',
  '--text-sm--line-height': 'calc(1.25 / 0.875)',
  '--text-lg': '1.125rem',
  '--text-lg--line-height': 'calc(1.75 / 1.125)',
  '--text-2xl': '1.5rem',
  '--text-3xl': '1.875rem',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--radius-sm': '0.25rem',
  '--radius-md': '0.375rem',
  '--radius-lg': '0.5rem',
  '--radius-xl': '0.75rem',
  '--radius-2xl': '1rem',
  '--ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  '--ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  '--blur-xs': '4px',
  '--blur-sm': '8px',
  '--blur-lg': '16px',
  '--default-transition-duration': '150ms',
  '--default-transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
  '--default-font-family': 'var(--font-sans)',
  '--default-mono-font-family': 'var(--font-mono)',

  '--color-code-green': 'light-dark(hsl(146, 55%, 31%), hsl(146, 52%, 68%))',

  '--color-fd-background': lightDark('hsl(0, 0%, 100%)', 'hsl(0, 0%, 7%)'),
  '--color-fd-foreground': lightDark('hsl(0, 0%, 3.9%)', 'hsl(0, 0%, 92%)'),
  '--color-fd-muted': lightDark('hsl(0, 0%, 96.1%)', 'hsl(0, 0%, 12.9%)'),
  '--color-fd-muted-foreground': lightDark(
    'hsl(0, 0%, 45.1%)',
    'hsla(0, 0%, 70%, 0.8)',
  ),
  '--color-fd-popover': lightDark('hsl(0, 0%, 98%)', 'hsl(0, 0%, 11.6%)'),
  '--color-fd-popover-foreground': lightDark(
    'hsl(0, 0%, 15.1%)',
    'hsl(0, 0%, 86.9%)',
  ),
  '--color-fd-card': lightDark('hsl(0, 0%, 97%)', 'hsl(0, 0%, 8.5%)'),
  '--color-fd-card-foreground': lightDark(
    'hsl(0, 0%, 3.9%)',
    'hsl(0, 0%, 98%)',
  ),
  '--color-fd-border': lightDark(
    'hsla(0, 0%, 80%, 55%)',
    'hsla(0, 0%, 30%, 25%)',
  ),

  '--color-fd-primary': lightDark('hsl(266, 58%, 61.8%)', 'hsl(270, 72%, 77%)'),
  '--color-fd-primary-foreground': lightDark(
    'hsl(234, 16%, 35%)',
    'hsl(240, 23%, 9%)',
  ),
  '--color-fd-secondary': lightDark('hsl(0, 0%, 93.1%)', 'hsl(0, 0%, 12.9%)'),
  '--color-fd-secondary-foreground': lightDark(
    'hsl(0, 0%, 9%)',
    'hsl(0, 0%, 70%)',
  ),
  '--color-fd-accent': lightDark('hsl(222, 16%, 83%)', 'hsl(222, 16%, 23%)'),
  '--color-fd-accent-foreground': lightDark(
    'hsl(222, 67%, 58%)',
    'hsl(222, 87%, 78%)',
  ),
  '--color-fd-ring': lightDark('hsl(267, 84%, 81%)', 'hsl(267, 84%, 81%)'),
  '--color-fd-overlay': lightDark('transparent', 'hsla(0, 0%, 0%, 0.2)'),

  '--color-fd-info': 'oklch(62.3% 0.214 259.815)',
  '--color-fd-warning': 'oklch(76.9% 0.188 70.08)',
  '--color-fd-error': 'oklch(63.7% 0.237 25.331)',
  '--color-fd-success': 'oklch(72.3% 0.219 149.579)',
  '--color-fd-diff-remove': 'rgba(200, 10, 100, 0.12)',
  '--color-fd-diff-remove-symbol': 'rgb(230, 10, 100)',
  '--color-fd-diff-add': 'rgba(14, 180, 100, 0.1)',
  '--color-fd-diff-add-symbol': 'rgb(10, 200, 100)',

  '--fd-sidebar-mobile-offset': '100%',
  '--spacing-fd-container': '1400px',
  '--fd-page-width': '1200px',
  '--fd-sidebar-width': '0px',
  '--fd-toc-width': '0px',
  '--fd-layout-width': '1600px',
  '--fd-banner-height': '0px',
  '--fd-nav-height': '64px',
  '--fd-tocnav-height': '0px',

  '--animate-pulse': pulse,

  '--animate-fd-fade-in': fdFadeIn,
  '--animate-fd-fade-out': fdFadeOut,
  '--animate-fd-sidebar-in': fdSidebarIn,
  '--animate-fd-sidebar-out': fdSidebarOut,

  '--animate-fd-dialog-in': fdDialogIn,
  '--animate-fd-dialog-out': fdDialogOut,
});

export const ANIMATION_DURATIONS = stylex.defineConsts({
  pulse: '2s',
});

export const EASINGS = stylex.defineConsts({
  dialog: 'cubic-bezier(0.16, 1, 0.3, 1)',
  pulse: 'cubic-bezier(0.4, 0, 0.6, 1)',
});

export const playgroundVars = stylex.defineVars({
  '--pg-border': lightDark('hsla(0, 0%, 72%, 45%)', 'hsla(0, 0%, 40%, 20%)'),
  '--pg-panel-surface': lightDark('#ffffff', '#0b0b0f'),
  '--pg-panel-shadow': lightDark(
    'rgba(0, 0, 0, 0.1)',
    'rgba(255, 255, 255, 0.1)',
  ),
  '--pg-header-surface': lightDark('#ffffff', '#1a1a1a'),
  '--pg-header-shadow': lightDark('hsl(248, 66%, 62%)', 'transparent'),
  '--pg-tabs-border': lightDark('#d4d4d8', 'hsla(0, 0%, 30%, 20%)'),
  '--pg-preview': lightDark('hsl(0, 0%, 97%)', '#222'),
});

export const legacyColors = stylex.defineVars({
  '--bg1': 'hsl(249, 30%, 3%)',
  '--bg1-alpha50': 'hsla(249, 30%, 3%, 0.5)',
  '--bg1-alpha75': 'hsla(249, 30%, 3%, 0.75)',
  '--bg2': 'hsl(249, 35%, 16%)',
  '--code-bg': '#000000',

  '--fg1': 'hsl(0, 0%, 100%)',
  '--fg2': 'hsl(0, 0%, 60%)',

  '--link': 'hsl(202, 100%, 57%)',
  '--cyan': 'hsl(249, 70%, 57%)',
  '--cyan-h': '249',
  '--cyan-s': '70%',
  '--cyan-l': '57%',
  '--pink': 'hsl(295, 62%, 66%)',
  '--pink-h': '295',
  '--pink-s': '62%',
  '--pink-l': '66%',

  '--purple-navy': '#575176',
  '--black-coffee': '#363033',
});

export const activeLinkMarker = stylex.defineMarker();
