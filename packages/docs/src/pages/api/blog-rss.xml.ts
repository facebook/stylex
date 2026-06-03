/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getRSS } from '@/lib/rss';

export async function GET() {
  const rss = await getRSS();
  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
