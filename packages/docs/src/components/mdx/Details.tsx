/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { vars } from '@/theming/vars.stylex';
import * as stylex from '@stylexjs/stylex';
import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useId, createContext, Children, use } from 'react';
import { accordionContainerMarker } from './mdx.stylex';

const AccordionContext = createContext<string | null>(null);

export function Accordions({
  type,
  children,
}: {
  type: 'single' | 'multiple';
  children: ReactNode;
}) {
  const id = useId();

  return (
    <div {...stylex.props(styles.group, accordionContainerMarker)}>
      {type === 'single' ? (
        <AccordionContext value={id}>{children}</AccordionContext>
      ) : (
        children
      )}
    </div>
  );
}

export function Details({
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<'details'>, 'className' | 'style'>) {
  const id = use(AccordionContext);
  const [summary, ...content] = Children.toArray(children);

  return (
    <details
      {...stylex.props(
        styles.container,
        id != null && styles.grouped,
        stylex.defaultMarker(),
      )}
      {...props}
      {...(id != null && { name: id })}
    >
      {summary}
      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.contentInner)}>{content}</div>
      </div>
    </details>
  );
}

export function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <Details open={open}>
      <Summary>{title}</Summary>
      {children}
    </Details>
  );
}

export function Summary({
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<'summary'>, 'className' | 'style'> & {
  children: ReactNode;
}) {
  return (
    <summary {...stylex.props(styles.summary)} {...props}>
      <ChevronDown {...stylex.props(styles.chevron)} />
      {children}
    </summary>
  );
}

const DURATION = '0.3s';
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const styles = stylex.create({
  group: {
    overflow: 'hidden',
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 16,
    cornerShape: 'squircle',
  },
  container: {
    interpolateSize: 'allow-keywords',
    paddingBlock: 8,
    paddingInline: 16,
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: {
      default: 1,
      [stylex.when.ancestor(':where(*)', accordionContainerMarker)]: 0,
    },
    borderTopWidth: {
      default: 1,
      // eslint-disable-next-line @stylexjs/valid-styles
      [stylex.when.ancestor(':where(*)', accordionContainerMarker)]: {
        default: 1,
        ':first-child': 0,
      },
    },
    borderRadius: {
      default: 8,
      [stylex.when.ancestor(':where(*)', accordionContainerMarker)]: 0,
    },
    cornerShape: 'squircle',
    // eslint-disable-next-line @stylexjs/valid-styles
    '::details-content': {
      display: 'block',
      contentVisibility: 'visible',
    },
  },
  grouped: {
    borderTopWidth: { default: 0, ':first-child': 1 },
    borderStartStartRadius: { default: 0, ':first-child': 8 },
    borderStartEndRadius: { default: 0, ':first-child': 8 },
    borderEndStartRadius: { default: 0, ':last-child': 8 },
    borderEndEndRadius: { default: 0, ':last-child': 8 },
  },
  content: {
    display: 'grid',
    gridTemplateRows: {
      default: '0fr',
      [stylex.when.ancestor(':is([open])')]: '1fr',
    },
    transitionTimingFunction: EASING,
    transitionDuration: DURATION,
    transitionProperty: 'grid-template-rows',
  },
  contentInner: {
    overflow: 'hidden',
    opacity: {
      default: 0,
      [stylex.when.ancestor(':is([open])')]: 1,
    },
    transitionTimingFunction: EASING,
    transitionDuration: DURATION,
    transitionProperty: 'opacity',
  },
  summary: {
    position: 'relative',
    paddingInlineStart: 24,
    fontWeight: 500,
    color: vars['--color-fd-card-foreground'],
    cursor: 'default',
    listStyleType: 'none',
    // margin: '-1rem',
    // marginBottom: 'var(--summary-gap)',
    // paddingInlineStart: '2.2rem',
    // padding: '1rem',
  },
  chevron: {
    position: 'absolute',
    insetInlineStart: 0,
    top: 6,
    width: 16,
    height: 16,
    transform: {
      default: 'rotate(-90deg)',
      [stylex.when.ancestor(':is([open])')]: 'rotate(0deg)',
    },
    transitionTimingFunction: EASING,
    transitionDuration: DURATION,
    transitionProperty: 'transform',
  },
});
