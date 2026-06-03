/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ReactNode } from 'react';
import { DocsLayout } from '@/components/layout/docs';
import { blogSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: ReactNode }) {
  // HACK:
  // Patch the pageTree to convert URLs to slugs
  const pages = blogSource.getPages();
  const pageTreeChildren = blogSource.pageTree.children
    .map((child: any) => {
      const page = pages.find((page) => page.url === child.url);
      const slug = page?.data.slug;
      if (slug == null) return child;

      return {
        ...child,
        url: `/blog/${slug}`,
      };
    })
    .reverse();
  return (
    <DocsLayout
      key="blog-layout"
      {...baseOptions()}
      tree={{ ...blogSource.pageTree, children: pageTreeChildren }}
    >
      {children}
    </DocsLayout>
  );
}
