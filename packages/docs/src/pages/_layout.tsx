import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';
import '@/styles/globals.css';
import DevStyleXHMR from '@/components/DevStyleXHMR';
import { SidebarProvider } from 'fumadocs-ui/contexts/sidebar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DevStyleXHMR />
      <Provider>
        <SidebarProvider>{children}</SidebarProvider>
      </Provider>
    </>
  );
}
