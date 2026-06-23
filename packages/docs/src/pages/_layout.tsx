/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';
import '@/styles/globals.css';
import DevStyleXHMR from '@/components/DevStyleXHMR';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { SITE_URL, SITE_NAME, DEFAULT_TITLE } from '@/lib/site';
import coverImageUrl from '@/static/img/stylex-cover-photo.png';

const faviconUrl = '/favicon.svg';

// `coverImageUrl` is a root-relative bundler path; crawlers need an absolute URL.
const coverImageAbsoluteUrl = `${SITE_URL}${coverImageUrl}`;
const COVER_IMAGE_WIDTH = '1034';
const COVER_IMAGE_HEIGHT = '548';

// Only site-wide invariant tags live here. Per-page title/description tags
// (description, og:title, og:description, twitter:title/description) are rendered
// per-page via the <Seo> component, since React does not de-duplicate meta tags.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="website" property="og:type" />
        <meta content={SITE_URL} property="og:url" />
        <meta content={SITE_NAME} property="og:site_name" />
        <meta content={coverImageAbsoluteUrl} property="og:image" />
        <meta content={COVER_IMAGE_WIDTH} property="og:image:width" />
        <meta content={COVER_IMAGE_HEIGHT} property="og:image:height" />
        <meta content={DEFAULT_TITLE} property="og:image:alt" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={coverImageAbsoluteUrl} name="twitter:image" />
        <meta content={DEFAULT_TITLE} name="twitter:image:alt" />
        <link href={faviconUrl} rel="icon" sizes="any" />
        <link href={faviconUrl} rel="icon" type="image/svg+xml" />
        <link href={faviconUrl} rel="shortcut icon" />
      </head>
      <DevStyleXHMR />
      <Provider>
        <SidebarProvider>{children}</SidebarProvider>
      </Provider>
    </>
  );
}
