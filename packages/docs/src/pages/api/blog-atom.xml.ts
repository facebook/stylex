/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getAtom } from '@/lib/rss';

export async function GET() {
  const atom = await getAtom();
  return new Response(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  });
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
