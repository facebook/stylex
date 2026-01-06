/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

/**
 * Template configuration
 * Each template references an example directory in /examples
 */
const TEMPLATES = [
  {
    id: 'nextjs',
    name: 'Next.js (App Router + TypeScript)',
    exampleSource: 'example-nextjs',
    excludeFiles: [
      'node_modules',
      '.next',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ],
  },
  {
    id: 'vite-react',
    name: 'Vite + React (TypeScript)',
    exampleSource: 'example-vite-react',
    excludeFiles: [
      'node_modules',
      'dist',
      '.vite',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ],
  },
  {
    id: 'vite',
    name: 'Vite (Vanilla TypeScript)',
    exampleSource: 'example-vite',
    excludeFiles: [
      'node_modules',
      'dist',
      '.vite',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ],
  },
];

module.exports = { TEMPLATES };
