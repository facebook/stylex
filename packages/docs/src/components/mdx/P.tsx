import * as stylex from '@stylexjs/stylex';
import { Link } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { calloutMarker } from './mdx.stylex';

export default function P({
  xstyle,
  ...props
}: Omit<ComponentPropsWithoutRef<'p'>, 'className' | 'style'> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return <p {...stylex.props(styles.p, xstyle)} {...props} />;
}

const styles = stylex.create({
  p: {
    marginBlock: {
      default: '1.25em',
      ':first-child': 0,
      ':last-child': 0,
    },
  },
});
