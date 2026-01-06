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
    description: 'Full-stack React framework with server components',
    features: ['SSR', 'App Router', 'TypeScript', 'Hot Reload'],
    recommended: true,
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
    description: 'Fast development with instant HMR',
    features: ['React 18', 'TypeScript', 'Fast HMR', 'SWC'],
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
    description: 'Lightweight setup without a framework',
    features: ['Vanilla TS', 'Fast HMR', 'Minimal'],
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
