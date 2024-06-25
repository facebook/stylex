/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import Image from 'next/image';
import * as stylex from '@stylexjs/stylex';
import { tokens, vars } from '../styles/vars.stylex';

export default function Home() {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.description)}>
        <p {...stylex.props(styles.descriptionChild, styles.descriptionP)}>
          Get started by editing&nbsp;
          <code {...stylex.props(styles.code)}>src/app/page.tsx</code>
        </p>
        <div {...stylex.props(styles.descriptionChild, styles.descriptionDiv)}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            By{' '}
            <Image
              alt="Vercel Logo"
              {...stylex.props(styles.vercelLogo)}
              height={24}
              priority
              src="/vercel.svg"
              width={100}
            />
          </a>
        </div>
      </div>

      <div {...stylex.props(styles.center)}>
        <Image
          alt="Next.js Logo"
          {...stylex.props(styles.logo)}
          height={37}
          priority
          src="/next.svg"
          width={180}
        />
      </div>

      <div {...stylex.props(styles.grid)}>
        <a
          {...stylex.props(styles.card)}
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2 {...stylex.props(styles.cardH2)}>
            Docs <span {...stylex.props(styles.cardSpan)}>-&gt;</span>
          </h2>
          <p {...stylex.props(styles.cardP)}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          {...stylex.props(styles.card)}
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2 {...stylex.props(styles.cardH2)}>
            Learn <span {...stylex.props(styles.cardSpan)}>-&gt;</span>
          </h2>
          <p {...stylex.props(styles.cardP)}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          {...stylex.props(styles.card)}
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2 {...stylex.props(styles.cardH2)}>
            Templates <span {...stylex.props(styles.cardSpan)}>-&gt;</span>
          </h2>
          <p {...stylex.props(styles.cardP)}>
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          {...stylex.props(styles.card)}
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2 {...stylex.props(styles.cardH2)}>
            Deploy <span {...stylex.props(styles.cardSpan)}>-&gt;</span>
          </h2>
          <p {...stylex.props(styles.cardP)}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}

const HOVER = '@media (hover: hover) and (pointer: fine)';
const MOBILE = '@media (max-width: 700px)';
const TABLET = '@media (min-width: 701px) and (max-width: 1120px)';
const DARK = '@media (prefers-color-scheme: dark)';

