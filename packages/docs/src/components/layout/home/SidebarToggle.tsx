'use client';

import { SidebarContext } from '@/contexts/SidebarContext';
import { vars } from '@/theming/vars.stylex';
import { SidebarIcon } from 'lucide-react';
import * as stylex from '@stylexjs/stylex';
import { use } from 'react';

export default function SidebarToggle() {
  const [_open, setOpen] = use(SidebarContext);

  return (
    <button
      type="button"
      onClick={() => {
        setOpen((old) => {
          if (old === null) {
            return window.matchMedia('(max-width: 767.9px)').matches;
          }
          return !old;
        });
      }}
      {...stylex.props(styles.button)}
    >
      <SidebarIcon size={20} />
    </button>
  );
}

const styles = stylex.create({
  button: {
    backgroundColor: 'transparent',
    height: 56,
    width: 56,
    marginInline: (20 - 56) / 2,
    color: {
      default: vars['--color-fd-foreground'],
      ':hover': vars['--color-fd-primary'],
      ':focus-visible': vars['--color-fd-primary'],
    },
    transitionProperty: 'color, scale',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    scale: {
      default: null,
      ':active': 0.95,
    },
  },
});
