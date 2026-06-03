/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ReactNode } from 'react';
import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from '@/components/layout/home';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()} showSidebarToggle={false}>
      {children}
    </HomeLayout>
  );
}
