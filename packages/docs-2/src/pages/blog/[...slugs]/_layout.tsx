import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { blogSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import * as stylex from '@stylexjs/stylex';
import { vars } from '../../../theming/vars.stylex';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions()}
      sidebar={{ enabled: false }}
      tree={blogSource.pageTree}
    >
      <div {...stylex.props(styles.container)}>{children}</div>
    </DocsLayout>
  );
}

const styles = stylex.create({
  container: {
    '--fd-nav-height': '58px',
    [vars['--color-fd-accent']]: 'red',
  },
});
