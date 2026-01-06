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
];

module.exports = { TEMPLATES };
