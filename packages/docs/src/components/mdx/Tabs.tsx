/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import {
  Children,
  createContext,
  useMemo,
  use,
  useId,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { useStateWithCallback } from '@/hooks/useStateWithCallback';
import { vars } from '@/theming/vars.stylex';
import { tabsMarker } from './mdx.stylex';

const LabelSetterContext = createContext<
  (_index: number, _label: string) => void
>(() => {});
const ActiveTabContext = createContext<number>(0);
const TabIndexContext = createContext<number>(0);

export function Tabs({
  children,
  defaultValue,
  xstyle,
  ...rest
}: {
  children: ReactNode;
  defaultValue?: number;
  xstyle?: stylex.StyleXStyles;
}) {
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useStateWithCallback<number>(
    defaultValue ?? 0,
  );
  const items = useMemo(() => Children.toArray(children), [children]);
  const tabsRef = useRef<HTMLDivElement>(null);

  const setLabelForIndex = useCallback((index: number, label: string) => {
    setLabels((prev) => ({ ...prev, [index]: label }));
  }, []);

  if (items.length === 0) {
    return null;
  }

  const id = useId();

  return (
    <div {...rest} {...stylex.props(tabsStyles.root, tabsMarker, xstyle)}>
      <div
        aria-orientation="horizontal"
        role="tablist"
        {...stylex.props(tabsStyles.list)}
        ref={tabsRef}
      >
        {items.map((_, index) => (
          <button
            aria-controls={`panel-${id}-${index}`}
            aria-selected={index === activeTab}
            key={index}
            onClick={() => setActiveTab(index)}
            onKeyDown={(event) => {
              let newIndex = index;
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                newIndex = (index + 1) % items.length;
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                newIndex = (items.length + index - 1) % items.length;
              }
              setActiveTab(newIndex, () => {
                (
                  tabsRef.current?.children[newIndex] as HTMLButtonElement
                )?.focus();
              });
            }}
            role="tab"
            slot="tabs"
            type="button"
            {...stylex.props(
              tabsStyles.trigger,
              index === activeTab && tabsStyles.triggerActive,
            )}
          >
            {labels[index] ?? '...'}
          </button>
        ))}
      </div>

      <LabelSetterContext value={setLabelForIndex}>
        <ActiveTabContext value={activeTab}>
          {items.map((item, index) => (
            <TabIndexContext key={index} value={index}>
              {item}
            </TabIndexContext>
          ))}
        </ActiveTabContext>
      </LabelSetterContext>
    </div>
  );
}

export type TabItemProps = {
  label: string;
  children: ReactNode;
};

export function TabItem({ label, children }: TabItemProps) {
  const index = use(TabIndexContext);
  const activeTab = use(ActiveTabContext);
  const setLabelForIndex = use(LabelSetterContext);

  const isActive = activeTab === index;

  const panelId = useId();

  useLayoutEffect(() => {
    setLabelForIndex(index, label);
  }, [index, label]);

  return (
    <div hidden={!isActive} id={panelId} role="tabpanel">
      {children}
    </div>
  );
}

const tabsStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 16,
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
});
