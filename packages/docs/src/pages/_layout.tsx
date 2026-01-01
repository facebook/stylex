/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
        <link href={faviconUrl} rel="icon" type="image/svg+xml" />
      </head>
      <DevStyleXHMR />
      <Provider>
        <SidebarProvider>{children}</SidebarProvider>
      </Provider>
    </>
  );
}
