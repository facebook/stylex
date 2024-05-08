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
import CtaButton from '../../components/CtaButton';

export default function Playground() {
  return (
    <Layout>
      <div {...stylex.props(styles.container)}>
        <CtaButton to="https://stackblitz.com/edit/stylex-next">
          StyleX + Next Demo
        </CtaButton>
        <span>A full playground is coming soon.</span>
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
    height: '60vh',
    gap: '0.5rem',
  },
});
