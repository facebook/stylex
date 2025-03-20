/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';

export default function PlaygroundPage() {
  return (
    <Layout>
      <BrowserOnly>
        {() => {
          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent,
          );

          if (isSafari) {
            return (
              <div {...stylex.props(styles.unsupportedMessage)}>
                <h3 {...stylex.props(styles.messageTitle)}>
                  Safari Not Supported
                </h3>
                <p {...stylex.props(styles.messageText)}>
                  Safari is not supported at this time. Please try our{' '}
                  <a
                    {...stylex.props(styles.link)}
                    href="https://stackblitz.com/edit/vitejs-vite-3vkyxg?file=package.json"
                  >
                    StackBlitz playground
                  </a>{' '}
                  instead.
                </p>
              </div>
            );
          }

          const Playground = require('../../components/Playground').default;

          return <Playground />;
        }}
      </BrowserOnly>
    </Layout>
  );
}

const styles = stylex.create({
  unsupportedMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBlock: 64,
    marginInline: 'auto',
    maxWidth: 600,
    textAlign: 'center',
    backgroundColor: 'var(--ifm-background-surface-color)',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  messageTitle: {
    fontSize: '1.25rem',
    marginBottom: 16,
    color: 'var(--ifm-color-emphasis-700)',
  },
  messageText: {
    fontSize: '1rem',
    lineHeight: 1.5,
    color: 'var(--ifm-font-color-base)',
    margin: 0,
  },
  link: {
    color: 'var(--ifm-color-primary)',
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
  },
});
