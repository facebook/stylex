'use client';

import { Moon, Sun, Airplay } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLayoutEffect, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { StyleXAttributes } from './layout/shared';

const itemVariants = stylex.create({
  base: {
    // size-6.5 rounded-full p-1.5 text-fd-muted-foreground
    width: 6.5 * 4,
    height: 6.5 * 4,
    borderRadius: 9999,
    padding: 1.5 * 4,
    color: 'var(--text-fd-muted-foreground)',
  },
  active: {
    backgroundColor: 'var(--bg-fd-accent)',
    color: 'var(--text-fd-accent-foreground)',
  },
});

const full = [
  ['light', Sun] as const,
  ['dark', Moon] as const,
  ['system', Airplay] as const,
];

export function ThemeToggle({
  xstyle,
  mode = 'light-dark',
  ...props
}: StyleXAttributes<HTMLElement> & {
  mode?: 'light-dark' | 'light-dark-system';
}) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const container = stylex.props(styles.container, xstyle);

  if (mode === 'light-dark') {
    const value = mounted ? resolvedTheme : null;

    return (
      <button
        aria-label={`Toggle Theme`}
        onClick={() => setTheme(value === 'light' ? 'dark' : 'light')}
        data-theme-toggle=""
        {...props}
        {...container}
      >
        {full.map(([key, Icon]) => {
          if (key === 'system') return;

          return (
            <Icon
              key={key}
              fill="currentColor"
              {...stylex.props(
                itemVariants.base,
                value === key && itemVariants.active,
              )}
            />
          );
        })}
      </button>
    );
  }

  const value = mounted ? theme : null;

  return (
    <div data-theme-toggle="" {...props} {...container}>
      {full.map(([key, Icon]) => (
        <button
          key={key}
          aria-label={key}
          onClick={() => setTheme(key)}
          {...stylex.props(
            itemVariants.base,
            value === key && itemVariants.active,
          )}
        >
          <Icon fill="currentColor" {...stylex.props(styles.sizeFull)} />
        </button>
      ))}
    </div>
  );
}

const styles = stylex.create({
  container: {
    // inline-flex items-center rounded-full border p-1
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    padding: 1 * 4,
  },
  sizeFull: {
    width: '100%',
    height: '100%',
  },
});
