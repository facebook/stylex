/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as stylex from '@stylexjs/stylex';
import {
  globalTokens as $,
  spacing,
  text,
  colors,
} from '../globalTokens.stylex';

const DARK = '@media (prefers-color-scheme: dark)' as const;
const MOBILE = '@media (max-width: 700px)' as const;

const DEMOS = [
  {
    href: '/nested-demo',
    icon: '✨',
    title: 'Nested APIs Demo',
    subtitle: 'unstable_defineVarsNested · unstable_defineConstsNested · unstable_createThemeNested',
    description:
      'Define design tokens as nested objects instead of flat key-value pairs. ' +
      'The compiler flattens them into the same CSS — zero performance cost. ' +
      'Includes theme switching, same-file consumption, and cross-file import.',
  },
  {
    href: '/ds-demo',
    icon: '🎨',
    title: 'Design System Theming',
    subtitle: 'Primitives → Semantics → Themes (three-tier architecture)',
    description:
      'Express three-tier token architecture natively in StyleX. ' +
      'Primitives (defineConstsNested) feed into semantic tokens (defineVarsNested) ' +
      'which are overridden by themes (createThemeNested). Switch themes to re-skin everything.',
  },
  {
    href: '/define-theme-demo',
    icon: '🧩',
    title: 'defineTheme() Demo',
    subtitle: 'Unified API for co-locating tokens and theme variants',
    description:
      'A single defineTheme() call that bundles token definitions ' +
      'and theme variants together. Built on top of the nested primitives — ' +
      'sugar that expands to defineVarsNested + createThemeNested.',
  },
];

export default function DemosPage() {
  return (
    <main {...stylex.props(s.page)}>
      <header {...stylex.props(s.header)}>
        <a {...stylex.props(s.backLink)} href="/">
          ← Back to main
        </a>
        <h1 {...stylex.props(s.title)}>
          Theming <span {...stylex.props(s.titleAccent)}>Demos</span>
        </h1>
        <p {...stylex.props(s.subtitle)}>
          Experimental APIs for nested design tokens in StyleX.
          Define hierarchical token structures, compose themes across packages,
          and let the compiler flatten everything to optimized CSS.
        </p>
      </header>

      <div {...stylex.props(s.grid)}>
        {DEMOS.map((demo) => (
          <a key={demo.href} {...stylex.props(s.card)} href={demo.href}>
            <div {...stylex.props(s.cardHeader)}>
              <span {...stylex.props(s.cardIcon)}>{demo.icon}</span>
              <div {...stylex.props(s.cardTitleGroup)}>
                <h2 {...stylex.props(s.cardTitle)}>{demo.title}</h2>
                <p {...stylex.props(s.cardSubtitle)}>{demo.subtitle}</p>
              </div>
              <span {...stylex.props(s.cardArrow)}>→</span>
            </div>
            <p {...stylex.props(s.cardDesc)}>{demo.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}

const s = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xxl,
    minHeight: '100vh',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    paddingInline: spacing.lg,
    backgroundColor: $.surfaceBg,
    color: `rgba(${$.foregroundR}, ${$.foregroundG}, ${$.foregroundB}, 1)`,
    fontFamily: $.fontSans,
  },

  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    textAlign: 'center',
    maxWidth: 640,
  },
  backLink: {
    fontSize: text.sm,
    color: colors.accent,
    textDecoration: 'none',
    opacity: { default: 0.7, ':hover': 1 },
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
  },
  title: {
    fontSize: { default: text.h1, [MOBILE]: text.h2 },
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    margin: 0,
  },
  titleAccent: {
    color: colors.accent,
  },
  subtitle: {
    fontSize: text.p,
    lineHeight: 1.6,
    color: { default: colors.gray5, [DARK]: colors.gray6 },
    margin: 0,
    textWrap: 'balance',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
    maxWidth: 640,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    paddingInline: spacing.lg,
    paddingBlock: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.accent,
    backgroundColor: {
      default: colors.accentLight,
      ':hover': colors.accentFaded,
    },
    color: 'inherit',
    textDecoration: 'none',
    transitionProperty: 'background-color, border-color, transform, box-shadow',
    transitionDuration: '200ms',
    transform: {
      default: null,
      ':hover': 'translateY(-2px)',
    },
    boxShadow: {
      default: 'none',
      ':hover': '0 4px 16px rgba(0, 0, 0, 0.08)',
    },
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    fontSize: text.h4,
    flexShrink: 0,
  },
  cardTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    flex: 1,
  },
  cardTitle: {
    margin: 0,
    fontSize: text.h5,
    fontWeight: 600,
  },
  cardSubtitle: {
    margin: 0,
    fontSize: text.xs,
    opacity: 0.6,
    fontFamily: $.fontMono,
  },
  cardArrow: {
    marginLeft: 'auto',
    fontSize: text.h5,
    color: colors.accent,
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: '200ms',
  },
  cardDesc: {
    margin: 0,
    fontSize: text.sm,
    lineHeight: 1.6,
    opacity: 0.7,
  },

});
