import * as stylex from '@stylexjs/stylex';
import { Link } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { headingMarker } from './mdx.stylex';

type Types = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingProps<T extends Types> = Omit<
  ComponentPropsWithoutRef<T>,
  'as' | 'className' | 'style'
> & {
  as?: T;
  xstyle?: stylex.StyleXStyles;
};

export default function Heading<T extends Types = 'h1'>({
  as,
  xstyle,
  ...props
}: HeadingProps<T>): ReactElement {
  const As = as ?? 'h1';

  if (!props.id) return <As {...stylex.props(xstyle)} {...props} />;

  return (
    <As {...stylex.props(styles.heading, headingMarker, xstyle)} {...props}>
      <a data-card="" href={`#${props.id}`} {...stylex.props(styles.anchor)}>
        {props.children}
      </a>
      <Link aria-hidden {...stylex.props(styles.icon)} />
    </As>
  );
}

const styles = stylex.create({
  heading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    scrollMarginTop: '7rem',
  },
  anchor: {
    textDecoration: 'none',
    color: 'inherit',
    gap: 8,
    display: 'inline-flex',
  },
  icon: {
    width: 14,
    height: 14,
    flexShrink: 0,
    color: 'var(--color-fd-muted-foreground)',
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover', headingMarker)]: 1,
    },
    transitionProperty: 'opacity',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
  },
});
