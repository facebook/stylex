/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { unstable_RSCRouteConfig as RSCRouteConfig } from 'react-router';

export function routes() {
  return [
    {
      id: 'root',
      path: '',
      lazy: () => import('./root/route'),
      children: [
        {
          id: 'home',
          index: true,
          lazy: () => import('./home/route'),
        },
        {
          id: 'about',
          path: 'about',
          lazy: () => import('./about/route'),
        },
      ],
    },
  ] satisfies RSCRouteConfig;
}
