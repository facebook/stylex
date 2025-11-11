import '@/styles/globals.css';
import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {import.meta.env.DEV ? (
        <>
          <link rel="stylesheet" href="/virtual:stylex.css" />
          <script type="module" src="virtual:stylex:css-only" />
        </>
      ) : null}
      <Provider>{children}</Provider>
    </>
  );
}
