import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import {versionTag} from '../VersionTag';

const codeForCLI = ({prod, dev}) => ({
  npm: [
    prod?.length > 0 ? `$ npm install --save ${prod.join(' ')}` : null,
    dev?.length > 0 ? `$ npm install --save-dev ${dev.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join('\n'),
});

export function DevInstallExample({prod = [], dev = []}) {
  const p = prod.map((p) => p + versionTag);
  const d = dev.map((d) => d + versionTag);

  const codeExamples = codeForCLI({prod: p, dev: d});

  return <CodeBlock className="language-bash">{codeExamples.npm}</CodeBlock>;
}