const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6rem',
    minHeight: '100vh',
  },
  description: {
    display: 'inherit',
    justifyContent: 'inherit',
    alignItems: 'inherit',
    fontSize: {
      default: '0.85rem',
      [MOBILE]: '0.8rem',
    },
    maxWidth: vars.maxWidth,
    width: '100%',
    zIndex: 2,
    fontFamily: vars.fontMono,
  },
  descriptionA: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    padding: {
      default: null,
      [MOBILE]: '1rem',
    },
  },
  descriptionChild: {
    display: {
      default: null,
      [MOBILE]: 'flex',
    },
    justifyContent: 'center',
    position: {
      default: 'relative',
      [MOBILE]: 'fixed',
    },
    width: {
      default: null,
      [MOBILE]: '100%',
    },
  },
  descriptionP: {
    alignItems: 'center',
    inset: '0 0 auto',
    paddingTop: {
      default: null,
      [MOBILE]: '2rem',
    },
    paddingBottom: {
      default: null,
      [MOBILE]: '1.4rem',
    },
    paddingInline: {
      default: null,
      [MOBILE]: '1rem',
    },
    margin: 0,
    padding: '1rem',
    backgroundColor: `rgba(${vars.calloutRGB}, 0.5)`,
    backgroundImage: {
      default: null,
      [MOBILE]: `linear-gradient(to bottom, rgba(${vars.backgroundStartRGB}, 1), rgba(${vars.calloutRGB}, 0.5))`,
    },
    borderWidth: 1,
    backgroundClip: {
      default: null,
      [MOBILE]: 'padding-box',
    },
    backdropFilter: {
      default: null,
      [MOBILE]: 'blur(24px)',
    },
    borderStyle: 'solid',
    borderColor: `rgba(${vars.calloutBorderRGB}, 0.3)`,
    borderBottomColor: {
      default: null,
      [MOBILE]: `rgba(${vars.calloutBorderRGB}, 0.25)`,
    },
    borderRadius: {
      default: vars.borderRadius,
      [MOBILE]: 0,
    },
  },
  descriptionDiv: {
    alignItems: 'flex-end',
    pointerEvents: {
      default: null,
      [MOBILE]: 'none',
    },
    top: {
      default: null,
      [MOBILE]: 'auto',
    },
    bottom: 0,
    insetInline: 0,
    padding: {
      default: null,
      [MOBILE]: '2rem',
    },
    height: {
      default: null,
      [MOBILE]: 200,
    },
    backgroundImage: {
      default: null,
      [MOBILE]: `linear-gradient(to bottom, transparent 0%, rgb(${vars.backgroundEndRGB}) 40%)`,
    },
    zIndex: {
      default: null,
      [MOBILE]: 1,
    },
  },
  content: {
    padding: {
      default: null,
      [MOBILE]: '4rem',
    },
  },
  code: {
    fontWeight: 700,
    fontFamily: vars.fontMono,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(4, minmax(25%, auto))',
      [MOBILE]: '1fr',
      [TABLET]: 'repeat(2, 50%)',
    },
    maxWidth: {
      default: '100%',
      [MOBILE]: 320,
    },
    width: vars.maxWidth,
    marginBottom: {
      default: null,
      [MOBILE]: 120,
    },
    textAlign: {
      default: null,
      [MOBILE]: 'center',
    },
  },
  card: {
    paddingBlock: '1rem',
    paddingInline: {
      default: '1.2rem',
      [MOBILE]: '2.5rem',
    },
    borderRadius: vars.borderRadius,
    backgroundColor: {
      default: `rgba(${vars.cardRGB}, 0)`,
      [HOVER]: {
        default: null,
        ':hover': `rgba(${vars.cardRGB}, 0.1)`,
      },
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: `rgba(${vars.cardBorderRGB}, 0)`,
      [HOVER]: {
        default: null,
        ':hover': `rgba(${vars.cardBorderRGB}, 0.15)`,
      },
    },
    [tokens.arrowTransform]: {
      default: 'translateX(0)',
      [HOVER]: {
        default: null,
        ':hover': 'translateX(4px)',
      },
    },
    transitionProperty: 'background, border',
    transitionDuration: '200ms',
  },
  cardSpan: {
    display: 'inline-block',
    transitionProperty: 'transform',
    transitionDuration: '200ms',
    transform: {
      default: tokens.arrowTransform,
      '@media (prefers-reduced-motion)': 'none',
    },
    // color: 'red',
  },
  cardH2: {
    fontWeight: 600,
    marginBottom: {
      default: '0.7rem',
      [MOBILE]: '0.5rem',
    },
  },
  cardP: {
    margin: 0,
    opacity: 0.6,
    fontSize: '0.9rem',
    lineHeight: 1.5,
    maxWidth: '30ch',
    textWrap: 'balance',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingTop: {
      default: '4rem',
      [MOBILE]: '8rem',
    },
    paddingBottom: {
      default: '4rem',
      [MOBILE]: '6rem',
    },
    paddingInline: 0,
    '::before': {
      content: '',
      left: '50%',
      position: 'absolute',
      filter: 'blur(45px)',
      // eslint-disable-next-line @stylexjs/valid-styles
      transform: {
        default: 'translateZ(0)',
        [MOBILE]: 'none',
      },
      background: vars.secondaryGlow,
      borderRadius: '50%',
      width: 480,
      // eslint-disable-next-line @stylexjs/valid-styles
      height: {
        default: 360,
        [MOBILE]: 300,
      },
      marginLeft: -400,
    },
    '::after': {
      content: '',
      left: '50%',
      position: 'absolute',
      filter: 'blur(45px)',
      transform: 'translateZ(0)',
      background: vars.primaryGlow,
      width: 240,
      height: 180,
      zIndex: -1,
    },
  },
  logo: {
    position: 'relative',
    filter: {
      default: null,
      [DARK]: 'invert(1) drop-shadow(0 0 0.3rem #ffffff70)',
    },
  },
  vercelLogo: {
    filter: {
      default: null,
      [DARK]: 'invert(1)',
    },
  },
});
