/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import Layout from '@theme/Layout';
import StylexAnimatedLogo from '@site/components/StylexAnimatedLogo';
import CodeBlock from '@site/components/CodeBlock';

const STEP_CONFIGURE = `import plugin from '@stylexjs/rollup-plugin';

const config = () => ({
  plugins: [
    plugin({ ...options })
  ]
})

export default config;

`;

const STEP_CREATE = `import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  hello: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8rem',
  }
});

`;

const STEP_USE = `import stylex from '@stylexjs/stylex';

const HelloWorld = (props) => (
  <div {...stylex.props([
    styles.hello,
    props.world
  ])} >
    🎉
  </div>
)

`;

const Card = ({children}) => (
  <div {...stylex.props(styles.card)}>{children}</div>
);

const CardTitle = ({children}) => (
  <h3 {...stylex.props(styles.cardTitle)}>{children}</h3>
);

const CardDescription = ({children}) => (
  <p {...stylex.props(styles.cardDescription)}>{children}</p>
);

const CodeContainer = ({children}) => (
  <div {...stylex.props(styles.codeContainer)}>
    <CodeBlock style={styles.code}>{children}</CodeBlock>
  </div>
);

export default function Home() {
  return (
    <Layout>
      <main {...stylex.props(styles.main)}>
        <section {...stylex.props(styles.hero)}>
          <h1 {...stylex.props(styles.title)}>
            <StylexAnimatedLogo style={styles.logo} />
          </h1>
          <h2 {...stylex.props(styles.subtitle)}>
            The{' '}
            <span
              {...stylex.props([
                styles.subtitleHighlight,
                styles.highlightBlue,
              ])}>
              Power
            </span>{' '}
            of Inline Styles.
            <br />
            The Speed of{' '}
            <span {...stylex.props(styles.subtitleHighlight)}>Atomic</span> CSS.
          </h2>
        </section>
        <section {...stylex.props(styles.getStarted)}>
          <h1 {...stylex.props(styles.sectionTitle)}>{'Easy as 1, 2, 3'}</h1>
          <Card>
            <CardTitle>Step 1</CardTitle>
            <CardDescription>Configure the compiler</CardDescription>
            <CodeContainer>{STEP_CONFIGURE}</CodeContainer>
          </Card>
          <Card>
            <CardTitle>Step 2</CardTitle>
            <CardDescription>Create your styles</CardDescription>
            <CodeContainer>{STEP_CREATE}</CodeContainer>
          </Card>
          <Card>
            <CardTitle>Step 3</CardTitle>
            <CardDescription>Use your styles</CardDescription>
            <CodeContainer>{STEP_USE}</CodeContainer>
          </Card>
        </section>
      </main>
    </Layout>
  );
}

const styles = stylex.create({
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--bg1)',
    backgroundImage:
      'radial-gradient(hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.15), var(--bg1) 70%)',
  },
  hero: {
    paddingBlock: 50,
    minHeight: 'calc(60vh)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '400',
    textAlign: 'center',
    color: 'var(--fg2)',
    fontSize: 'clamp(1rem, 1rem + 2vw, 3rem)',
  },
  h3: {
    width: '100%',
    fontWeight: '400',
    fontSize: 'clamp(1rem, 0.8rem + 5vw, 2rem)',
    textAlign: 'center',
    opacity: 0.7,
  },
  subtitleHighlight: {
    color: 'var(--pink)',
    fontWeight: '700',
    textShadow:
      '0 0 10px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.5)',
  },
  highlightBlue: {
    color: 'var(--cyan)',
    textShadow:
      '0 0 10px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.5)',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 1rem + 5vw, 4rem)',
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
    flexBasis: {
      default: 0,
      '@media (max-width: 1250px)': '100%',
    },
    flexGrow: 1,
    flexShrink: 1,
    margin: 16,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
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
    fontSize: {
      default: '1rem',
      '@media (min-width: 1250px) and (max-width: 1500px)': '0.8rem',
      '@media (min-width: 420px) and (max-width: 550px)': '0.8rem',
      '@media (max-width: 419px)': '0.65rem',
    },
  },
  code: {
    flexGrow: 1,
  },
  codeEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8rem',
  },
  zstack: {
    alignItems: {
      default: 'flex-start',
      '@media (max-width: 1135px)': 'center',
    },
  },
});
