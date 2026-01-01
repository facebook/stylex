/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { useEffect } from 'react';

function DevStyleXHMR() {
  useEffect(() => {
    // @ts-ignore
    import('virtual:stylex:css-only');
  }, []);
  return <link href="/virtual:stylex.css" rel="stylesheet" />;
}

function EmptyStub() {
  return null;
}

export default import.meta.env.DEV ? DevStyleXHMR : EmptyStub;
