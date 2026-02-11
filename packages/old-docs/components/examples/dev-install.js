/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import { versionTag } from '../VersionTag';

const codeForCLI = ({ prod, dev }) => ({
  npm: [
    prod?.length > 0 ? `npm install --save ${prod.join(' ')}` : null,
    dev?.length > 0 ? `npm install --save-dev ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
  pnpm: [
    prod?.length > 0 ? `pnpm add ${prod.join(' ')}` : null,
    dev?.length > 0 ? `pnpm add -D ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
  yarn: [
    prod?.length > 0 ? `yarn add ${prod.join(' ')}` : null,
    dev?.length > 0 ? `yarn add -D ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
  bun: [
    prod?.length > 0 ? `bun add ${prod.join(' ')}` : null,
    dev?.length > 0 ? `bun add -D ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
});

export function DevInstallExample({ prod = [], dev = [] }) {
  const p = prod.map((p) => p + versionTag);
  const d = dev.map((d) => d + versionTag);

  const codeExamples = codeForCLI({ prod: p, dev: d });

  return (
    <Tabs>
      {Object.keys(codeExamples).map((key) => (
        <TabItem key={key} label={key} value={key}>
          <CodeBlock className="language-bash">{codeExamples[key]}</CodeBlock>
        </TabItem>
      ))}
    </Tabs>
  );
}
