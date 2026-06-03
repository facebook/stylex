/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client'; // This must be a client component

import { lazy, Suspense, useEffect, useState } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { WindowHistoryAdapter } from 'use-query-params/adapters/window';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Render a fallback or null on the server and during initial client render
    return fallback;
    // You can also add a loading spinner or other placeholder here
    // return <div>Loading...</div>;
  }

  // Once mounted on the client, render the children
  return children;
}

const LazyPlayground = lazy(() => import('./index'));

export function Playground() {
  return (
    <ClientOnly fallback={<PlaygroundPlaceholder />}>
      <Suspense fallback={<PlaygroundPlaceholder />}>
        <QueryParamProvider adapter={WindowHistoryAdapter}>
          {/* TODO: Use concurrent mode to suspend while monaco boots up */}
          <LazyPlayground />
        </QueryParamProvider>
      </Suspense>
    </ClientOnly>
  );
}

function PlaygroundPlaceholder() {
  // TODO: Add a better placeholder with a shimmer version of the playground layout
  return <div {...stylex.props(styles.placeholder)}>Loading...</div>;
}

const styles = stylex.create({
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: `calc(100dvh - ${vars['--fd-nav-height']})`,
  },
});
