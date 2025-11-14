import type { ReactNode } from 'react';
import { DocsLayout } from '@/components/layout/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: ReactNode }) {
  const base = baseOptions();

  return (
    <DocsLayout
      {...base}
      links={[base.links![2]!]}
      nav={{
        ...base.nav,
        enabled: true,
        transparentMode: 'top',
      }}
      tree={source.pageTree}
    >
      {children}
    </DocsLayout>
  );
}
