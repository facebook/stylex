import BaseLink from 'fumadocs-core/link';
import { ComponentProps } from 'react';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

export default function MDXLink({
  xstyle,
  ...props
}: Omit<ComponentProps<typeof BaseLink>, 'className' | 'style'> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <BaseLink {...stylex.props(styles.base, xstyle)} {...props}>
      {props.children}
    </BaseLink>
  );
}

const styles = stylex.create({
  base: {
    color: vars['--color-fd-primary'],
    textDecorationColor: {
      default: 'transparent',
      ':hover': 'currentColor',
      ':focus-visible': 'currentColor',
    },
  },
});
