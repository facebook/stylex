/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import stylex from '@stylexjs/stylex';
import Card from './Card';
import { globalTokens as $, spacing, text } from './globalTokens.stylex';

const MEDIA_MOBILE = '@media (max-width: 700px)' as const;
const MEDIA_TABLET =
  '@media (min-width: 701px) and (max-width: 1120px)' as const;

const style = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '100vh',
    paddingTop: spacing.xxl,
    paddingBottom: {
      default: spacing.xxl,
      [MEDIA_MOBILE]: spacing.md,
    },
  },
  hero: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    fontSize: text.h1,
    lineHeight: 1,
    fontFamily: $.fontSans,
    fontWeight: 400,
    textAlign: 'center',
    display: 'flex',
    gap: spacing.md,
    whiteSpace: 'nowrap',
    flexDirection: {
      default: 'row',
      [MEDIA_MOBILE]: 'column',
    },
  },
  emoji: {
    position: 'relative',
    fontFamily: 'sans-serif',
    top: {
      default: 0,
      [MEDIA_MOBILE]: spacing.xxxs,
    },
  },
  description: {
    display: 'inherit',
    justifyContent: 'inherit',
    alignItems: 'inherit',
    fontSize: text.sm,
    maxWidth: $.maxWidth,
    width: '100%',
    zIndex: 2,
    fontFamily: $.fontMono,
  },
  descLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    padding: { [MEDIA_MOBILE]: spacing.sm },
  },
  descP: {
    display: { [MEDIA_MOBILE]: 'flex' },
    position: {
      default: 'relative',
      [MEDIA_MOBILE]: 'fixed',
    },
    justifyContent: { [MEDIA_MOBILE]: 'center' },
    alignItems: { [MEDIA_MOBILE]: 'center' },
    width: { [MEDIA_MOBILE]: '100%' },
    margin: 0,
    paddingInline: spacing.sm,
    paddingTop: {
      default: spacing.sm,
      [MEDIA_MOBILE]: spacing.lg,
    },
    paddingBottom: {
      default: spacing.sm,
      [MEDIA_MOBILE]: spacing.md,
    },
    backgroundColor: $.calloutRGB50,
    backgroundImage: {
      default: null,
      [MEDIA_MOBILE]: `linear-gradient(to bottom, ${$.bgStartRGB}, ${$.calloutRGB50})`,
    },
    borderWidth: {
      default: '1px',
      [MEDIA_MOBILE]: '0',
    },
    borderStyle: 'solid',
    borderColor: `rgba(${$.calloutBorderR}, ${$.calloutBorderG}, ${$.calloutBorderB}, 0.3)`,
    borderBottomColor: {
      default: null,
      [MEDIA_MOBILE]: `rgba(${$.calloutBorderR}, ${$.calloutBorderG}, ${$.calloutBorderB}, 0.25)`,
    },
    borderRadius: {
      default: spacing.xs,
      [MEDIA_MOBILE]: 0,
    },
    inset: { [MEDIA_MOBILE]: '0 0 auto' },
  },
  code: {
    fontWeight: 700,
    fontFamily: $.fontMono,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(4, minmax(25%, auto))',
      [MEDIA_MOBILE]: '1fr',
      [MEDIA_TABLET]: 'repeat(2, 50%)',
    },
    width: $.maxWidth,
    maxWidth: {
      default: '100%',
      [MEDIA_MOBILE]: 320,
    },
    textAlign: { [MEDIA_MOBILE]: 'center' },
  },
});

const HOMEPAGE = 'https://stylexjs.com';

export default function Home() {
  return (
    <main {...stylex.props(style.main)}>
      <div {...stylex.props(style.description)}>
        <p {...stylex.props(style.descP)}>
          Get started by editing&nbsp;
          <code {...stylex.props(style.code)}>app/page.tsx</code>
        </p>
      </div>
      <div {...stylex.props(style.hero)}>
        <h1 {...stylex.props(style.h1)}>
          Next.js App Dir<span {...stylex.props(style.emoji)}>♥️</span>️StyleX
        </h1>
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
