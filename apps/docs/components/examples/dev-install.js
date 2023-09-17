import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import {versionTag} from '../VersionTag';

const codeForCLI = ({prod, dev}) => ({
  npm: [
    prod?.length > 0 ? `$ npm install --save ${prod.join(' ')}` : null,
    dev?.length > 0 ? `$ npm install --save-dev ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
  pnpm: [
    prod?.length > 0 ? `$ pnpm add ${prod.join(' ')}` : null,
    dev?.length > 0 ? `$ pnpm add --save-dev ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
  yarn: [
    prod?.length > 0 ? `$ yarn add ${prod.join(' ')}` : null,
    dev?.length > 0 ? `$ yarn add --dev ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
  bun: [
    prod?.length > 0 ? `$ bun add ${prod.join(' ')}` : null,
    dev?.length > 0 ? `$ bun add --dev ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
});

export function DevInstallExample({prod = [], dev = []}) {
  const p = prod.map((p) => p + versionTag);
  const d = dev.map((d) => d + versionTag);

  const codeExamples = codeForCLI({prod: p, dev: d});

  return (
    <Tabs>
      <TabItem default label="npm" value="npm">
        <CodeBlock className="language-bash">{codeExamples.npm}</CodeBlock>
      </TabItem>
      <TabItem label="pnpm" value="pnpm">
        <CodeBlock className="language-bash">{codeExamples.pnpm}</CodeBlock>
      </TabItem>
      <TabItem label="yarn" value="yarn">
        <CodeBlock className="language-bash">{codeExamples.yarn}</CodeBlock>
      </TabItem>
      <TabItem label="bun" value="bun">
        <CodeBlock className="language-bash">{codeExamples.bun}</CodeBlock>
      </TabItem>
    </Tabs>
  );
}
