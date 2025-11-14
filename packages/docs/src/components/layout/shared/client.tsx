'use client';

import { usePathname } from 'fumadocs-core/framework';
import { isActive } from '../../../lib/is-active';
import Link from 'fumadocs-core/link';
import type { BaseLinkType, StyleXComponentProps } from './index';
import * as stylex from '@stylexjs/stylex';

export function BaseLinkItem({
  ref,
  item,
  xstyle,
  ...props
}: Omit<StyleXComponentProps<'a'>, 'href'> & { item: BaseLinkType }) {
  const pathname = usePathname();
  const activeType = item.active ?? 'url';
  const active =
    activeType !== 'none' &&
    isActive(item.url, pathname, activeType === 'nested-url');

  return (
    <Link
      ref={ref}
      href={item.url}
      external={item.external}
      {...props}
      {...stylex.props(xstyle)}
      data-active={active}
    >
      {props.children}
    </Link>
  );
}
