/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function PlaygroundNewPage() {
  return (
    <Layout>
      <BrowserOnly>
        {() => {
          const PlaygroundNew =
            require('../../components/PlaygroundNew').default;
          return <PlaygroundNew />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
