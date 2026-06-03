/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import type { SVGProps } from 'react';
import { useTheme } from 'next-themes';
import { useLayoutEffect, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { StyleXAttributes } from './layout/shared';
import { vars } from '@/theming/vars.stylex';

type ThemeKey = 'light' | 'dark' | 'system';

const items: { key: ThemeKey; Icon: typeof SunIcon; label: string }[] = [
  { key: 'light', Icon: SunIcon, label: 'Light theme' },
  { key: 'dark', Icon: MoonIcon, label: 'Dark theme' },
  { key: 'system', Icon: SparklesIcon, label: 'System theme' },
];

export function ThemeToggle({
  xstyle,
  mode = 'light-dark-system',
  ...props
}: StyleXAttributes<HTMLElement> & {
  mode?: 'light-dark' | 'light-dark-system';
}) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const current =
    mode === 'light-dark'
      ? mounted
        ? (resolvedTheme ?? null)
        : null
      : mounted
        ? (theme as ThemeKey | null)
        : null;

  const visibleItems =
    mode === 'light-dark' ? items.filter((i) => i.key !== 'system') : items;

  return (
    <div
      data-theme-toggle=""
      {...props}
      {...stylex.props(styles.container, xstyle)}
    >
      {visibleItems.map(({ key, Icon, label }) => {
        const isActive = current === key;

        const nextTheme =
          mode === 'light-dark' && key === 'system' ? 'system' : key;

        return (
          <button
            aria-label={label}
            key={key}
            onClick={() => setTheme(nextTheme)}
            type="button"
            {...stylex.props(
              styles.item,
              isActive && styles.itemActive,
              visibleItems.length === 3 && styles.itemGrow,
            )}
          >
            <Icon {...stylex.props(styles.icon)} />
          </button>
        );
      })}
    </div>
  );
}

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );
}

function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
      <circle cx="4" cy="20" r="2" />
    </svg>
  );
}

const styles = stylex.create({
  container: {
    display: { default: 'inline-flex', '@media (max-width: 420px)': 'none' },
    gap: 2,
    alignItems: 'center',
    padding: 0.5 * 4,
    overflow: 'hidden',
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 999,
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 7 * 4,
    minHeight: 7 * 4,
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':focus-visible': vars['--color-fd-foreground'],
      ':hover': vars['--color-fd-foreground'],
    },
    outline: 'none',
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in oklab, ${vars['--color-fd-primary']} 10%, ${vars['--color-fd-background']})`,
    },
    borderWidth: 0,
    borderRadius: 999,
    boxShadow: {
      default: 'none',
      ':focus-visible': `0 0 0 2px ${vars['--color-fd-primary']}`,
    },
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
    transitionProperty: 'background-color, color, box-shadow',
  },
  itemGrow: {
    flexGrow: 1,
    width: 'auto',
  },
  itemActive: {
    color: vars['--color-fd-primary'],
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-primary']} 12%, ${vars['--color-fd-background']})`,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
