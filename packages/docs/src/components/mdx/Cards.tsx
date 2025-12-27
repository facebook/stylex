'use client';

import { vars } from '@/theming/vars.stylex';
import * as stylex from '@stylexjs/stylex';
import BaseLink from 'fumadocs-core/link';
import type { HTMLAttributes, ReactNode } from 'react';

export interface CardsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  children: ReactNode;
}

export function Cards({ children, ...props }: CardsProps) {
  return (
    <div {...stylex.props(styles.cards)} {...props}>
      {children}
    </div>
  );
}

export interface CardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  external?: boolean;
  children?: ReactNode;
}

export function Card({
  icon,
  title,
  description,
  href,
  external,
  children,
  ...props
}: CardProps) {
  const content = (
    <>
      {icon != null && <div {...stylex.props(styles.icon)}>{icon}</div>}
      <h3 {...stylex.props(styles.title)}>{title}</h3>
      {description != null && (
        <p {...stylex.props(styles.description)}>{description}</p>
      )}
      {children != null && (
        <div {...stylex.props(styles.content)}>{children}</div>
      )}
    </>
  );

  if (href != null) {
    return (
      <BaseLink
        href={href}
        external={external}
        {...stylex.props(styles.card, styles.cardLink)}
        {...props}
        data-card
      >
        {content}
      </BaseLink>
    );
  }

  return (
    <div {...stylex.props(styles.card)} {...props} data-card>
      {content}
    </div>
  );
}

const DURATION = '0.2s';
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const styles = stylex.create({
  cards: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, 1fr)',
      '@media (max-width: 768px)': '1fr',
    },
    gap: 12,
    containerType: 'inline-size',
    marginTop: 12,
  },
  card: {
    display: 'block',
    backgroundColor: vars['--color-fd-card'],
    color: vars['--color-fd-card-foreground'],
    borderRadius: 12,
    borderShape: 'squircle',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars['--color-fd-border'],
    padding: 16,
    textDecoration: 'none',
    transitionProperty: 'background-color, border-color',
    transitionDuration: DURATION,
    transitionTimingFunction: EASING,
  },
  cardLink: {
    cursor: 'pointer',
    backgroundColor: {
      default: vars['--color-fd-card'],
      ':hover': 'light-dark(hsl(0, 0%, 97%), hsl(0, 0%, 16%))',
    },
    borderColor: {
      default: vars['--color-fd-border'],
      ':hover': vars['--color-fd-primary'],
    },
  },
  icon: {
    width: 'fit-content',
    marginBottom: 8,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars['--color-fd-border'],
    backgroundColor: vars['--color-fd-muted'],
    color: vars['--color-fd-muted-foreground'],
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  title: {
    marginTop: 0,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  description: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: vars['--color-fd-muted-foreground'],
  },
  content: {
    fontSize: 14,
    lineHeight: 1.5,
    color: vars['--color-fd-muted-foreground'],
  },
});
