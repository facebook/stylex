/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { type StyleXComponentProps } from './layout/shared';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

export function LargeSearchToggle({
  hideIfDisabled,
  xstyle,
  ...props
}: StyleXComponentProps<'button'> & {
  hideIfDisabled?: boolean;
}) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      data-search-full=""
      type="button"
      {...props}
      onClick={() => {
        setOpenSearch(true);
      }}
      {...stylex.props(styles.button, xstyle)}
    >
      <Search {...stylex.props(styles.size4)} />
      <span {...stylex.props(styles.text)}>{text.search}</span>
      <div {...stylex.props(styles.hotkeyContainer)}>
        {hotKey.map((k, i) => (
          <kbd key={i} {...stylex.props(styles.hotkey)}>
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}

const styles = stylex.create({
  button: {
    // '  text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground'
    display: 'inline-flex',
    gap: 2 * 4,
    alignItems: 'center',
    width: '100%',
    minWidth: 90,
    padding: 1.5 * 4,
    paddingInlineStart: 2.5 * 4,

    fontSize: `${14 / 16}rem`,
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':focus-visible': vars['--color-fd-foreground'],
      ':hover': vars['--color-fd-foreground'],
    },
    outline: 'none',

    backgroundColor: {
      default: 'transparent',
      ':focus-visible': `color-mix(in oklab, ${vars['--color-fd-primary']} 5%, transparent)`,
      ':hover': `color-mix(in oklab, ${vars['--color-fd-primary']} 5%, transparent)`,
    },
    borderColor: {
      default: vars['--color-fd-border'],
      ':focus-visible': vars['--color-fd-primary'],
      ':hover': vars['--color-fd-primary'],
    },
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: '9999px',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

    transitionDuration: '150ms',
    transitionProperty: 'color, background-color, border-color',
  },
  text: {
    display: {
      default: null,
      '@container (width < 240px)': 'none',
    },
  },
  size4: { width: 16, height: 16 },
  hotkeyContainer: {
    display: 'inline-flex',
    gap: 0.5 * 4,
    marginInlineStart: 'auto',
  },
  hotkey: {
    paddingInline: 1.5 * 4,
    backgroundColor: vars['--color-fd-background'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
  },
});
