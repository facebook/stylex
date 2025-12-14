/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryParamProvider } from 'use-query-params';
import { WindowHistoryAdapter } from 'use-query-params/adapters/window';

export default function PlaygroundNewPage() {
  return (
    <Layout>
      <BrowserOnly>
        {() => {
          const PlaygroundNew =
            require('../../components/PlaygroundNew').default;
          return (
            <QueryParamProvider adapter={WindowHistoryAdapter}>
              <PlaygroundNew />
            </QueryParamProvider>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
