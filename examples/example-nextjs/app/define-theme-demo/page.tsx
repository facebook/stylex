/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Demo page for the stylex.defineTheme() API.
 *
 * The key insight: tokens AND themes are co-located in ONE .stylex.ts file
 * (tokens.stylex.ts). Before defineTheme, you needed two separate files:
 *   tokens.stylex.ts → defineVarsNested({...})
 *   themes.ts        → createThemeNested(tokens, {...})
 *
 * For cross-package token sharing, use the primitives instead
 * (unstable_defineVarsNested + unstable_createThemeNested).
 */

'use client';

import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  tokens,
  sunsetTheme,
  forestTheme,
  lavenderTheme,
} from './tokens.stylex';

const DARK = '@media (prefers-color-scheme: dark)';
const MOBILE = '@media (max-width: 700px)';

const THEME_LIST = [
  { name: 'Default', theme: null, emoji: '🔵' },
  { name: 'Sunset', theme: sunsetTheme, emoji: '🌅' },
  { name: 'Forest', theme: forestTheme, emoji: '🌲' },
  { name: 'Lavender', theme: lavenderTheme, emoji: '💜' },
] as const;

const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const FONT_MONO = 'ui-monospace, Menlo, Monaco, "Cascadia Mono", monospace';

// ─── Styles ──────────────────────────────────────────────────
const s = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.xxl,
    minHeight: '100vh',
    paddingTop: '4rem',
    paddingBottom: '4rem',
    paddingInline: tokens.spacing.lg,
    backgroundColor: tokens.color.bg,
    color: tokens.color.textPrimary,
    fontFamily: FONT_SANS,
    transitionProperty: 'background-color, color',
    transitionDuration: '300ms',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.md,
    maxWidth: 640,
    textAlign: 'center',
  },
  backLink: {
    fontSize: '0.875rem',
    color: tokens.color.accent,
    textDecoration: 'none',
    opacity: { default: 0.7, ':hover': 1 },
    transitionDuration: '200ms',
  },
  title: {
    fontSize: { default: '2.5rem', [MOBILE]: '1.75rem' },
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  titleCode: {
    fontFamily: FONT_MONO,
    fontWeight: 600,
    fontSize: '0.85em',
  },
  titleAccent: {
    fontWeight: 300,
    color: tokens.color.accent,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  subtitle: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: tokens.color.textSecondary,
    maxWidth: '42ch',
    textWrap: 'balance',
    margin: 0,
  },
  picker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  pickerLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: tokens.color.accent,
    transitionDuration: '300ms',
  },
  pickerRow: {
    display: 'flex',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pickerBtn: {
    paddingInline: tokens.spacing.md,
    paddingBlock: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.border,
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.color.surfaceHover,
    },
    color: tokens.color.textPrimary,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: FONT_SANS,
    transitionDuration: '200ms',
  },
  pickerBtnActive: {
    fontWeight: 600,
    borderColor: tokens.color.accent,
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
  },
  section: {
    width: '100%',
    maxWidth: 720,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sectionDesc: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: 0,
    color: tokens.color.textSecondary,
  },
  compareGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacing.md,
    width: '100%',
  },
  compareCard: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.surface,
    boxShadow: tokens.shadow.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.border,
    transitionDuration: '300ms',
    width: '100%',
    maxWidth: 480,
  },
  compareCardAfter: {
    borderColor: tokens.color.accentBorder,
    borderWidth: 2,
  },
  compareLabel: {
    margin: 0,
    marginBottom: tokens.spacing.sm,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  compareLabelBefore: { color: tokens.color.textMuted },
  compareLabelAfter: { color: tokens.color.accent },
  pre: {
    margin: 0,
    padding: tokens.spacing.sm,
    backgroundColor: {
      default: 'rgba(0,0,0,0.03)',
      [DARK]: 'rgba(255,255,255,0.05)',
    },
    borderRadius: tokens.radius.sm,
    fontSize: '0.72rem',
    fontFamily: FONT_MONO,
    lineHeight: 1.5,
    overflow: 'auto',
    color: tokens.color.textPrimary,
  },
  showcaseGrid: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(2, 1fr)', [MOBILE]: '1fr' },
    gap: tokens.spacing.md,
    width: '100%',
  },
  showcaseCard: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.surface,
    boxShadow: tokens.shadow.md,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
    transitionDuration: '300ms',
  },
  showcaseLabel: {
    margin: 0,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: tokens.color.textMuted,
  },
  showcaseRow: {
    display: 'flex',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  btnPrimary: {
    paddingInline: tokens.spacing.md,
    paddingBlock: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 0,
    backgroundColor: tokens.color.accent,
    color: 'white',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  btnOutline: {
    paddingInline: tokens.spacing.md,
    paddingBlock: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.accent,
    backgroundColor: 'transparent',
    color: tokens.color.accent,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  btnGhost: {
    paddingInline: tokens.spacing.md,
    paddingBlock: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.color.accentSoft,
    },
    color: tokens.color.accent,
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  badge: {
    paddingInline: '0.6rem',
    paddingBlock: '0.2rem',
    borderRadius: tokens.radius.full,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  badgeAccent: {
    backgroundColor: tokens.color.accentSoft,
    color: tokens.color.accent,
    borderColor: tokens.color.accentBorder,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(22,163,74,0.08)',
    color: tokens.color.success,
    borderColor: 'rgba(22,163,74,0.25)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(217,119,6,0.08)',
    color: tokens.color.warning,
    borderColor: 'rgba(217,119,6,0.25)',
  },
  badgeError: {
    backgroundColor: 'rgba(220,38,38,0.08)',
    color: tokens.color.error,
    borderColor: 'rgba(220,38,38,0.25)',
  },
  input: {
    paddingInline: tokens.spacing.md,
    paddingBlock: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.border,
    backgroundColor: tokens.color.surface,
    color: tokens.color.textPrimary,
    fontSize: '0.9rem',
    fontFamily: FONT_SANS,
    outline: 'none',
    width: '100%',
  },
  innerCard: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.surface,
    boxShadow: tokens.shadow.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.border,
    transitionDuration: '300ms',
  },
  innerCardTitle: {
    margin: 0,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: tokens.color.accent,
    fontFamily: FONT_MONO,
  },
  innerCardBody: {
    margin: 0,
    fontSize: '0.8rem',
    lineHeight: 1.5,
    color: tokens.color.textSecondary,
  },
  swatchGrid: {
    display: 'flex',
    gap: tokens.spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  swatchItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  swatchCircle: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.full,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: tokens.color.border,
    transitionDuration: '300ms',
    transform: { default: null, ':hover': 'scale(1.15)' },
  },
  swatchLabel: {
    fontSize: '0.65rem',
    fontFamily: FONT_MONO,
    color: tokens.color.textMuted,
  },
  swAccent: {
    backgroundColor: tokens.color.accent,
    borderColor: tokens.color.accentBorder,
  },
  swAccentSoft: { backgroundColor: tokens.color.accentSoft },
  swBg: { backgroundColor: tokens.color.bg },
  swSurface: { backgroundColor: tokens.color.surface },
  swSuccess: {
    backgroundColor: tokens.color.success,
    borderColor: 'rgba(22,163,74,0.25)',
  },
  swWarning: {
    backgroundColor: tokens.color.warning,
    borderColor: 'rgba(217,119,6,0.25)',
  },
  swError: {
    backgroundColor: tokens.color.error,
    borderColor: 'rgba(220,38,38,0.25)',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(3, 1fr)', [MOBILE]: '1fr' },
    gap: tokens.spacing.md,
    width: '100%',
  },
  howCard: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.surface,
    boxShadow: tokens.shadow.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.color.border,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
    transitionDuration: '300ms',
  },
  howStep: {
    width: 28,
    height: 28,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.color.accent,
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transitionDuration: '300ms',
  },
  howTitle: { margin: 0, fontSize: '0.85rem', fontWeight: 600 },
  howPre: {
    margin: 0,
    padding: tokens.spacing.sm,
    backgroundColor: {
      default: 'rgba(0,0,0,0.03)',
      [DARK]: 'rgba(255,255,255,0.05)',
    },
    borderRadius: tokens.radius.sm,
    fontSize: '0.65rem',
    fontFamily: FONT_MONO,
    lineHeight: 1.45,
    overflow: 'auto',
    color: tokens.color.textSecondary,
  },
  code: {
    fontFamily: FONT_MONO,
    fontSize: '0.85em',
    backgroundColor: {
      default: 'rgba(0,0,0,0.04)',
      [DARK]: 'rgba(255,255,255,0.08)',
    },
    paddingInline: '0.3em',
    paddingBlock: '0.1em',
    borderRadius: '4px',
  },
});

