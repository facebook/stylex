/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import * as stylex from '@stylexjs/stylex';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';

const MOBILE = '@media (max-width: 996px)';

const styles = stylex.create({
  linkItem: {
    color: {
      default: 'var(--ifm-footer-link-color)',
      ':hover': 'var(--ifm-footer-link-hover-color)',
    },
    lineHeight: 2,
    display: {
      [MOBILE]: 'block',
    },
  },
});

export default function FooterLinkItem({ item, xstyle }) {
  const { to, href, label, prependBaseUrlToHref, ...props } = item;
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });

  return (
    <Link
      {...stylex.props(styles.linkItem, xstyle)}
      {...(href
        ? {
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            to: toUrl,
          })}
      {...props}
    >
      {label}
      {href && !isInternalUrl(href) && <IconExternalLink />}
    </Link>
  );
}
