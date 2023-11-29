/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import Layout from '@theme/Layout';
import StylexAnimatedLogo from '@site/components/StylexAnimatedLogo';
import Link from '@docusaurus/Link';
import {ZStack, ZStackItem} from '../../components/ZStack';

export default function Home() {
  return (
    <Layout>
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
            <Link {...stylex.props(styles.cta)} to="/docs/learn/">
              Get Started
            </Link>
            <Link
              {...stylex.props(styles.cta, styles.ctaBlue)}
              to="/docs/learn/thinking-in-stylex/">
              Thinking in StyleX
            </Link>
          </section>
        </section>
      </main>
    </Layout>
  );
}

const CTA_BREAK = '@media (max-width: 360px)';

const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--bg1)',
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
    marginBottom: 24,
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
    alignItems: 'center',
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
  cta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontWeight: 'bold',
    color: {
      default: 'white',
      ':hover': 'white',
    },
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    width: {
      default: null,
      [CTA_BREAK]: '100%',
    },
    backgroundColor: 'hsl(var(--pink-h), var(--pink-s), var(--pink-l))',
    paddingBlock: '0.75rem',
    paddingInline: '2rem',
    boxShadow: {
      default:
        '0 0 2px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.35)',
      ':hover':
        '0 0 10px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.75)',
    },
    scale: {
      default: '1',
      ':hover': '1.02',
      ':active': '0.98',
    },
    transitionProperty: 'scale, boxShadow',
    transitionDuration: {
      default: '0.2s',
      ':active': '0.1s',
    },
  },
  ctaBlue: {
    backgroundColor: 'hsl(var(--cyan-h), var(--cyan-s), var(--cyan-l))',
    boxShadow: {
      default:
        '0 0 2px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.35)',
      ':hover':
        '0 0 10px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.75)',
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
    // eslint-disable-next-line @stylexjs/valid-styles
    WebkitBackgroundClip: 'text',
    // eslint-disable-next-line @stylexjs/valid-styles
    WebkitTextFillColor: 'transparent',
    // eslint-disable-next-line @stylexjs/valid-styles
    backgroundClip: 'text',
    // eslint-disable-next-line @stylexjs/valid-styles
    textFillColor: 'transparent',
  },
  threads: {},
});
