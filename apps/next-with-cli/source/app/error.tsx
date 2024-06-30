/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Some Error',
  description: 'Some Error',
};

export default function RootLayout() {
  return <h1>500 - Some Error</h1>;
}
