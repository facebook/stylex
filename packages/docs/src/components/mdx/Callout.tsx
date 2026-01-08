/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';
import { Info, TriangleAlert, CircleX, CircleCheck } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { calloutMarker } from './mdx.stylex';
import { vars } from '@/theming/vars.stylex';

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

export interface CalloutProps extends CalloutContainerProps {
  children: ReactNode;
}

export function Callout({ children, title, ...props }: CalloutProps) {
  return (
    <CalloutContainer title={title} {...props}>
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}

export interface CalloutContainerProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'className' | 'style' | 'title'
  > {
  /**
   * @defaultValue info
   */
  type?: CalloutType;
  /**
   * Force an icon
   */
  icon?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
}

export function CalloutContainer({
  type: inputType = 'info',
  icon,
  children,
  title,
  ...props
}: CalloutContainerProps) {
  const type = resolveType(inputType);

  const iconStyleProps = stylex.props(
    iconStyles.base,
    title !== undefined && iconStyles.withTitle,
    iconStyles[type],
  );

  const defaultIcon = {
    info: <Info {...iconStyleProps} />,
    warning: <TriangleAlert {...iconStyleProps} />,
    error: <CircleX {...iconStyleProps} />,
    success: <CircleCheck {...iconStyleProps} />,
  }[type];

  return (
    <div
      {...stylex.props(styles.container, containerStyles[type], calloutMarker)}
      {...props}
    >
      <div
        role="none"
        {...stylex.props(indicatorStyles.base, indicatorStyles[type])}
      />
      {icon ?? defaultIcon}
      <div {...stylex.props(styles.content)}>{children}</div>
    </div>
  );
}

export interface CalloutTitleProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, 'className' | 'style'> {
  children: ReactNode;
}

export function CalloutTitle({ children, ...props }: CalloutTitleProps) {
  return (
    <p {...stylex.props(styles.title)} {...props}>
      {children}
    </p>
  );
}

export interface CalloutDescriptionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
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

const iconStyles = stylex.create({
  base: {
    flexShrink: 0,
    width: 20,
    height: 'calc(16px * 1.65)',
    marginInlineEnd: -2,
    color: vars['--color-fd-card'],
    fill: vars['--color-fd-card'],
  },
  withTitle: {
    height: 'calc(14px * 1.5)',
  },
  info: { fill: vars['--color-fd-info'] },
  warning: { fill: vars['--color-fd-warning'] },
  error: { fill: vars['--color-fd-error'] },
  success: { fill: vars['--color-fd-success'] },
});

const indicatorStyles = stylex.create({
  base: {
    flexShrink: 0,
    width: 2,
    backgroundColor: 'color-mix(in srgb, currentColor 50%, transparent)',
    borderRadius: 2,
  },
  info: { color: vars['--color-fd-info'] },
  warning: { color: vars['--color-fd-warning'] },
  error: { color: vars['--color-fd-error'] },
  success: { color: vars['--color-fd-success'] },
});

const containerStyles = stylex.create({
  info: {
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-info']} 10%, ${vars['--color-fd-card']})`,
  },
  warning: {
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-warning']} 10%, ${vars['--color-fd-card']})`,
  },
  error: {
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-error']} 10%, ${vars['--color-fd-card']})`,
  },
  success: {
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-success']} 10%, ${vars['--color-fd-card']})`,
  },
});

const styles = stylex.create({
  container: {
    display: 'flex',
    gap: 8,
    padding: 12,
    paddingInlineStart: 4,
    marginBlock: 16,
    fontSize: 14,
    lineHeight: 1.5,
    color: vars['--color-fd-card-foreground'],
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
    cornerShape: 'squircle',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },

  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
  },
  title: {
    marginTop: 0,
    marginBottom: 0,
    fontWeight: 500,
  },
  description: {
    color: vars['--color-fd-muted-foreground'],
  },
});
