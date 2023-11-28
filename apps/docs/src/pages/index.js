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
import Link from '@docusaurus/Link';
import FeaturePile from '../../components/FeaturePile';

const STEP_CONFIGURE = `import plugin from '@stylexjs/rollup-plugin';

const config = () => ({
  plugins: [
    plugin({ ...options })
  ]
})

export default config;

`;

const STEP_CREATE = `import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  hello: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8rem',
  }
});

`;

const STEP_USE = `import * as stylex from '@stylexjs/stylex';

const HelloWorld = ({style}) => (
  <div {...stylex.props(
    styles.hello,
    style
  )} >
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
    <span {...stylex.props(styles.code)}>
      <CodeBlock>{children}</CodeBlock>
    </span>
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
            <span
              {...stylex.props([
                styles.subtitleHighlight,
                styles.highlightBlue,
              ])}>
              Predictable
            </span>{' '}
            & <span {...stylex.props(styles.subtitleHighlight)}>scalable</span>{' '}
            styling
            <br /> for{' '}
            <span
              {...stylex.props([
                styles.subtitleHighlight,
                styles.highlightPrimary,
              ])}>
              ambitious
            </span>{' '}
            user-interfaces.
          </h2>
          <section {...stylex.props(styles.ctaSection)}>
            <Link {...stylex.props(styles.cta)} to="/docs/learn/installation/">
              Get Started →
            </Link>
            <Link
              {...stylex.props(styles.cta, styles.ctaBlue)}
              to="/docs/learn/thinking-in-stylex/">
              Thinking in StyleX →
            </Link>
          </section>
        </section>
        <section
          {...stylex.props(
            styles.getStarted,
            styles.getStartedLayout,
            styles.heroPadding,
          )}>
          <FeaturePile />
        </section>
        <section {...stylex.props(styles.hero)}>
          <h1 {...stylex.props(styles.sectionTitle)}>{'Easy as 1, 2, 3'}</h1>
          <div {...stylex.props(styles.getStartedLayout)}>
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
          </div>
        </section>
      </main>
    </Layout>
  );
}

const CTA_BREAK = '@media (max-width: 360px)';

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
    width: '100%',
  },
  heroPadding: {
    padding: 32,
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
    color: {
      default: 'var(--fg1)',
      ':hover': 'var(--fg1)',
    },
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    width: {
      default: 'null',
      [CTA_BREAK]: '100%',
    },
    backgroundColor: 'hsl(var(--pink-h), var(--pink-s), var(--pink-l))',
    paddingBlock: '0.75rem',
    paddingInline: '2rem',
    boxShadow: {
      default:
        '0 0 4px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.35)',
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
        '0 0 4px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.35)',
      ':hover':
        '0 0 10px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.75)',
    },
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
  highlightPrimary: {
    color: 'currentColor',
    textShadow: null,
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
  },
  getStartedLayout: {
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
    borderRadius: 32,
    containerType: 'inline-size',
  },
  code: {
    flexGrow: 1,
    fontSize: 'clamp(0.6rem, 0.15rem + 3cqi, 1rem)',
  },
  zstack: {
    alignItems: {
      default: 'flex-start',
      '@media (max-width: 1135px)': 'center',
    },
  },
});
