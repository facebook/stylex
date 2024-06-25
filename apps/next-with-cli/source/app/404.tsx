/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not Found',
  description: '404 - Not Found',
};

export default function RootLayout() {
  return <h1>404 - Page Not Found</h1>;
}
