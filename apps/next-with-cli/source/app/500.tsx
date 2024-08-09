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
  description: '500 - Internal Server Error',
};

export default function RootLayout() {
  return <h1>500 - Internal Server Error</h1>;
}
