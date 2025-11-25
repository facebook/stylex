'use client';

import { useEffect } from 'react';

function DevStyleXInjectImpl() {
  useEffect(() => {
    // @ts-expect-error
    import('virtual:stylex:css-only');
  }, []);
  return (
    <>
      <link rel="stylesheet" href="/virtual:stylex.css" />
    </>
  );
}

export const DevStyleXInject = (import.meta as any).env.DEV
  ? DevStyleXInjectImpl
  : () => null;
