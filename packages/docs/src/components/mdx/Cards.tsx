/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
        <div {...stylex.props(styles.description)}>{description}</div>
      )}
      {children != null && (
        <div {...stylex.props(styles.content)}>{children}</div>
      )}
    </>
  );

  if (href != null) {
    return (
      <BaseLink
        external={external}
        href={href}
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
    marginTop: 12,
    containerType: 'inline-size',
  },
  card: {
    display: 'block',
    padding: 16,
    color: vars['--color-fd-card-foreground'],
    textDecoration: 'none',
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
    cornerShape: 'squircle',
    transitionTimingFunction: EASING,
    transitionDuration: DURATION,
    transitionProperty: 'background-color, border-color',
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
    padding: 6,
    marginBottom: 8,
    color: vars['--color-fd-muted-foreground'],
    backgroundColor: vars['--color-fd-muted'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
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
