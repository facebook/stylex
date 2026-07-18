/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { parseSource, printSource, parserForFile } from '../src/core/rewriter';

test('parse -> print with no mutation preserves the source byte-exactly', () => {
  const source = [
    '/** @jsxImportSource @emotion/react */',
    "import * as React   from 'react';",
    '',
    'export default function Badge() {',
    "  return <div css={{ color:   'red' }}>Badge</div>;",
    '}',
    '',
  ].join('\n');
  expect(printSource(parseSource(source))).toEqual(source);
});

test('parses Flow-typed user code', () => {
  const source = 'const x: number = 1;\n';
  expect(printSource(parseSource(source))).toEqual(source);
});

test('picks the TS parser for TypeScript files', () => {
  expect(parserForFile('Component.tsx')).toEqual('tsx');
  expect(parserForFile('Component.ts')).toEqual('tsx');
  expect(parserForFile('Component.js')).toEqual('flow');
  expect(parserForFile('Component.jsx')).toEqual('flow');
});
