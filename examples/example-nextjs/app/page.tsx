/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use client';

import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import Card from '@/components/Card';
import {
  globalTokens as $,
  spacing,
  text,
  colors,
} from './globalTokens.stylex';
import InteractiveCard, { THEMES } from './InteractiveCard';

const HOMEPAGE = 'https://stylexjs.com';

export default function Home() {
  const [themeIndex, setThemeIndex] = useState(2);

  return (
    <main {...stylex.props(style.main, THEMES[themeIndex].theme)}>
      <div {...stylex.props(style.hero)}>
        <h1 {...stylex.props(style.h1)}>
          Next.js <span {...stylex.props(style.plus)}>+</span> StyleX
        </h1>
        <p {...stylex.props(style.subtitle)}>
          The expressive styling system for ambitious interfaces
        </p>
        <InteractiveCard
          onThemeChange={setThemeIndex}
          themeIndex={themeIndex}
        />
      </div>

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
