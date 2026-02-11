/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ReactNode } from 'react';
import { DocsLayout } from '@/components/layout/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: ReactNode }) {
  const base = baseOptions();

  return (
    <DocsLayout key="docs-layout" {...base} tree={source.pageTree}>
      {children}
    </DocsLayout>
  );
}
