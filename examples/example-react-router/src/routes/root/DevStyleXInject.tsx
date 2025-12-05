'use client';

import { useEffect } from 'react';

export function DevStyleXInject() {
  useEffect(() => {
    // @ts-ignore
    import('virtual:stylex:runtime');
  }, []);
  return <link rel="stylesheet" href="/virtual:stylex.css" />;
}
