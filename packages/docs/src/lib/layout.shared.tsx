import type { BaseLayoutProps } from '@/components/layout/shared';
import * as stylex from '@stylexjs/stylex';
import LogoBold from '@/components/LogoBold';
import { vars } from '../theming/vars.stylex';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <LogoBold xstyle={styles.logo} />
      ),
    },
    githubUrl: 'https://github.com/facebook/stylex',
    links: [
      {
        type: 'main',
        text: 'Docs',
        url: '/docs/learn',
        active: 'nested-url'
      },
      {
        type: 'main',
        text: 'API',
        url: '/docs/api',
        active: 'nested-url'
      },
      {
        type: 'main',
        text: 'Blog',
        url: '/blog',
        active: 'nested-url'
      },
      {
        type: 'main',
        text: 'Playground',
        url: '/playground',
        active: 'nested-url'
      },
    ],
  };
}

const styles = stylex.create({
  logo: {
    '--fg1': vars['--color-fd-card-foreground'],
    // width: 48,
    height: 36,
  },
});
