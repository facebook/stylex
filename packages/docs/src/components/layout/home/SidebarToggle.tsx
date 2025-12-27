'use client';

import { SidebarContext } from '@/contexts/SidebarContext';
import { SidebarIcon } from 'lucide-react';
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
    >
      <SidebarIcon size={20} />
    </button>
  );
}
