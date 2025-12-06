/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import Tabs from './Tabs';
import TabItem from './TabItem';
import mdx from 'fumadocs-ui/mdx';
import { versionTag } from './VersionTag';

const codeForCLI = ({ prod, dev }: { prod: string[]; dev: string[] }) => ({
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

  const codeExamples: Record<string, string> = codeForCLI({ prod: p, dev: d });

  return (
    <mdx.CodeBlockTabs>
      {Object.keys(codeExamples).map((key) => (
        <mdx.CodeBlockTab key={key} value={key}>
          <mdx.pre>{codeExamples[key]}</mdx.pre>
        </mdx.CodeBlockTab>
      ))}
    </mdx.CodeBlockTabs>
  );
}
