'use client';

import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import {
  buttonStyles,
  buttonSizeVariants,
  buttonVariantStyles,
  ButtonProps,
} from './ui/button';
import { type StyleXComponentProps } from './layout/shared';
import * as stylex from '@stylexjs/stylex';

interface SearchToggleProps
  extends Omit<StyleXComponentProps<'button'>, 'color'>,
    ButtonProps {
  hideIfDisabled?: boolean;
}

export function SearchToggle({
  hideIfDisabled,
  size = 'icon-sm',
  color = 'ghost',
  xstyle,
  ...props
}: SearchToggleProps) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      {...props}
      type="button"
      data-search=""
      aria-label="Open Search"
      onClick={() => {
        setOpenSearch(true);
      }}
      {...stylex.props(
        buttonStyles.base,
        buttonSizeVariants[size as keyof typeof buttonSizeVariants],
        buttonVariantStyles[color as keyof typeof buttonVariantStyles],
        xstyle,
      )}
    >
      <Search />
    </button>
  );
}

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
      type="button"
      data-search-full=""
      {...props}
      onClick={() => {
        setOpenSearch(true);
      }}
      {...stylex.props(styles.button, xstyle)}
    >
      <Search {...stylex.props(styles.size4)} />
      {text.search}
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
    alignItems: 'center',
    gap: 2 * 4,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',

    backgroundColor:
      'color-mix(in oklab, var(--bg-fd-secondary) 50%, transparent)',
    padding: 1.5 * 4,
    paddingInlineStart: 2 * 4,

    fontSize: `${14 / 16}rem`,
    color: {
      default: 'var(--text-fd-muted-foreground)',
      ':hover': 'var(--text-fd-accent-foreground)',
    },
    transitionProperty: 'color, background-color, border-color',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  size4: { width: 16, height: 16 },
  hotkeyContainer: {
    // ms-auto inline-flex gap-0.5
    marginInlineStart: 'auto',
    display: 'inline-flex',
    gap: 0.5 * 4,
  },
  hotkey: {
    // rounded-md border bg-fd-background px-1.5
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    backgroundColor: 'var(--bg-fd-background)',
    paddingInline: 1.5 * 4,
  },
});
