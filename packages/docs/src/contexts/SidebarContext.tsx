'use client';

import { createContext, useMemo, useState } from 'react';

export const SidebarContext = createContext<
  [null | boolean, (val: ((old: null | boolean) => boolean) | boolean) => void]
>([true, () => {}]);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(null);
  const value = useMemo(() => [open, setOpen], [open]);

  return <SidebarContext value={value as any}>{children}</SidebarContext>;
}
