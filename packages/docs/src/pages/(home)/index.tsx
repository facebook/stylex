/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';
import StylexAnimatedLogo from '@/components/StylexAnimatedLogo';
import CtaButton from '@/components/CtaButton';
import TypingWord from '@/components/TypingWord';
import Footer from '@/components/Footer';
import { vars } from '@/theming/vars.stylex';

export default function Home() {
  return (
    <>
      <title>StyleX — styling system for ambitious interfaces</title>
      <main {...stylex.props(styles.main)}>
        <section {...stylex.props(styles.hero)}>
          <h1 {...stylex.props(styles.title)}>
            <StylexAnimatedLogo style={styles.logo} />
          </h1>
          <p
            {...stylex.props(styles.subtitle)}
            aria-label="The expressive, type-safe, composable, predictable, and themeable styling system for ambitious interfaces"
          >
            <span aria-hidden="true">
              The <TypingWord />{' '}
              <br {...stylex.props(styles.mobileBreak)} aria-hidden="true" />
              styling system for{' '}
              <br {...stylex.props(styles.tabletBreak)} aria-hidden="true" />
              ambitious interfaces
            </span>
          </p>
          <div {...stylex.props(styles.ctaSpacer)} />
          <section {...stylex.props(styles.ctaSection)}>
            <CtaButton color="pink" to="/docs/learn/">
              Get Started
            </CtaButton>
            <CtaButton color="blue" to="/docs/learn/thinking-in-stylex/">
              Thinking in StyleX
            </CtaButton>
          </section>
          <div {...stylex.props(styles.ctaSpacer)} />
        </section>
      </main>
      <Footer />
    </>
  );
}

const TABLET_BREAK = '@media (max-width: 768px)';
const CTA_BREAK = '@media (max-width: 460px)';

const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 56px)',
    padding: 32,
    color: `${vars['--color-fd-foreground']}`,
    backgroundColor: `${vars['--color-fd-background']}`,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2vh',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '40vh',
  },
  title: {
    position: 'relative',
    zIndex: 0,
    boxSizing: 'border-box',
    paddingBlock: '5px',
    paddingInline: 32,
    margin: 0,
    overflow: 'hidden',
  },
  logo: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    width: '100%',
  },
  subtitle: {
    paddingInline: 24,
    margin: 0,
    fontSize: 'clamp(1.2rem, 1.2rem + 1vw, 2rem)',
    fontWeight: 200,
    color: `${vars['--color-fd-foreground']}`,
    textAlign: 'center',
  },
  ctaSpacer: {
    flexGrow: 1,
    maxHeight: 64,
  },
  ctaSection: {
    display: 'grid',
    flexDirection: {
      [CTA_BREAK]: 'column',
      default: 'row',
    },
    gridTemplateColumns: {
      [CTA_BREAK]: '1fr',
      default: 'repeat(2, 1fr)',
    },
    gap: '1rem',
  },
  mobileBreak: {
    display: {
      [CTA_BREAK]: 'block',
      default: 'none',
    },
  },
  tabletBreak: {
    display: {
      [TABLET_BREAK]: 'block',
      default: 'none',
    },
  },
});

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
