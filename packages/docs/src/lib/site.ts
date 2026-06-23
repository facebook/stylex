/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Canonical origin for the site, used to build absolute URLs. Single source of
// truth shared by the SEO/social meta tags and the RSS feed. Crawlers (Open
// Graph, Twitter/X cards) require absolute image and page URLs — a bundler
// relative path like "/assets/…png" does not resolve in link previews.
export const SITE_URL = 'https://stylexjs.com';

export const SITE_NAME = 'StyleX';

// Fallback title/description for pages that don't provide their own.
export const DEFAULT_TITLE =
  'StyleX — The styling system for ambitious interfaces';
export const DEFAULT_DESCRIPTION = 'The styling system that powers Meta.';
