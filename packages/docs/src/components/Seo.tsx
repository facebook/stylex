/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/lib/site';

// Per-page title/description for SEO and social cards. React hoists these <meta>
// tags into <head>. They must be set per-page (not globally in the root layout),
// because React does not de-duplicate meta tags — a global default plus a
// per-page tag would emit two conflicting `og:title`s. Invariant tags
// (og:type, og:image, twitter:card, …) stay in the root layout.
export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <>
      <meta content={description} name="description" />
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={title} name="twitter:title" />
      <meta content={description} name="twitter:description" />
    </>
  );
}
