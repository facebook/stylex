'use client';
import type { ComponentProps } from 'react';
import { usePathname } from 'fumadocs-core/framework';
import { isActive } from '@/ui/src/utils/is-active';
import Link from 'fumadocs-core/link';
import type { BaseLinkType } from '@/ui/src/layouts/shared';

export function BaseLinkItem({
  ref,
  item,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { item: BaseLinkType }) {
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
      data-active={active}
    >
      {props.children}
    </Link>
  );
}
