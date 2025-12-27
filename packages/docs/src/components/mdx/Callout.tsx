import * as stylex from '@stylexjs/stylex';
import { Info, TriangleAlert, CircleX, CircleCheck } from 'lucide-react';
import type { HTMLAttributes, ReactNode, CSSProperties } from 'react';
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

  const defaultIcon = {
    info: <Info {...stylex.props(iconStyles.base, iconStyles[type])} />,
    warning: (
      <TriangleAlert {...stylex.props(iconStyles.base, iconStyles[type])} />
    ),
    error: <CircleX {...stylex.props(iconStyles.base, iconStyles[type])} />,
    success: (
      <CircleCheck {...stylex.props(iconStyles.base, iconStyles[type])} />
    ),
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

const iconStyles = stylex.create({
  base: {
    width: 20,
    height: 20,
    flexShrink: 0,
    marginInlineEnd: -2,
    fill: vars['--color-fd-card'],
    color: vars['--color-fd-card'],
  },
  info: { fill: vars['--color-fd-info'] },
  warning: { fill: vars['--color-fd-warning'] },
  error: { fill: vars['--color-fd-error'] },
  success: { fill: vars['--color-fd-success'] },
});

const indicatorStyles = stylex.create({
  base: {
    width: 2,
    borderRadius: 2,
    backgroundColor: `color-mix(in srgb, currentColor 50%, transparent)`,
    // boxShadow: '0 0 16px color-mix(in srgb, currentColor 50%, transparent)',
    flexShrink: 0,
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
    marginBlock: 16,
    borderRadius: 12,
    borderShape: 'squircle',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars['--color-fd-border'],
    backgroundColor: vars['--color-fd-card'],
    padding: 12,
    paddingInlineStart: 4,
    fontSize: 14,
    lineHeight: 1.5,
    color: vars['--color-fd-card-foreground'],
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
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
    color: vars['--color-fd-muted-foreground'],
  },
});
