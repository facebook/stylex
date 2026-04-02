/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use client';

import { useState, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import Card from '@/components/Card';
import {
  globalTokens as $,
  spacing,
  text,
  colors,
} from './globalTokens.stylex';
import InteractiveCard, { THEMES } from './InteractiveCard';
import { darkTheme, lightTheme } from './darkMode.stylex';

const HOMEPAGE = 'https://stylexjs.com';

export default function Home() {
  const [themeIndex, setThemeIndex] = useState(2);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <main
      {...stylex.props(
        style.main,
        THEMES[themeIndex].theme,
        isDark ? darkTheme : lightTheme,
      )}
    >
      <div {...stylex.props(style.hero)}>
        <h1 {...stylex.props(style.h1)}>
          Next.js <span {...stylex.props(style.plus)}>+</span> StyleX
        </h1>
        <p {...stylex.props(style.subtitle)}>
          The expressive styling system for ambitious interfaces
        </p>
        <InteractiveCard
          isDark={isDark}
          onDarkModeChange={setIsDark}
          onThemeChange={setThemeIndex}
          themeIndex={themeIndex}
        />
      </div>

      {/* Link to nested theming demos hub */}
      <a {...stylex.props(style.nestedLink)} href="/theming-demos">
        <span {...stylex.props(style.nestedLinkIcon)}>🎨</span>
        <span>
          <strong>Theming Demos</strong>
          <br />
          <span {...stylex.props(style.nestedLinkSub)}>
            Experimental APIs for expressing nested design tokens · Design system theming
          </span>
        </span>
        <span {...stylex.props(style.nestedLinkArrow)}>→</span>
      </a>

      <div {...stylex.props(style.grid)}>
        <Card
          body="Learn how to use StyleX to build UIs"
          href={`${HOMEPAGE}/docs/learn/`}
          title="Docs"
        />
        <Card
          body="Browse through the StyleX API reference"
          href={`${HOMEPAGE}/docs/api/`}
          title="API"
        />
        <Card
          body="Play with StyleX and look at the compile outputs"
          href={`${HOMEPAGE}/playground/`}
          title="Playground"
        />
        <Card
          body="Get started with a NextJS+StyleX project"
          href="https://github.com/nmn/nextjs-app-dir-stylex"
          title="Templates"
        />
      </div>
    </main>
  );
}

const MEDIA_MOBILE = '@media (max-width: 700px)' as const;
const MEDIA_TABLET =
  '@media (min-width: 701px) and (max-width: 1120px)' as const;
const DARK = '@media (prefers-color-scheme: dark)' as const;

const style = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxxl,
    minHeight: '100vh',
    paddingTop: spacing.xxxl,
    paddingBottom: {
      default: spacing.xxl,
      [MEDIA_MOBILE]: spacing.lg,
    },
    paddingInline: spacing.md,
    backgroundColor: $.surfaceBg,
    color: `rgba(${$.foregroundR}, ${$.foregroundG}, ${$.foregroundB}, 1)`,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    width: '100%',
    maxWidth: 480,
  },
  h1: {
    fontSize: text.h1,
    lineHeight: 1,
    fontFamily: $.fontSans,
    fontWeight: 700,
    textAlign: 'center',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
    flexDirection: {
      default: 'row',
      [MEDIA_MOBILE]: 'column',
    },
  },
  plus: {
    fontWeight: 300,
    color: colors.accent,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  subtitle: {
    fontSize: text.p,
    lineHeight: 1.6,
    fontFamily: $.fontSans,
    textAlign: 'center',
    color: {
      default: colors.gray5,
      [DARK]: colors.gray6,
    },
    maxWidth: '36ch',
    textWrap: 'balance',
  },
  nestedLink: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
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
    fontFamily: $.fontSans,
    fontSize: text.sm,
    lineHeight: 1.4,
    transitionProperty: 'background-color, border-color, transform',
    transitionDuration: '200ms',
    width: '100%',
    maxWidth: 480,
    transform: {
      default: null,
      ':hover': 'translateY(-2px)',
    },
  },
  nestedLinkIcon: {
    fontSize: text.h4,
    flexShrink: 0,
  },
  nestedLinkSub: {
    fontSize: text.xs,
    opacity: 0.6,
  },
  nestedLinkArrow: {
    marginLeft: 'auto',
    fontSize: text.h5,
    color: colors.accent,
    transitionProperty: 'transform',
    transitionDuration: '200ms',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(4, minmax(25%, auto))',
      [MEDIA_MOBILE]: '1fr',
      [MEDIA_TABLET]: 'repeat(2, 50%)',
    },
    gap: spacing.sm,
    width: $.maxWidth,
    maxWidth: {
      default: '100%',
      [MEDIA_MOBILE]: 320,
    },
    textAlign: { [MEDIA_MOBILE]: 'center' },
  },
});
