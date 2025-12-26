'use client';

import * as stylex from '@stylexjs/stylex';
import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useId, createContext, Children, use } from 'react';

const AccordianContext = createContext<string | null>(null);

export function Accordions({
  type,
  children,
}: {
  type: 'single' | 'multiple';
  children: ReactNode;
}) {
  const id = useId();

  return (
    <div>
      {type === 'single' ? (
        <AccordianContext value={id}>{children}</AccordianContext>
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
  const id = use(AccordianContext);
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
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Details>
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
  container: {
    backgroundColor: 'var(--color-fd-card)',
    borderRadius: 8,
    borderShape: 'squircle',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    paddingInline: 16,
    paddingBlock: 8,
    interpolateSize: 'allow-keywords',
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
    transitionProperty: 'grid-template-rows',
    transitionDuration: DURATION,
    transitionTimingFunction: EASING,
  },
  contentInner: {
    overflow: 'hidden',
    opacity: {
      default: 0,
      [stylex.when.ancestor(':is([open])')]: 1,
    },
    transitionProperty: 'opacity',
    transitionDuration: DURATION,
    transitionTimingFunction: EASING,
  },
  summary: {
    fontWeight: 500,
    color: 'var(--color-fd-card-foreground)',
    cursor: 'default',
    listStyleType: 'none',
    paddingInlineStart: 24,
    position: 'relative',
    // margin: '-1rem',
    // marginBottom: 'var(--summary-gap)',
    // paddingInlineStart: '2.2rem',
    // padding: '1rem',
  },
  chevron: {
    width: 16,
    height: 16,
    position: 'absolute',
    top: 6,
    insetInlineStart: 0,
    transform: {
      default: 'rotate(-90deg)',
      [stylex.when.ancestor(':is([open])')]: 'rotate(0deg)',
    },
    transitionProperty: 'transform',
    transitionDuration: DURATION,
    transitionTimingFunction: EASING,
  },
});
