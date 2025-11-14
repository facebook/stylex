'use client';

import type { ReactNode } from 'react';

export const TAB_ITEM_DISPLAY_NAME = 'MDXTabItem';

export type TabItemProps = {
  value: string;
  label: string;
  default?: boolean;
  children: ReactNode;
};

export default function TabItem(_: TabItemProps) {
  return null;
}

TabItem.displayName = TAB_ITEM_DISPLAY_NAME;
