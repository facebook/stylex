/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Dedicated demo route for the nested design-token APIs.
 *   - unstable_defineVarsNested  (tokens.stylex.ts)
 *   - unstable_defineConstsNested (tokens.stylex.ts)
 *   - unstable_createThemeNested  (tokens.stylex.ts)
 */

'use client';

import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, consts, sunsetTheme, forestTheme } from './tokens.stylex';
import CrossFileSection from './CrossFileSection';

const DARK = '@media (prefers-color-scheme: dark)';
const MOBILE = '@media (max-width: 700px)';

const THEMES = [
  { name: '🌊 Ocean', theme: null },
  { name: '🌅 Sunset', theme: sunsetTheme },
  { name: '🌲 Forest', theme: forestTheme },
] as const;

export default function NestedDemoPage() {
  const [themeIndex, setThemeIndex] = useState(0);

  return (
    <main {...stylex.props(s.main, THEMES[themeIndex].theme)}>
      {/* ── Hero ────────────────────────────────────── */}
      <div {...stylex.props(s.hero)}>
        <a {...stylex.props(s.backLink)} href="/theming-demos">
          ← Back to Theming Demos
        </a>
        <h1 {...stylex.props(s.h1)}>
          Nested <span {...stylex.props(s.plus)}>APIs</span> Demo
        </h1>
        <p {...stylex.props(s.subtitle)}>
          A showcase of{' '}
          <code {...stylex.props(s.code)}>unstable_defineVarsNested</code>,{' '}
          <code {...stylex.props(s.code)}>unstable_defineConstsNested</code>,
          and <code {...stylex.props(s.code)}>unstable_createThemeNested</code>
        </p>
      </div>

      {/* ── Theme Picker ───────────────────────────── */}
      <div {...stylex.props(s.themePicker)}>
        <span {...stylex.props(s.themeLabel)}>Theme</span>
        <div {...stylex.props(s.themeRow)}>
          {THEMES.map((t, i) => (
            <button
              key={t.name}
              {...stylex.props(
                s.themeButton,
                i === themeIndex && s.themeButtonActive,
              )}
              onClick={() => setThemeIndex(i)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Badges (same-file consumption) ─────────── */}
      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>
          <span {...stylex.props(s.sectionIcon)}>🏷️</span>
          Themed Badges
        </h2>
        <p {...stylex.props(s.sectionDesc)}>
          Colors from <code {...stylex.props(s.code)}>tokens.badge.*</code>,
          sizing from <code {...stylex.props(s.code)}>consts.badge.*</code>
        </p>
        <div {...stylex.props(s.badgeRow)}>
          <span {...stylex.props(s.badgeBase, s.badgeInfo)}>Info</span>
          <span {...stylex.props(s.badgeBase, s.badgeSuccess)}>Success</span>
          <span {...stylex.props(s.badgeBase, s.badgeWarning)}>Warning</span>
          <span {...stylex.props(s.badgeBase, s.badgeError)}>Error</span>
        </div>
      </section>

      {/* ── Surface Card (same-file consumption) ───── */}
      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>
          <span {...stylex.props(s.sectionIcon)}>🎨</span>
          Surface Tokens
        </h2>
        <p {...stylex.props(s.sectionDesc)}>
          Card background, shadow, and hover states from{' '}
          <code {...stylex.props(s.code)}>tokens.surface.*</code>
        </p>
        <div {...stylex.props(s.cardGrid)}>
          <div {...stylex.props(s.demoCard)}>
            <p {...stylex.props(s.cardLabel)}>surface.card</p>
            <p {...stylex.props(s.cardBody)}>
              Background and shadow adapt to the selected theme.
            </p>
          </div>
          <div {...stylex.props(s.demoCard, s.demoCardHover)}>
            <p {...stylex.props(s.cardLabel)}>surface.hover</p>
            <p {...stylex.props(s.cardBody)}>
              Hover tint applied as a background color.
            </p>
          </div>
          <div {...stylex.props(s.demoCard, s.demoCardAccent)}>
            <p {...stylex.props(s.cardLabel)}>accent.*</p>
            <p {...stylex.props(s.cardBody)}>
              Border and label colored with nested accent tokens.
            </p>
          </div>
        </div>
      </section>

      <CrossFileSection />

      {/* ── unstable_conditional (cond) ────────────── */}
      <section {...stylex.props(s.section)}>
        <p {...stylex.props(s.sectionDesc, s.leftAlign)}>
          Recommended: use the{' '}
          <code {...stylex.props(s.code)}>unstable_conditional()</code> wrapper
          for conditional CSS at-rules (
          <code {...stylex.props(s.code)}>@media</code>,{' '}
          <code {...stylex.props(s.code)}>@supports</code>) for type safety.
        </p>
        <div {...stylex.props(s.condCard)}>
          <pre {...stylex.props(s.condPre)}>
            {`import { unstable_conditional as cond }
  from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

accent: cond({
  default: '#2563eb',  // base value
  [DARK]: '#60a5fa',   // dark mode override
})`}
          </pre>
          <p {...stylex.props(s.condNote)}>
            With cond() compiler knows `default` is a conditional rule not a
            namespace
          </p>
        </div>
      </section>

      {/* ── API Reference Cards ────────────────────── */}
      <section {...stylex.props(s.section)}>
        <h2 {...stylex.props(s.sectionTitle)}>
          <span {...stylex.props(s.sectionIcon)}>📚</span>
          APIs Used
        </h2>
        <div {...stylex.props(s.apiGrid)}>
          {[
            {
              api: 'unstable_defineVarsNested',
              desc: 'Define nested CSS custom properties that can be themed at runtime.',
              file: 'tokens.stylex.ts',
            },
            {
              api: 'unstable_defineConstsNested',
              desc: 'Define nested compile-time constants that are inlined — zero runtime cost.',
              file: 'tokens.stylex.ts',
            },
            {
              api: 'unstable_createThemeNested',
              desc: 'Override nested token values for a subtree, just like createTheme.',
              file: 'tokens.stylex.ts',
            },
          ].map((item) => (
            <div key={item.api} {...stylex.props(s.apiCard)}>
              <code {...stylex.props(s.apiName)}>{item.api}</code>
              <p {...stylex.props(s.apiDesc)}>{item.desc}</p>
              <p {...stylex.props(s.apiFile)}>
                <code {...stylex.props(s.code)}>{item.file}</code>
              </p>
            </div>
          ))}
        </div>
      </section>

      <a {...stylex.props(s.demoLink)} href="/ds-demo">
        <span {...stylex.props(s.demoLinkIcon)}>🎨</span>
        <span>
          <strong>Design System Theming</strong>
          <br />
          <span {...stylex.props(s.demoLinkSub)}>
            Expressing the Primitives → Semantics → Themes three-tier design
            system architecture using the nested APIs
          </span>
        </span>
        <span {...stylex.props(s.demoLinkArrow)}>→</span>
      </a>
    </main>
  );
}

// ─── Styles (same-file nested token consumption) ─────────────
const s = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem',
    minHeight: '100vh',
    paddingTop: '4rem',
    paddingBottom: '4rem',
    paddingInline: '1.5rem',
    backgroundColor: tokens.surface.bg,
    color: tokens.text.primary,
    fontFamily: consts.font.sans,
    transitionProperty: 'background-color, color',
    transitionDuration: '300ms',
  },

  // Hero
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: 640,
    textAlign: 'center',
  },
  backLink: {
    fontSize: '0.875rem',
    color: tokens.accent.base,
    textDecoration: 'none',
    fontFamily: consts.font.sans,
    opacity: {
      default: 0.7,
      ':hover': 1,
    },
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
  },
  h1: {
    fontSize: {
      default: '2.75rem',
      [MOBILE]: '2rem',
    },
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  plus: {
    fontWeight: 300,
    color: tokens.accent.base,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  subtitle: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: tokens.text.secondary,
    maxWidth: '42ch',
    textWrap: 'balance',
    margin: 0,
  },

  // Theme Picker
  themePicker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  themeLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: tokens.accent.base,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  themeRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  themeButton: {
    paddingInline: '1rem',
    paddingBlock: '0.5rem',
    borderRadius: consts.radius.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.surface.divider,
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.surface.hover,
    },
    color: tokens.text.primary,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: consts.font.sans,
    transitionProperty: 'background-color, border-color',
    transitionDuration: '200ms',
  },
  themeButtonActive: {
    fontWeight: 600,
    borderColor: tokens.accent.base,
    backgroundColor: tokens.accent.light,
    color: tokens.accent.base,
  },

  // Design System demo link card
  demoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingInline: '1.5rem',
    paddingBlock: '1rem',
    borderRadius: consts.radius.lg,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: tokens.accent.base,
    backgroundColor: {
      default: tokens.accent.light,
      ':hover': tokens.accent.faded,
    },
    color: 'inherit',
    textDecoration: 'none',
    fontFamily: consts.font.sans,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    transitionProperty: 'background-color, border-color, transform',
    transitionDuration: '200ms',
    width: '100%',
    maxWidth: 640,
    transform: {
      default: null,
      ':hover': 'translateY(-2px)',
    },
  },
  demoLinkIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  demoLinkSub: {
    fontSize: '0.75rem',
    opacity: 0.6,
  },
  demoLinkArrow: {
    marginLeft: 'auto',
    fontSize: '1.25rem',
    color: tokens.accent.base,
    transitionProperty: 'transform',
    transitionDuration: '200ms',
  },

  // Section
  section: {
    width: '100%',
    maxWidth: 640,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sectionIcon: {
    fontSize: '1.25rem',
  },
  sectionDesc: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: 0,
    color: tokens.text.secondary,
  },
  leftAlign: {
    textAlign: 'left',
    width: '100%',
  },

  // Badges
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badgeBase: {
    borderRadius: consts.radius.pill,
    paddingInline: consts.badge.paddingInline,
    paddingBlock: consts.badge.paddingBlock,
    fontSize: consts.badge.fontSize,
    fontWeight: consts.badge.fontWeight,
    letterSpacing: consts.badge.letterSpacing,
    borderWidth: 1,
    borderStyle: 'solid',
    textTransform: 'uppercase',
  },
  badgeInfo: {
    backgroundColor: tokens.badge.info.bg,
    color: tokens.badge.info.text,
    borderColor: tokens.badge.info.border,
  },
  badgeSuccess: {
    backgroundColor: tokens.badge.success.bg,
    color: tokens.badge.success.text,
    borderColor: tokens.badge.success.border,
  },
  badgeWarning: {
    backgroundColor: tokens.badge.warning.bg,
    color: tokens.badge.warning.text,
    borderColor: tokens.badge.warning.border,
  },
  badgeError: {
    backgroundColor: tokens.badge.error.bg,
    color: tokens.badge.error.text,
    borderColor: tokens.badge.error.border,
  },

  // Demo cards
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, 1fr)',
      [MOBILE]: '1fr',
    },
    gap: '0.75rem',
    width: '100%',
  },
  demoCard: {
    padding: '1.25rem',
    borderRadius: consts.radius.lg,
    backgroundColor: tokens.surface.card,
    boxShadow: tokens.surface.cardShadow,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: '300ms',
  },
  demoCardHover: {
    backgroundColor: tokens.surface.hover,
  },
  demoCardAccent: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: tokens.accent.border,
  },
  cardLabel: {
    margin: 0,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: tokens.accent.base,
  },
  cardBody: {
    margin: 0,
    fontSize: '0.8rem',
    lineHeight: 1.5,
    color: tokens.text.secondary,
  },

  // API reference cards
  apiGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, 1fr)',
      [MOBILE]: '1fr',
    },
    gap: '0.75rem',
    width: '100%',
  },
  apiCard: {
    padding: '1.25rem',
    borderRadius: consts.radius.lg,
    backgroundColor: tokens.surface.card,
    boxShadow: tokens.surface.cardShadow,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.surface.divider,
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: '300ms',
  },
  apiName: {
    fontFamily: consts.font.mono,
    fontSize: '0.8rem',
    fontWeight: 600,
    color: tokens.accent.base,
  },
  apiDesc: {
    margin: 0,
    fontSize: '0.8rem',
    lineHeight: 1.5,
    color: tokens.text.secondary,
  },
  apiFile: {
    margin: 0,
    marginTop: 'auto',
    fontSize: '0.7rem',
    color: tokens.text.muted,
  },

  // cond() comparison
  condCompare: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr 1fr',
      [MOBILE]: '1fr',
    },
    gap: '0.75rem',
    width: '100%',
  },
  condCard: {
    padding: '1rem',
    borderRadius: consts.radius.lg,
    backgroundColor: tokens.surface.card,
    boxShadow: tokens.surface.cardShadow,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.surface.divider,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transitionProperty: 'background-color, box-shadow, border-color',
    transitionDuration: '300ms',
  },
  condCardRecommended: {
    borderColor: tokens.accent.base,
    borderWidth: 2,
  },
  condLabel: {
    margin: 0,
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: tokens.text.muted,
  },
  condLabelRecommended: {
    color: tokens.accent.base,
  },
  condPre: {
    margin: 0,
    padding: '0.75rem',
    backgroundColor: {
      default: 'rgba(0,0,0,0.03)',
      [DARK]: 'rgba(255,255,255,0.05)',
    },
    borderRadius: consts.radius.sm,
    fontSize: '0.72rem',
    fontFamily: consts.font.mono,
    lineHeight: 1.5,
    overflow: 'auto',
    color: tokens.text.primary,
  },
  condNote: {
    margin: 0,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    color: tokens.text.secondary,
    fontStyle: 'italic',
  },

  // Shared
  code: {
    fontFamily: consts.font.mono,
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
