/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Playground } from '@/components/Playground/DynamicPlayground';
import Footer from '@/components/Footer';

export default function PlaygroundPage() {
  return (
    <>
      <title>Playground | StyleX</title>
      <link rel="icon" href="/img/favicon.svg" type="image/svg+xml" />
      <main {...stylex.props(styles.main)}>
        <Playground />
      </main>
      <Footer />
    </>
  );
}

const CTA_BREAK = '@media (max-width: 385px)';

const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--color-fd-background)',
    color: 'var(--color-fd-foreground)',
    paddingTop: 8,
  },
  hero: {
    paddingBlock: 80,
    minHeight: 'calc(70vh)',
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
    marginBottom: 32,
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
    fontWeight: 200,
    textAlign: 'center',
    color: 'var(--color-fd-secondary-text)',
    fontSize: 'clamp(1rem, 1rem + 0.5vw, 1.5rem)',
  },
  ctaSection: {
    alignItems: 'stretch',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBlockStart: {
      default: '2.5rem',
      [CTA_BREAK]: '2rem',
    },
    flexDirection: {
      default: 'row',
      [CTA_BREAK]: 'column',
    },
  },
});

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
