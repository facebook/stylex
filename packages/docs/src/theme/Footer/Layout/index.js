/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { ThemeClassNames } from '@docusaurus/theme-common';

const MOBILE = '@media (max-width: 996px)';
const PRINT = '@media print';

const styles = stylex.create({
  footer: {
    backgroundColor: 'var(--ifm-footer-background-color)',
    color: 'var(--ifm-footer-color)',
    paddingBlock: 'var(--ifm-footer-padding-vertical)',
    paddingInline: {
      default: 'var(--ifm-footer-padding-horizontal)',
      [MOBILE]: 0,
    },
    textAlign: 'center',
    display: {
      [PRINT]: 'none',
    },
  },
  footerDark: {
    '--ifm-footer-background-color': '#303846',
    '--ifm-footer-color': 'var(--ifm-footer-link-color)',
    '--ifm-footer-link-color': 'var(--ifm-color-secondary)',
    '--ifm-footer-title-color': 'var(--ifm-color-white)',
  },
  container: {
    marginInline: 'auto',
    maxWidth: 'var(--ifm-container-width)',
    paddingInline: 'var(--ifm-spacing-horizontal)',
    width: '100%',
  },
  containerFluid: {
    maxWidth: 'inherit',
  },
  footerContainer: {
    maxWidth: '960px',
  },
  footerBottom: {
    textAlign: 'center',
  },
  marginBottomSm: {
    marginBottom: '0.5rem',
  },
});

export default function FooterLayout({ style, links, logo, copyright }) {
  const footerStyleProps = stylex.props(
    styles.footer,
    style === 'dark' && styles.footerDark,
  );
  const footerClassName =
    [footerStyleProps.className, ThemeClassNames.layout.footer.container]
      .filter(Boolean)
      .join(' ') || undefined;
  const { className: _footerClass, ...footerProps } = footerStyleProps;

  const containerProps = stylex.props(
    styles.container,
    styles.containerFluid,
    styles.footerContainer,
  );
  const footerBottomProps = stylex.props(styles.footerBottom);
  const logoMarginProps = stylex.props(styles.marginBottomSm);

  return (
    <footer {...footerProps} className={footerClassName}>
      <div {...containerProps}>
        {links}
        {(logo || copyright) && (
          <div {...footerBottomProps}>
            {logo && <div {...logoMarginProps}>{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
