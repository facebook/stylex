import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';
import '@/styles/globals.css';
import DevStyleXHMR from '@/components/DevStyleXHMR';
import { SidebarProvider } from '@/contexts/SidebarContext';
import faviconUrl from '@/static/img/favicon.svg';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <head>
        <link rel="icon" href={faviconUrl} type="image/svg+xml" />
      </head>
      <DevStyleXHMR />
      <Provider>
        <SidebarProvider>{children}</SidebarProvider>
      </Provider>
    </>
  );
}
