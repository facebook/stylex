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

export default function Playground() {
  return (
    <Layout>
      <div {...stylex.props(styles.container)}>
        <h1>Playground</h1>
        <p>Coming soon...</p>
      </div>
    </Layout>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: stylex.firstThatWorks('calc(100dvh - 60px)', 'calc(100vh - 60px)'),
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--cyan)',
  },
});
