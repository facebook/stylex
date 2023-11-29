/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import * as React from 'react';

export default function PlaygroundPage() {
  return (
    <Layout>
      <BrowserOnly>
        {() => {
          const Playground = require('../../components/Playground').default;
          return <Playground />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