// ─── Page Component ──────────────────────────────────────────
export default function DefineThemeDemo() {
  const [themeIndex, setThemeIndex] = useState(0);

  return (
    <main {...stylex.props(s.page, THEME_LIST[themeIndex].theme)}>
      <header {...stylex.props(s.header)}>
        <a {...stylex.props(s.backLink)} href="/theming-demos">
          ← Back to Theming Demos
        </a>
        <h1 {...stylex.props(s.title)}>
          <code {...stylex.props(s.titleCode)}>defineTheme</code>{' '}
          <span {...stylex.props(s.titleAccent)}>Demo</span>
        </h1>
        <p {...stylex.props(s.subtitle)}>
          Co-locate tokens and theme variants in a single{' '}
          <code {...stylex.props(s.code)}>stylex.defineTheme()</code> call.
        </p>
      </header>

      <nav {...stylex.props(s.picker)}>
        <span {...stylex.props(s.pickerLabel)}>Theme</span>
        <div {...stylex.props(s.pickerRow)}>
          {THEME_LIST.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setThemeIndex(i)}
              {...stylex.props(
                s.pickerBtn,
                i === themeIndex && s.pickerBtnActive,
              )}
            >
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </nav>

      <section {...stylex.props(s.section)}>
        <div {...stylex.props(s.compareGrid)}>
          <div {...stylex.props(s.compareCard, s.compareCardAfter)}>
            <p {...stylex.props(s.compareLabel, s.compareLabelAfter)}>USAGE</p>
            <pre {...stylex.props(s.pre)}>
              {`// tokens.stylex.ts — co-located definition
export const { tokens, themes } =
  stylex.defineTheme({
    tokens: {
      color: { accent: '#2563eb' },
    },
    themes: {
      dark: {
        color: { accent: '#60a5fa' },
      },
    },
  });`}
            </pre>
          </div>
        </div>
      </section>

      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>🧩 Component Showcase</h2>
        <p {...stylex.props(s.sectionDesc)}>
          All components reference{' '}
          <code {...stylex.props(s.code)}>tokens.*</code> — switch themes and
          watch everything update
        </p>
        <div {...stylex.props(s.showcaseGrid)}>
          <div {...stylex.props(s.showcaseCard)}>
            <p {...stylex.props(s.showcaseLabel)}>Buttons</p>
            <div {...stylex.props(s.showcaseRow)}>
              <button {...stylex.props(s.btnPrimary)}>Primary</button>
              <button {...stylex.props(s.btnOutline)}>Outline</button>
              <button {...stylex.props(s.btnGhost)}>Ghost</button>
            </div>
          </div>
          <div {...stylex.props(s.showcaseCard)}>
            <p {...stylex.props(s.showcaseLabel)}>Badges</p>
            <div {...stylex.props(s.showcaseRow)}>
              <span {...stylex.props(s.badge, s.badgeAccent)}>Feature</span>
              <span {...stylex.props(s.badge, s.badgeSuccess)}>Active</span>
              <span {...stylex.props(s.badge, s.badgeWarning)}>Beta</span>
              <span {...stylex.props(s.badge, s.badgeError)}>Deprecated</span>
            </div>
          </div>
          <div {...stylex.props(s.showcaseCard)}>
            <p {...stylex.props(s.showcaseLabel)}>Input</p>
            <input
              {...stylex.props(s.input)}
              placeholder="Type something..."
              readOnly
            />
          </div>
          <div {...stylex.props(s.showcaseCard)}>
            <p {...stylex.props(s.showcaseLabel)}>Elevated Card</p>
            <div {...stylex.props(s.innerCard)}>
              <p {...stylex.props(s.innerCardTitle)}>tokens.shadow.lg</p>
              <p {...stylex.props(s.innerCardBody)}>
                Shadow, surface, and radius all adapt to the theme.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>🎨 Live Token Swatches</h2>
        <div {...stylex.props(s.swatchGrid)}>
          {(
            [
              ['accent', s.swAccent],
              ['accentSoft', s.swAccentSoft],
              ['bg', s.swBg],
              ['surface', s.swSurface],
              ['success', s.swSuccess],
              ['warning', s.swWarning],
              ['error', s.swError],
            ] as const
          ).map(([label, style]) => (
            <div key={label} {...stylex.props(s.swatchItem)}>
              <div {...stylex.props(s.swatchCircle, style)} />
              <span {...stylex.props(s.swatchLabel)}>color.{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>🔧 Under the Hood</h2>
        <div {...stylex.props(s.howGrid)}>
          {[
            {
              step: '1',
              title: 'You write',
              code: 'export const { tokens, themes } =\n  stylex.defineTheme({\n    tokens: {...},\n    themes: {...}\n  });',
            },
            {
              step: '2',
              title: 'Compiler expands to',
              code: 'const tokens =\n  defineVarsNested(config.tokens);\nconst themes = {\n  dark: createThemeNested(\n    tokens, config.themes.dark\n  )\n};',
            },
            {
              step: '3',
              title: 'Output becomes',
              code: 'export const tokens = {\n  color: { accent: "var(--x1a)" },\n  __varGroupHash__: "xHash"\n};\nexport const themes = {\n  dark: { xHash: "xOvr xHash",\n    $$css: true }\n};',
            },
          ].map((item) => (
            <div key={item.step} {...stylex.props(s.howCard)}>
              <div {...stylex.props(s.howStep)}>{item.step}</div>
              <p {...stylex.props(s.howTitle)}>{item.title}</p>
              <pre {...stylex.props(s.howPre)}>{item.code}</pre>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
