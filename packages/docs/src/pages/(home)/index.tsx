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
      <title>StyleX</title>
      <link href="/img/favicon.svg" rel="icon" type="image/svg+xml" />
      <main {...stylex.props(styles.main)}>
        <section {...stylex.props(styles.hero)}>
          <h1 {...stylex.props(styles.title)}>
            <StylexAnimatedLogo style={styles.logo} />
          </h1>
          <p {...stylex.props(styles.subtitle)}>
            The <TypingWord /> <br {...stylex.props(styles.mobileBreak)} />
            styling system for <br {...stylex.props(styles.tabletBreak)} />{' '}
            ambitious interfaces
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${vars['--color-fd-background']}`,
    color: `${vars['--color-fd-foreground']}`,
    padding: 32,
    minHeight: 'calc(100vh - 56px)',
  },
  hero: {
    minHeight: 'calc(70vh)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  title: {
    position: 'relative',
    boxSizing: 'border-box',
    margin: 0,
    paddingInline: 32,
    paddingBlock: '5px',
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
    fontWeight: 200,
    textAlign: 'center',
    color: `${vars['--color-fd-foreground']}`,
    fontSize: 'clamp(1.2rem, 1.2rem + 1vw, 2rem)',
  },
  ctaSpacer: {
    flexGrow: 1,
    maxHeight: 64,
  },
  ctaSection: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: {
      default: 'repeat(2, 1fr)',
      [CTA_BREAK]: '1fr',
    },
    flexDirection: {
      default: 'row',
      [CTA_BREAK]: 'column',
    },
  },
  mobileBreak: {
    display: {
      default: 'none',
      [CTA_BREAK]: 'block',
    },
  },
  tabletBreak: {
    display: {
      default: 'none',
      [TABLET_BREAK]: 'block',
    },
  },
});

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
