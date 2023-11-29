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
import FeaturePile from '../../components/FeaturePile';
import {ZStack, ZStackItem} from '../../components/ZStack';
// import ThinkingInStylex from '../../docs/learn/04-thinking-in-stylex.mdx';
import CodeBlock from '@theme/CodeBlock';

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
      <CodeBlock language="tsx">{children}</CodeBlock>
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
            <Link {...stylex.props(styles.cta)} to="/docs/learn/installation/">
              Get Started
            </Link>
            <Link
              {...stylex.props(styles.cta, styles.ctaBlue)}
              to="/docs/learn/thinking-in-stylex/">
              Thinking in StyleX
            </Link>
          </section>
        </section>
        <section
          {...stylex.props(
            styles.hero,
            styles.getStartedLayout,
            styles.bentoContainer,
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
        {/* <section {...stylex.props(styles.secondaryBg)}>
          <div {...stylex.props(styles.contentSection)}>
            <ThinkingInStylex />
          </div>
        </section> */}
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
      'radial-gradient(hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.3), var(--bg1) 70%)',
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
  bentoContainer: {
    width: '100%',
    maxWidth: 900,
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
  highlightBlue: {
    color: 'var(--cyan)',
  },
  highlightPrimary: {
    color: 'currentColor',
    textShadow: null,
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
  sectionTitle: {
    fontSize: 'clamp(2rem, 1rem + 5vw, 4rem)',
    width: '100%',
    textAlign: 'center',
    marginVertical: '1rem',
    color: 'var(--fg1)',
  },
  secondaryBg: {
    width: '100%',
    backgroundColor: 'var(--bg2)',
    paddingBlock: 64,
    paddingInline: 32,
  },
  contentSection: {
    maxWidth: 768,
    marginInline: 'auto',
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
    fontWeight: 800,
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
    backgroundColor: '#282A36',
    borderColor: 'hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.25)',
    borderRadius: 16,
    borderStyle: 'solid',
    borderWidth: 1,
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    fontFamily:
      'ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace',
    marginTop: 16,
    // eslint-disable-next-line @stylexjs/valid-styles
    '--ifm-leading': '0px',
    overflow: 'hidden',
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
