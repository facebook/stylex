/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Link } from 'waku';
import StylexAnimatedLogo from '@/components/StylexAnimatedLogo';
import { ZStack, ZStackItem } from '@/components/ZStack';
import CtaButton from '@/components/CtaButton';
import { vars } from '../../theming/vars.stylex';

export default function Home() {
  return (
    <main {...stylex.props(styles.main)}>
      <section {...stylex.props(styles.hero)}>
        <h1 {...stylex.props(styles.title)}>
          <StylexAnimatedLogo style={styles.logo} />
        </h1>
        <h2 {...stylex.props(styles.subtitle)}>
          The
          <span {...stylex.props(styles.subtitleHighlight)}>
            {' '}
            styling system{' '}
          </span>{' '}
          that powers
          <br />
          <ZStack>
            <ZStackItem style={[styles.subtitleHighlight, styles.facebook]}>
              facebook.com
            </ZStackItem>
            <ZStackItem style={[styles.subtitleHighlight, styles.instagram]}>
              instagram.com
            </ZStackItem>
            <ZStackItem style={[styles.subtitleHighlight, styles.whatsapp]}>
              whatsapp.com
            </ZStackItem>
            <ZStackItem style={[styles.subtitleHighlight]}>
              threads.net
            </ZStackItem>
          </ZStack>
        </h2>
        <section {...stylex.props(styles.ctaSection)}>
          <CtaButton color="pink" to="/docs/learn/">
            Get Started
          </CtaButton>
          <CtaButton color="blue" to="/docs/learn/thinking-in-stylex/">
            Thinking in StyleX
          </CtaButton>
        </section>
      </section>
    </main>
  );
}

const CTA_BREAK = '@media (max-width: 385px)';

const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    '--color-fd-card-foreground': 'white',
  },
  hero: {
    paddingBlock: 50,
    minHeight: 'calc(60vh)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    position: 'relative',
    boxSizing: 'border-box',
    margin: 0,
    marginBottom: 19,
    paddingBlock: '5px',
    marginBlockStart: '-5px',
    overflow: 'hidden',
    zIndex: 0,
  },
  logo: {
    width: '100%',
    display: 'flex',
    position: 'relative',
    zIndex: 1,
  },
  subtitle: {
    margin: 0,
    paddingInline: 24,
    fontWeight: 400,
    textAlign: 'center',
    color: 'var(--fg1)',
    fontSize: 'clamp(1rem, 1rem + 2vw, 3rem)',
  },
  h3: {
    width: '100%',
    fontWeight: 400,
    fontSize: 'clamp(1rem, 0.8rem + 5vw, 2rem)',
    textAlign: 'center',
    opacity: 0.7,
  },
  ctaSection: {
    alignItems: 'stretch',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBlock: {
      default: '4rem',
      [CTA_BREAK]: '2rem',
    },
    flexDirection: {
      default: 'row',
      [CTA_BREAK]: 'column',
    },
  },
  subtitleHighlight: {
    fontWeight: 700,
  },
  facebook: {
    color: '#0866FF',
  },
  whatsapp: {
    color: 'rgb(30, 169, 82)',
  },
  instagram: {
    backgroundColor: '#d6249f',
    backgroundImage:
      'radial-gradient(circle at 30% 107%, #ddd477 0%, #ddd477 5%, #fd5949 45%,#d6249f 60%, #285AEB 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textFillColor: 'transparent',
  },
  threads: {},
});

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
