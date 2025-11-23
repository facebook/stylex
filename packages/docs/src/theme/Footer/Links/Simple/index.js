/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import * as stylex from '@stylexjs/stylex';
import LinkItem from '@theme/Footer/LinkItem';

const MOBILE = '@media (max-width: 996px)';

const styles = stylex.create({
  wrapper: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  links: {
    marginBottom: '1rem',
  },
  separator: {
    marginInline: 'var(--ifm-footer-link-horizontal-spacing)',
    display: {
      [MOBILE]: 'none',
    },
  },
  linkItem: {
    color: {
      default: 'var(--ifm-footer-link-color)',
      ':hover': 'var(--ifm-footer-link-hover-color)',
    },
    lineHeight: 2,
    display: {
      [MOBILE]: 'block',
    },
    width: {
      [MOBILE]: 'max-content',
    },
  },
});

function Separator({ xstyle }) {
  return <span {...stylex.props(styles.separator, xstyle)} />;
}

function SimpleLinkItem({ item, xstyle }) {
  return item.html ? (
    <span
      {...stylex.props(styles.linkItem, xstyle)}
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: item.html }}
    />
  ) : (
    <LinkItem item={item} xstyle={xstyle} />
  );
}

export default function FooterLinksSimple({ links, xstyle }) {
  return (
    <div {...stylex.props(styles.wrapper, xstyle)}>
      <div {...stylex.props(styles.links)}>
        {links.map((item, i) => (
          <React.Fragment key={i}>
            <SimpleLinkItem item={item} />
            {links.length !== i + 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
