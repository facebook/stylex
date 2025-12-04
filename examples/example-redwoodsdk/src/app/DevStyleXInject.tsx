'use client';

import { useEffect } from 'react';

function DevStyleXInjectImpl() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      // @ts-ignore
      import('virtual:stylex:css-only');
    }
  }, []);
  return <link rel="stylesheet" href="/virtual:stylex.css" />;
}

export function DevStyleXInject({ cssHref }: { cssHref: string }) {
  return import.meta.env.DEV ? (
    <DevStyleXInjectImpl />
  ) : (
    <link rel="stylesheet" href={cssHref} />
  );
}
