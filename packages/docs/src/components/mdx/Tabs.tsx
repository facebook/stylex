/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import { TAB_ITEM_DISPLAY_NAME, type TabItemProps } from './TabItem';
import { useStateWithCallback } from '@/hooks/useStateWithCallback';
import { vars } from '@/theming/vars.stylex';

const sanitizeValue = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tab';

const getItemsFromChildren = (children: ReactNode) => {
  const items: TabItemProps[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<TabItemProps>;
    if (
      (element.type as { displayName?: string }).displayName !==
      TAB_ITEM_DISPLAY_NAME
    ) {
      return;
    }

    items.push(element.props);
  });
  return items;
};

export default function Tabs({
  children,
  defaultValue,
  xstyle,
  ...rest
}: {
  children: ReactNode;
  defaultValue?: string;
  xstyle?: stylex.StyleXStyles;
}) {
  const items = useMemo(() => getItemsFromChildren(children), [children]);

  if (items.length === 0) {
    return null;
  }

  const [value, setValue] = useStateWithCallback(defaultValue);
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const tabsId = useId();

  return (
    <div {...rest} {...stylex.props(tabsStyles.root, xstyle)}>
      <div
        aria-orientation="horizontal"
        role="tablist"
        {...stylex.props(tabsStyles.list)}
      >
        {items.map(({ value: tabValue, label }, index) => {
          const isActive = tabValue === value;
          const safeValue = sanitizeValue(tabValue);
          const tabId = `${tabsId}-tab-${safeValue}`;
          const panelId = `${tabsId}-panel-${safeValue}`;

          return (
            <button
              aria-controls={panelId}
              aria-selected={isActive}
              id={tabId}
              key={tabValue}
              onClick={() => setValue(tabValue)}
              onKeyDown={(event) => {
                let newValue = null;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                  newValue = items[(index + 1) % items.length]?.value;
                } else if (
                  event.key === 'ArrowLeft' ||
                  event.key === 'ArrowUp'
                ) {
                  newValue =
                    items[(items.length + index - 1) % items.length]?.value;
                }

                if (newValue) {
                  setValue(newValue, () => {
                    tabsRef.current[newValue]?.focus();
                  });
                }
              }}
              ref={(el) => {
                tabsRef.current[tabValue] = el;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              {...stylex.props(
                tabsStyles.trigger,
                isActive && tabsStyles.triggerActive,
              )}
            >
              {label ?? tabValue}
            </button>
          );
        })}
      </div>
      <div>
        {items.map(({ value: tabValue, children: tabChildren }) => {
          const isActive = tabValue === value;
          const safeValue = sanitizeValue(tabValue);
          const tabId = `${tabsId}-tab-${safeValue}`;
          const panelId = `${tabsId}-panel-${safeValue}`;

          return (
            <div
              aria-labelledby={tabId}
              hidden={!isActive}
              id={panelId}
              key={tabValue}
              role="tabpanel"
              {...stylex.props(!isActive && tabsStyles.panelHidden)}
            >
              {tabChildren}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const tabsStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  list: {
    display: 'inline-grid',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    alignItems: 'center',
    width: 'fit-content',
  },
  trigger: {
    width: '100%',
    paddingBlock: 8,
    paddingInline: 12,
    fontSize: `${14 / 16}rem`,
    fontWeight: 600,
    lineHeight: 1.4,
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':hover': vars['--color-fd-foreground'],
    },
    textAlign: 'center',
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: {
      default: 'transparent',
      ':hover': vars['--color-fd-muted'],
    },
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
    transitionTimingFunction: 'ease',
    transitionDuration: '150ms',
    transitionProperty: 'color, background-color, border-color, box-shadow',
  },
  triggerActive: {
    color: vars['--color-fd-foreground'],
    backgroundColor: vars['--color-fd-card'],
    borderColor: {
      default: vars['--color-fd-border'],
      ':focus-visible': vars['--color-fd-ring'],
    },
  },
  panelHidden: {
    display: 'none',
  },
});
