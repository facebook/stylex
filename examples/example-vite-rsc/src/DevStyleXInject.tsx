/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { useEffect } from 'react';

function DevStyleXInjectImpl() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      // @ts-ignore
      import('virtual:stylex:runtime');
    }
  }, []);
  return <link href="/virtual:stylex.css" rel="stylesheet" />;
}

export function DevStyleXInject({ cssHref }: { cssHref: string }) {
  return import.meta.env.DEV ? (
    <DevStyleXInjectImpl />
  ) : (
    <link href={cssHref} rel="stylesheet" />
  );
}
