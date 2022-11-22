/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import stylex from '@stylexjs/stylex';
import Layout from '@theme/Layout';
import Logo from '@site/components/Logo';
// import StylexAnimatedLogo from '@site/components/StylexAnimatedLogo';
import CodeBlock from '@site/components/CodeBlock';

const STEP_1 = `import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8rem',
  }
});

`;

const STEP_2 = `<div className={stylex(styles.container)}>
  🎉
</div>
`;

export default function Home() {
  return (
    <Layout>
      <main className={stylex(styles.main)}>
        <section className={stylex(styles.hero)}>
          <h1 className={stylex(styles.title)}>
            <Logo xstyle={styles.logo} />
            {/* <StylexAnimatedLogo /> */}
          </h1>
          <h2 className={stylex(styles.subtitle)}>
            Super-fast{' '}
            <span className={stylex(styles.subtitleHighlight)}>
              atomic styles
            </span>
            ,
            <br />
            <span className={stylex(styles.subtitleHighlight)}>
              without
            </span>{' '}
            even thinking about it!
          </h2>
        </section>
        <section className={stylex(styles.getStarted)}>
          <h1 className={stylex(styles.sectionTitle)}>There's no step 3!</h1>
          <div className={stylex(styles.card)}>
            <h3 className={stylex(styles.cardTitle)}>Step 1</h3>
            <p className={stylex(styles.cardDescription)}>Define Your Styles</p>
            <div className={stylex(styles.codeContainer)}>
              <CodeBlock xstyle={styles.code}>{STEP_1}</CodeBlock>
            </div>
          </div>
          <div className={stylex(styles.card)}>
            <h3 className={stylex(styles.cardTitle)}>Step 2</h3>
            <p className={stylex(styles.cardDescription)}>Use Your Styles</p>
            <div className={stylex(styles.codeContainer)}>
              <CodeBlock xstyle={styles.code}>{STEP_2}</CodeBlock>
            </div>
          </div>
          <div className={stylex(styles.card)}>
            <h3 className={stylex(styles.cardTitle)}>Step 3</h3>
            <p className={stylex(styles.cardDescription)}>
              There is no step 3!
            </p>
            <div
              className={stylex(
                styles.codeContainer,
                styles.code,
                styles.codeEmpty,
              )}>
              🎉
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

const styles = stylex.create({
  main: {
    minHeight: '100vh',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--bg1)',
  },
  hero: {
    height: 'calc((100vh - 72px))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    boxSizing: 'border-box',
    margin: 0,
  },
  logo: {
    width: '100%',
    display: 'flex',
  },
  subtitle: {
    width: '100%',
    maxWidth: 1080,
    fontWeight: '300',
    textAlign: 'center',
    color: 'var(--fg2)',
    fontSize: '5rem',
    '@media (min-width: 900px) and (max-width: 1200px)': {
      fontSize: '4rem',
    },
    '@media (max-width: 900px)': {
      fontSize: '2.4rem',
    },
  },
  subtitleHighlight: {
    color: 'var(--pink)',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: '4rem',
    width: '100%',
    textAlign: 'center',
    marginVertical: '1rem',
    color: 'var(--fg1)',
  },
  getStarted: {
    backgroundColor: 'var(--bg2)',
    width: '100%',
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: 'var(--bg3)',
    borderRadius: 16,
    flexBasis: 0,
    flexGrow: 1,
    margin: 16,
    display: 'flex',
    flexDirection: 'column',
    '@media (max-width: 1100px)': {
      flexBasis: '100%',
    },
  },
  cardTitle: {
    fontSize: '1.8rem',
    margin: 0,
    fontWeight: '800',
    marginVertical: '1rem',
    paddingHorizontal: 24,
    color: 'var(--pink)',
  },
  cardDescription: {
    fontSize: '1.2rem',
    margin: 0,
    paddingHorizontal: 24,
  },
  codeContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: '1rem',
    backgroundColor: 'var(--code-bg)',
    marginTop: 16,
    fontFamily:
      'ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace',
    borderRadius: 16,
  },
  code: {
    flexGrow: 1,
  },
  codeEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8rem',
  },
});
