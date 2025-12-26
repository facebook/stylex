// components/ClientOnly.jsx
'use client'; // This must be a client component

import { lazy, Suspense, useEffect, useState } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { WindowHistoryAdapter } from 'use-query-params/adapters/window';

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Render a fallback or null on the server and during initial client render
    return null;
    // You can also add a loading spinner or other placeholder here
    // return <div>Loading...</div>;
  }

  // Once mounted on the client, render the children
  return children;
}

const LazyPlayground = lazy(() => import('./index'));

export function Playground() {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <QueryParamProvider adapter={WindowHistoryAdapter}>
          <LazyPlayground />
        </QueryParamProvider>
      </Suspense>
    </ClientOnly>
  );
}
