'use client';

import * as stylex from '@stylexjs/stylex';
import { Info, TriangleAlert, CircleX, CircleCheck } from 'lucide-react';
import type { HTMLAttributes, ReactNode, CSSProperties } from 'react';
import { calloutMarker } from './mdx.stylex';

export type CalloutType =
  | 'info'
  | 'warn'
  | 'warning'
  | 'error'
  | 'success'
  | 'danger'
  | 'tip';

function resolveType(
  type: CalloutType,
): 'info' | 'warning' | 'error' | 'success' {
  if (type === 'warn' || type === 'danger') return 'warning';
  if (type === 'tip') return 'info';
  return type;
}

const CALLOUT_COLORS = {
  info: 'var(--color-fd-info, hsl(210, 100%, 50%))',
  warning: 'var(--color-fd-warning, hsl(38, 92%, 50%))',
  error: 'var(--color-fd-error, hsl(0, 84%, 60%))',
  success: 'var(--color-fd-success, hsl(142, 71%, 45%))',
} as const;

export interface CalloutProps extends Omit<CalloutContainerProps, 'title'> {
  title?: ReactNode;
  children: ReactNode;
}

export function Callout({ children, title, ...props }: CalloutProps) {
  return (
    <CalloutContainer {...props}>
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}

export interface CalloutContainerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> {
  /**
   * @defaultValue info
   */
  type?: CalloutType;
  /**
   * Force an icon
   */
  icon?: ReactNode;
  children: ReactNode;
}

export function CalloutContainer({
  type: inputType = 'info',
  icon,
  children,
  ...props
}: CalloutContainerProps) {
  const type = resolveType(inputType);
  const calloutColor = CALLOUT_COLORS[type];

  const defaultIcon = {
    info: <Info {...stylex.props(styles.icon)} />,
    warning: <TriangleAlert {...stylex.props(styles.icon)} />,
    error: <CircleX {...stylex.props(styles.icon)} />,
    success: <CircleCheck {...stylex.props(styles.icon)} />,
  }[type];

  return (
    <div
      {...stylex.props(styles.container, calloutMarker)}
      style={{ '--callout-color': calloutColor } as CSSProperties}
      {...props}
    >
      <div role="none" {...stylex.props(styles.indicator)} />
      {icon ?? defaultIcon}
      <div {...stylex.props(styles.content)}>{children}</div>
    </div>
  );
}

export interface CalloutTitleProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'className' | 'style'
> {
  children: ReactNode;
}

export function CalloutTitle({ children, ...props }: CalloutTitleProps) {
  return (
    <p {...stylex.props(styles.title)} {...props}>
      {children}
    </p>
  );
}

export interface CalloutDescriptionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> {
  children: ReactNode;
}

export function CalloutDescription({
  children,
  ...props
}: CalloutDescriptionProps) {
  return (
    <div {...stylex.props(styles.description)} {...props}>
      {children}
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    gap: 8,
    marginBlock: 16,
    borderRadius: 12,
    borderShape: 'squircle',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    backgroundColor: 'var(--color-fd-card)',
    padding: 12,
    paddingInlineStart: 4,
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-fd-card-foreground)',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  indicator: {
    width: 2,
    borderRadius: 2,
    backgroundColor:
      'color-mix(in srgb, var(--callout-color) 50%, transparent)',
    flexShrink: 0,
  },
  icon: {
    width: 20,
    height: 20,
    flexShrink: 0,
    marginInlineEnd: -2,
    fill: 'var(--callout-color)',
    color: 'var(--color-fd-card)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
    flex: 1,
  },
  title: {
    fontWeight: 500,
    marginTop: 0,
    marginBottom: 0,
  },
  description: {
    color: 'var(--color-fd-muted-foreground)',
  },
});
