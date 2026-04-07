/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * XDS-style demo: shows the three-tier token architecture
 * (Primitives → Semantics → Themes) using the nested APIs.
 */

'use client';

import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  primitives,
  tokens,
  purpleTheme,
  greenTheme,
  orangeTheme,
} from './tokens.stylex';

const DARK = '@media (prefers-color-scheme: dark)';
const MOBILE = '@media (max-width: 700px)';

const THEMES = [
  { name: 'Default', theme: null, accent: '#2563eb' },
  { name: 'Purple', theme: purpleTheme, accent: '#9333ea' },
  { name: 'Green', theme: greenTheme, accent: '#16a34a' },
  { name: 'Orange', theme: orangeTheme, accent: '#ea580c' },
] as const;

export default function XdsDemoPage() {
  const [themeIndex, setThemeIndex] = useState(0);

  return (
    <main {...stylex.props(s.page, THEMES[themeIndex].theme)}>
      {/* ── Header ──────────────────────────────────── */}
      <header {...stylex.props(s.header)}>
        <a {...stylex.props(s.backLink)} href="/nested-demo">
          ← Back
        </a>
        <h1 {...stylex.props(s.title)}>
          Design System <span {...stylex.props(s.titleAccent)}>Theming</span>{' '}
          Demo
        </h1>
        <p {...stylex.props(s.subtitle)}>
          A showcase of three-tier token architecture (Primitives → Semantics →
          Themes) with the nested APIs
        </p>
      </header>

      {/* ── Theme Picker ───────────────────────────── */}
      <nav {...stylex.props(s.picker)}>
        <span {...stylex.props(s.pickerLabel)}>Theme</span>
        <div {...stylex.props(s.pickerRow)}>
          {THEMES.map((t, i) => (
            <button
              key={t.name}
              {...stylex.props(
                s.pickerBtn,
                i === themeIndex && s.pickerBtnActive,
              )}
              onClick={() => setThemeIndex(i)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Architecture Diagram ───────────────────── */}
      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>How It Works</h2>
        <div {...stylex.props(s.tierRow)}>
          <div {...stylex.props(s.tierCard)}>
            <div {...stylex.props(s.tierBadge, s.tierBadge1)}>Tier 1</div>
            <h3 {...stylex.props(s.tierName)}>Primitives</h3>
            <code {...stylex.props(s.tierApi)}>defineConstsNested</code>
            <p {...stylex.props(s.tierDesc)}>
              Raw palette values inlined at compile time. Zero runtime cost.
            </p>
            <div {...stylex.props(s.tierExample)}>
              <code {...stylex.props(s.code)}>primitives.color.blue[600]</code>
            </div>
          </div>
          <div {...stylex.props(s.tierArrow)}>→</div>
          <div {...stylex.props(s.tierCard)}>
            <div {...stylex.props(s.tierBadge, s.tierBadge2)}>Tier 2</div>
            <h3 {...stylex.props(s.tierName)}>Semantic Tokens</h3>
            <code {...stylex.props(s.tierApi)}>defineVarsNested</code>
            <p {...stylex.props(s.tierDesc)}>
              Intent-based CSS variables that components reference. Themeable.
            </p>
            <div {...stylex.props(s.tierExample)}>
              <code {...stylex.props(s.code)}>tokens.color.accent</code>
            </div>
          </div>
          <div {...stylex.props(s.tierArrow)}>→</div>
          <div {...stylex.props(s.tierCard)}>
            <div {...stylex.props(s.tierBadge, s.tierBadge3)}>Tier 3</div>
            <h3 {...stylex.props(s.tierName)}>Themes</h3>
            <code {...stylex.props(s.tierApi)}>createThemeNested</code>
            <p {...stylex.props(s.tierDesc)}>
              Override any semantic token. Partial overrides supported.
            </p>
            <div {...stylex.props(s.tierExample)}>
              <code {...stylex.props(s.code)}>purpleTheme, greenTheme…</code>
            </div>
          </div>
        </div>
      </section>

      {/* ── Component Showcase ─────────────────────── */}
      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>Components</h2>
        <p {...stylex.props(s.sectionDesc)}>
          Every component below references only{' '}
          <code {...stylex.props(s.code)}>tokens.*</code> — no hard-coded
          colors. Switching themes re-skins everything instantly.
        </p>

        <div {...stylex.props(s.componentGrid)}>
          {/* Buttons */}
          <div {...stylex.props(s.demoCard)}>
            <p {...stylex.props(s.demoLabel)}>Buttons</p>
            <div {...stylex.props(s.demoRow)}>
              <button {...stylex.props(s.btnPrimary)}>Primary</button>
              <button {...stylex.props(s.btnSecondary)}>Secondary</button>
              <button {...stylex.props(s.btnGhost)}>Ghost</button>
            </div>
          </div>

          {/* Status badges */}
          <div {...stylex.props(s.demoCard)}>
            <p {...stylex.props(s.demoLabel)}>Status Badges</p>
            <div {...stylex.props(s.demoRow)}>
              <span {...stylex.props(s.badge, s.badgeSuccess)}>Success</span>
              <span {...stylex.props(s.badge, s.badgeWarning)}>Warning</span>
              <span {...stylex.props(s.badge, s.badgeError)}>Error</span>
              <span {...stylex.props(s.badge, s.badgeAccent)}>Accent</span>
            </div>
          </div>

          {/* Card */}
          <div {...stylex.props(s.demoCard)}>
            <p {...stylex.props(s.demoLabel)}>Surface Card</p>
            <div {...stylex.props(s.innerCard)}>
              <p {...stylex.props(s.innerCardTitle)}>Nested surface</p>
              <p {...stylex.props(s.innerCardBody)}>
                Background, shadow, and divider colors all come from{' '}
                <code {...stylex.props(s.code)}>tokens.color.surface</code> and{' '}
                <code {...stylex.props(s.code)}>tokens.elevation.*</code>.
              </p>
            </div>
          </div>

          {/* Input */}
          <div {...stylex.props(s.demoCard)}>
            <p {...stylex.props(s.demoLabel)}>Form Input</p>
            <div {...stylex.props(s.inputWrapper)}>
              <input
                {...stylex.props(s.input)}
                placeholder="Type something…"
                readOnly
              />
              <button {...stylex.props(s.btnPrimary, s.inputBtn)}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Token Reference ────────────────────────── */}
      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>Live Token Values</h2>
        <p {...stylex.props(s.sectionDesc)}>
          These swatches reflect the current theme's semantic tokens in real
          time.
        </p>
        <div {...stylex.props(s.swatchGrid)}>
          {[
            { label: 'color.accent', style: s.swAccent },
            { label: 'color.accentHover', style: s.swAccentHover },
            { label: 'color.accentSoft', style: s.swAccentSoft },
            { label: 'color.success', style: s.swSuccess },
            { label: 'color.warning', style: s.swWarning },
            { label: 'color.error', style: s.swError },
            { label: 'color.surface', style: s.swSurface },
            { label: 'color.surfaceHover', style: s.swSurfaceHover },
            { label: 'color.divider', style: s.swDivider },
          ].map((item) => (
            <div key={item.label} {...stylex.props(s.swatchItem)}>
              <div {...stylex.props(s.swatch, item.style)} />
              <code {...stylex.props(s.swatchCode)}>{item.label}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer {...stylex.props(s.footer)}>
        Source: <code {...stylex.props(s.code)}>tokens.stylex.ts</code>
      </footer>
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const s = stylex.create({
  // Layout
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem',
    minHeight: '100vh',
    paddingTop: '3rem',
    paddingBottom: '4rem',
    paddingInline: '1.5rem',
    backgroundColor: tokens.color.bg,
    color: tokens.color.textPrimary,
    fontFamily: primitives.font.sans,
    transitionProperty: 'background-color, color',
    transitionDuration: '250ms',
  },

  // Header
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    textAlign: 'center',
  },
  backLink: {
    fontSize: '0.8rem',
    color: tokens.color.textMuted,
    textDecoration: 'none',
    opacity: { default: 0.8, ':hover': 1 },
  },
  title: {
    fontSize: { default: '2.5rem', [MOBILE]: '1.75rem' },
    fontWeight: primitives.fontWeight.bold,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    margin: 0,
  },
  titleAccent: {
    color: tokens.color.accent,
    transitionProperty: 'color',
    transitionDuration: '250ms',
  },
  subtitle: {
    fontSize: '1rem',
    color: tokens.color.textSecondary,
    margin: 0,
  },
  tagline: {
    fontSize: '0.85rem',
    color: tokens.color.accent,
    fontWeight: primitives.fontWeight.medium,
    margin: 0,
    transitionProperty: 'color',
    transitionDuration: '250ms',
  },

  // Theme picker
  picker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pickerLabel: {
    fontSize: '0.7rem',
    fontWeight: primitives.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: tokens.color.accent,
    transitionProperty: 'color',
    transitionDuration: '250ms',
  },
  pickerRow: {
    display: 'flex',
    gap: '0.375rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pickerBtn: {
    paddingInline: '0.875rem',
    paddingBlock: '0.4rem',
    borderRadius: primitives.radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.divider,
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.color.surfaceHover,
    },
    color: tokens.color.textPrimary,
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: primitives.font.sans,
    transitionProperty: 'all',
    transitionDuration: '200ms',
  },
  pickerBtnActive: {
    fontWeight: primitives.fontWeight.semibold,
    borderColor: tokens.color.accent,
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
  },

  // Sections
  section: {
    width: '100%',
    maxWidth: 720,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: primitives.fontWeight.semibold,
    margin: 0,
  },
  sectionDesc: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: 0,
    color: tokens.color.textSecondary,
    maxWidth: '50ch',
  },

  // Tier diagram
  tierRow: {
    display: 'flex',
    gap: '0.75rem',
    width: '100%',
    alignItems: 'stretch',
    flexDirection: { default: 'row', [MOBILE]: 'column' },
  },
  tierArrow: {
    display: { default: 'flex', [MOBILE]: 'none' },
    alignItems: 'center',
    fontSize: '1.25rem',
    color: tokens.color.textMuted,
  },
  tierCard: {
    flex: '1',
    padding: '1.25rem',
    borderRadius: primitives.radius.lg,
    backgroundColor: tokens.color.surface,
    boxShadow: tokens.elevation.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.divider,
    transitionProperty: 'background-color, border-color, box-shadow',
    transitionDuration: '250ms',
  },
  tierBadge: {
    alignSelf: 'flex-start',
    fontSize: '0.65rem',
    fontWeight: primitives.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    paddingInline: '0.5rem',
    paddingBlock: '0.15rem',
    borderRadius: primitives.radius.sm,
  },
  tierBadge1: {
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
  },
  tierBadge2: {
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
  },
  tierBadge3: {
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
  },
  tierName: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: primitives.fontWeight.semibold,
  },
  tierApi: {
    fontFamily: primitives.font.mono,
    fontSize: '0.7rem',
    color: tokens.color.accent,
    transitionProperty: 'color',
    transitionDuration: '250ms',
  },
  tierDesc: {
    margin: 0,
    fontSize: '0.775rem',
    lineHeight: 1.5,
    color: tokens.color.textSecondary,
  },
  tierExample: {
    marginTop: 'auto',
    paddingTop: '0.5rem',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.color.divider,
  },

  // Component showcase
  componentGrid: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(2, 1fr)', [MOBILE]: '1fr' },
    gap: '0.75rem',
    width: '100%',
  },
  demoCard: {
    padding: '1.25rem',
    borderRadius: primitives.radius.lg,
    backgroundColor: tokens.color.surface,
    boxShadow: tokens.elevation.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.divider,
    transitionProperty: 'background-color, border-color, box-shadow',
    transitionDuration: '250ms',
  },
  demoLabel: {
    margin: 0,
    fontSize: '0.7rem',
    fontWeight: primitives.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: tokens.color.textMuted,
  },
  demoRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },

  // Buttons
  btnPrimary: {
    paddingInline: '1rem',
    paddingBlock: '0.5rem',
    borderRadius: primitives.radius.md,
    borderWidth: 0,
    backgroundColor: tokens.color.accent,
    color: tokens.color.accentText,
    fontSize: '0.8rem',
    fontWeight: primitives.fontWeight.semibold,
    fontFamily: primitives.font.sans,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '200ms',
  },
  btnSecondary: {
    paddingInline: '1rem',
    paddingBlock: '0.5rem',
    borderRadius: primitives.radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.accent,
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
    fontSize: '0.8rem',
    fontWeight: primitives.fontWeight.semibold,
    fontFamily: primitives.font.sans,
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '200ms',
  },
  btnGhost: {
    paddingInline: '1rem',
    paddingBlock: '0.5rem',
    borderRadius: primitives.radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.divider,
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.color.surfaceHover,
    },
    color: tokens.color.textPrimary,
    fontSize: '0.8rem',
    fontWeight: primitives.fontWeight.medium,
    fontFamily: primitives.font.sans,
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '200ms',
  },

  // Badges
  badge: {
    paddingInline: '0.625rem',
    paddingBlock: '0.2rem',
    borderRadius: primitives.radius.full,
    fontSize: '0.7rem',
    fontWeight: primitives.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  badgeSuccess: {
    backgroundColor: tokens.color.successSoft,
    color: tokens.color.success,
  },
  badgeWarning: {
    backgroundColor: tokens.color.warningSoft,
    color: tokens.color.warning,
  },
  badgeError: {
    backgroundColor: tokens.color.errorSoft,
    color: tokens.color.error,
  },
  badgeAccent: {
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
  },

  // Inner card
  innerCard: {
    padding: '1rem',
    borderRadius: primitives.radius.md,
    backgroundColor: tokens.color.surfaceHover,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  innerCardTitle: {
    margin: 0,
    fontSize: '0.8rem',
    fontWeight: primitives.fontWeight.semibold,
  },
  innerCardBody: {
    margin: 0,
    fontSize: '0.775rem',
    lineHeight: 1.5,
    color: tokens.color.textSecondary,
  },

  // Input
  inputWrapper: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: '1',
    paddingInline: '0.75rem',
    paddingBlock: '0.5rem',
    borderRadius: primitives.radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.divider,
    backgroundColor: tokens.color.surface,
    color: tokens.color.textPrimary,
    fontSize: '0.8rem',
    fontFamily: primitives.font.sans,
    outline: 'none',
    transitionProperty: 'border-color',
    transitionDuration: '200ms',
  },
  inputBtn: {
    flexShrink: 0,
  },

  // Swatches
  swatchGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, 1fr)',
      [MOBILE]: 'repeat(2, 1fr)',
    },
    gap: '0.75rem',
    width: '100%',
  },
  swatchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem',
    borderRadius: primitives.radius.md,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.divider,
    transitionProperty: 'background-color, border-color',
    transitionDuration: '250ms',
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: primitives.radius.sm,
    flexShrink: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.06)',
    transitionProperty: 'background-color',
    transitionDuration: '250ms',
  },
  swAccent: { backgroundColor: tokens.color.accent },
  swAccentHover: { backgroundColor: tokens.color.accentHover },
  swAccentSoft: { backgroundColor: tokens.color.accentSoft },
  swSuccess: { backgroundColor: tokens.color.success },
  swWarning: { backgroundColor: tokens.color.warning },
  swError: { backgroundColor: tokens.color.error },
  swSurface: { backgroundColor: tokens.color.surface },
  swSurfaceHover: { backgroundColor: tokens.color.surfaceHover },
  swDivider: { backgroundColor: tokens.color.divider },
  swatchCode: {
    fontFamily: primitives.font.mono,
    fontSize: '0.675rem',
    color: tokens.color.textSecondary,
  },

  // Shared
  code: {
    fontFamily: primitives.font.mono,
    fontSize: '0.8em',
    backgroundColor: {
      default: 'rgba(0,0,0,0.04)',
      [DARK]: 'rgba(255,255,255,0.08)',
    },
    paddingInline: '0.3em',
    paddingBlock: '0.1em',
    borderRadius: '4px',
  },

  // Footer
  footer: {
    fontSize: '0.75rem',
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
});
