'use client';

import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import {
  Tabs as BaseTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs.unstyled';
import {
  TAB_ITEM_DISPLAY_NAME,
  type TabItemProps,
} from '@/components/mdx/TabItem';

type BaseTabsProps = ComponentProps<typeof BaseTabs>;

type TabsProps = {
  children: ReactNode;
} & Omit<BaseTabsProps, 'children' | 'defaultValue'> & {
  defaultValue?: string;
};

const getItemsFromChildren = (children: ReactNode) => {
  const items: TabItemProps[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    const element = child as ReactElement<TabItemProps>;
    if ((element.type as { displayName?: string }).displayName !== TAB_ITEM_DISPLAY_NAME) {
      return;
    }
    items.push(element.props);
  });
  return items;
};

export default function Tabs({
  children,
  defaultValue,
  ...rest
}: TabsProps) {
  const items = getItemsFromChildren(children);
  if (items.length === 0) {
    return null;
  }

  const explicitDefault = items.find((item) => item.default)?.value;
  const computedDefault = explicitDefault ?? defaultValue ?? items[0]?.value;

  const { value, onValueChange, ...otherProps } = rest as {
    value?: string;
    onValueChange?: (nextValue: string) => void;
  };

  const tabsProps: BaseTabsProps = {
    ...otherProps,
    value,
    onValueChange,
    defaultValue: value === undefined ? computedDefault : undefined,
  };

  return (
    <BaseTabs {...tabsProps}>
      <TabsList>
        {items.map(({ value: tabValue, label }) => (
          <TabsTrigger key={tabValue} value={tabValue}>
            {label ?? tabValue}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map(({ value: tabValue, children: tabChildren }) => (
        <TabsContent key={tabValue} value={tabValue}>
          {tabChildren}
        </TabsContent>
      ))}
    </BaseTabs>
  );
}
