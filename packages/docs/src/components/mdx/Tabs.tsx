'use client';

import * as stylex from '@stylexjs/stylex';
import type {
  ComponentProps,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from 'react';
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TAB_ITEM_DISPLAY_NAME, type TabItemProps } from './TabItem';
import { useStateWithCallback } from '@/hooks/useStateWithCallback';

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
        role="tablist"
        aria-orientation="horizontal"
        {...stylex.props(tabsStyles.list)}
      >
        {items.map(({ value: tabValue, label }, index) => {
          const isActive = tabValue === value;
          const safeValue = sanitizeValue(tabValue);
          const tabId = `${tabsId}-tab-${safeValue}`;
          const panelId = `${tabsId}-panel-${safeValue}`;

          return (
            <button
              key={tabValue}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => {
                tabsRef.current[tabValue] = el;
              }}
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
              key={tabValue}
              role="tabpanel"
              id={panelId}
              aria-labelledby={tabId}
              hidden={!isActive}
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
    width: 'fit-content',
    alignItems: 'center',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
  },
  trigger: {
    cursor: 'pointer',
    appearance: 'none',
    width: '100%',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--color-fd-muted)',
    },
    color: {
      default: 'var(--color-fd-muted-foreground)',
      ':hover': 'var(--color-fd-foreground)',
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 10,
    paddingInline: 12,
    paddingBlock: 8,
    textAlign: 'center',
    fontSize: `${14 / 16}rem`,
    fontWeight: 600,
    lineHeight: 1.4,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    outline: 'none',
  },
  triggerActive: {
    color: 'var(--color-fd-foreground)',
    backgroundColor: 'var(--color-fd-card)',
    borderColor: {
      default: 'var(--color-fd-border)',
      ':focus-visible': 'var(--color-fd-ring)',
    },
  },
  panelHidden: {
    display: 'none',
  },
});
