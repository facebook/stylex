/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
