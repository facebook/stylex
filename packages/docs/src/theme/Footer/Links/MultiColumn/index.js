/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { ThemeClassNames } from '@docusaurus/theme-common';
import LinkItem from '@theme/Footer/LinkItem';

const MOBILE = '@media (max-width: 996px)';

const styles = stylex.create({
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    marginInline: 'calc(var(--ifm-spacing-horizontal) * -1)',
    marginBottom: '1rem',
  },
  col: {
    // '--ifm-col-width': '100%',
    // flexBasis: 'var(--ifm-col-width)',
    flexGrow: 1,
    flexShrink: 0,
    marginLeft: 0,
    // maxWidth: 'var(--ifm-col-width)',
    paddingInline: 'var(--ifm-spacing-horizontal)',
    width: {
      [MOBILE]: '100%',
    },
    marginBottom: {
      [MOBILE]: 'calc(var(--ifm-spacing-vertical) * 3)',
    },
  },
  title: {
    color: 'var(--ifm-footer-title-color)',
    fontFamily: 'var(--ifm-font-family-base)',
    fontSize: 'var(--ifm-h4-font-size)',
    fontWeight: 'var(--ifm-font-weight-bold)',
    lineHeight: 'var(--ifm-heading-line-height)',
    marginBottom: 'var(--ifm-heading-margin-bottom)',
  },
  list: {
    listStyle: 'none',
    marginBottom: 0,
    paddingLeft: 0,
  },
  item: {
    marginTop: 0,
  },
});

function ColumnLinkItem({ item, xstyle }) {
  return item.html ? (
    <li
      {...stylex.props(styles.item, xstyle)}
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: item.html }}
    />
  ) : (
    <li key={item.href ?? item.to} {...stylex.props(styles.item, xstyle)}>
      <LinkItem item={item} />
    </li>
  );
}

function Column({ column, xstyle }) {
  const columnProps = stylex.props(styles.col, xstyle);
  const { className: _colClass, ...columnRest } = columnProps;
  const columnClassName =
    [ThemeClassNames.layout.footer.column, columnProps.className]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div {...columnRest} className={columnClassName}>
      <div {...stylex.props(styles.title)}>{column.title}</div>
      <ul {...stylex.props(styles.list)}>
        {column.items.map((item, i) => (
          <ColumnLinkItem item={item} key={i} />
        ))}
      </ul>
    </div>
  );
}

export default function FooterLinksMultiColumn({ columns, xstyle }) {
  return (
    <div {...stylex.props(styles.row, xstyle)}>
      {columns.map((column, i) => (
        <Column column={column} key={i} />
      ))}
    </div>
  );
}
