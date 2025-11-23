/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import Link from '@docusaurus/Link';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

const styles = stylex.create({
  logo: {
    marginTop: '1rem',
    maxWidth: 'var(--ifm-footer-logo-max-width)',
  },
  logoLink: {
    opacity: {
      default: 0.5,
      ':hover': 1,
    },
    transitionDuration: 'var(--ifm-transition-fast)',
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--ifm-transition-timing-default)',
  },
});

function LogoImage({ logo, xstyle }) {
  const { withBaseUrl } = useBaseUrlUtils();
  const sources = {
    light: withBaseUrl(logo.src),
    dark: withBaseUrl(logo.srcDark ?? logo.src),
  };

  return (
    <ThemedImage
      {...stylex.props(styles.logo, xstyle)}
      alt={logo.alt}
      height={logo.height}
      sources={sources}
      width={logo.width}
    />
  );
}

export default function FooterLogo({ logo, xstyle }) {
  if (logo.href) {
    return (
      <Link
        {...stylex.props(styles.logoLink, xstyle)}
        href={logo.href}
        target={logo.target}
      >
        <LogoImage logo={logo} xstyle={xstyle} />
      </Link>
    );
  }

  return <LogoImage logo={logo} xstyle={xstyle} />;
}
