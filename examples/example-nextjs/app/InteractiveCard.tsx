/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {
  spacing,
  text,
  globalTokens as $,
  colors,
} from './globalTokens.stylex';
import { useState } from 'react';

export const redTheme = stylex.createTheme(colors, {
  accent: '#e03131',
  accentLight: 'rgba(224, 49, 49, 0.08)',
  accentFaded: 'rgba(224, 49, 49, 0.19)',
});

export const greenTheme = stylex.createTheme(colors, {
  accent: '#2f9e44',
  accentLight: 'rgba(47, 158, 68, 0.08)',
  accentFaded: 'rgba(47, 158, 68, 0.19)',
});

export const blueTheme = stylex.createTheme(colors, {
  accent: '#1c7ed6',
  accentLight: 'rgba(28, 126, 214, 0.08)',
  accentFaded: 'rgba(28, 126, 214, 0.19)',
});

export const THEMES = [
  { name: 'Red', theme: redTheme },
  { name: 'Green', theme: greenTheme },
  { name: 'Blue', theme: blueTheme },
] as const;

type Props = Readonly<{
  themeIndex: number;
  onThemeChange: (_index: number) => void;
  isDark: boolean;
  onDarkModeChange: (_isDark: boolean) => void;
}>;

export default function InteractiveCard({
  themeIndex,
  onThemeChange,
  isDark,
  onDarkModeChange,
}: Props) {
  const [count, setCount] = useState(0);

  return (
    <div {...stylex.props(styles.card)}>
      <div {...stylex.props(styles.label)}>Theme</div>
      <div {...stylex.props(styles.themeRow)}>
        {THEMES.map((t, i) => (
          <button
            key={t.name}
            {...stylex.props(
              styles.themeButton,
              i === themeIndex && styles.themeButtonActive,
            )}
            onClick={() => onThemeChange(i)}
          >
            <span {...stylex.props(t.theme, styles.dot)} />
            {t.name}
          </button>
        ))}
      </div>
      <div {...stylex.props(styles.divider)} />
      <div {...stylex.props(styles.label)}>Mode</div>
      <div {...stylex.props(styles.themeRow)}>
        <button
          {...stylex.props(
            styles.themeButton,
            !isDark && styles.themeButtonActive,
          )}
          onClick={() => onDarkModeChange(false)}
        >
          Light
        </button>
        <button
          {...stylex.props(
            styles.themeButton,
            isDark && styles.themeButtonActive,
          )}
          onClick={() => onDarkModeChange(true)}
        >
          Dark
        </button>
      </div>
      <div {...stylex.props(styles.divider)} />
      <div {...stylex.props(styles.label)}>Counter</div>
      <div {...stylex.props(styles.counterRow)}>
        <button
          {...stylex.props(styles.counterButton)}
          onClick={() => setCount((c) => c - 1)}
        >
          -
        </button>
        <div
          {...stylex.props(
            styles.count,
            Math.abs(count) > 99 && styles.largeNumber,
          )}
        >
          {count}
        </div>
        <button
          {...stylex.props(styles.counterButton)}
          onClick={() => setCount((c) => c + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

const DARK = '@media (prefers-color-scheme: dark)' as const;

const styles = stylex.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.accent,
    backgroundColor: $.surfaceCard,
    boxShadow: $.surfaceCardShadow,
    fontFamily: $.fontSans,
    width: '100%',
    maxWidth: 400,
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: '300ms',
  },
  label: {
    fontSize: text.xs,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.accent,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  themeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  themeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingInline: spacing.sm,
    paddingBlock: spacing.xs,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.gray3,
      [DARK]: colors.gray8,
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        default: colors.gray2,
        [DARK]: colors.gray9,
      },
    },
    color: 'inherit',
    cursor: 'pointer',
    fontSize: text.sm,
    fontFamily: $.fontSans,
    transitionProperty: 'background-color, border-color',
    transitionDuration: '200ms',
  },
  themeButtonActive: {
    fontWeight: 600,
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: colors.accent,
  },
  divider: {
    height: 2,
    marginBlock: spacing.xxs,
    borderRadius: 1,
    backgroundColor: colors.accentFaded,
    transitionProperty: 'background-color',
    transitionDuration: '300ms',
  },
  counterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  counterButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.accent,
    color: colors.accent,
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        default: colors.gray2,
        [DARK]: colors.gray9,
      },
    },
    cursor: 'pointer',
    fontSize: text.h4,
    fontWeight: 300,
    fontFamily: $.fontSans,
    transitionProperty: 'background-color, transform, color, border-color',
    transitionDuration: '200ms',
    transform: {
      default: null,
      ':active': 'scale(0.95)',
    },
  },
  count: {
    fontSize: text.h2,
    fontWeight: 200,
    minWidth: 80,
    textAlign: 'center',
    fontFamily: $.fontMono,
    color: colors.accent,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  largeNumber: {
    fontSize: text.h3,
  },
});
