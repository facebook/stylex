'use client';

import { type ButtonHTMLAttributes } from 'react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { buttonStyles, buttonVariantStyles } from './ui/button';
import { StyleXAttributes } from './layout/shared';
import * as stylex from '@stylexjs/stylex';

export type LanguageSelectProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> & {
  xstyle?: stylex.StyleXStyles;
};

export function LanguageToggle({
  xstyle,
  ...props
}: LanguageSelectProps): React.ReactElement {
  const context = useI18n();
  if (!context.locales) throw new Error('Missing `<I18nProvider />`');

  return (
    <Popover>
      <PopoverTrigger
        aria-label={context.text.chooseLanguage}
        {...props}
        {...stylex.props(
          buttonStyles.base,
          buttonVariantStyles.ghost,
          styles.trigger,
          xstyle,
        )}
      >
        {props.children}
      </PopoverTrigger>
      <PopoverContent xstyle={styles.content}>
        <p {...stylex.props(styles.para)}>{context.text.chooseLanguage}</p>
        {context.locales.map((item) => (
          <button
            key={item.locale}
            type="button"
            {...stylex.props(
              styles.button,
              item.locale === context.locale && styles.buttonActive,
            )}
            onClick={() => {
              context.onChange?.(item.locale);
            }}
          >
            {item.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
const styles = stylex.create({
  trigger: { gap: 1.5 * 4, padding: 1.5 * 4 },
  content: {
    // "flex flex-col overflow-x-hidden p-0"
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    padding: 0,
  },
  para: {
    // "mb-1 p-2 text-xs font-medium text-fd-muted-foreground"
    marginBottom: 1 * 4,
    padding: 2 * 4,
    fontSize: `${10 / 16}rem`,
    fontWeight: 500,
    color: 'var(--text-fd-muted-foreground)',
  },
  button: {
    // 'p-2 text-start text-sm',
    padding: 2 * 4,
    textAlign: 'start',
    fontSize: `${12 / 16}rem`,
    lineHeight: 1.4,
    backgroundColor: {
      default: null,
      ':hover': 'var(--bg-fd-accent)',
    },
    color: { default: null, ':hover': 'var(--text-fd-accent-foreground)' },
  },
  buttonActive: {
    // 'bg-fd-primary/10 font-medium text-fd-primary'
    backgroundColor:
      'color-mix(in oklab, var(--bg-fd-primary) 10%, transparent)',
    fontWeight: 500,
    color: 'var(--text-fd-primary)',
  },
});

export function LanguageToggleText({
  xstyle,
  ...props
}: StyleXAttributes<HTMLSpanElement>): React.ReactElement {
  const context = useI18n();
  const text = context.locales?.find(
    (item) => item.locale === context.locale,
  )?.name;

  return (
    <span {...props} {...stylex.props(xstyle)}>
      {text}
    </span>
  );
}
