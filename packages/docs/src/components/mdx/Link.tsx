/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
    color: {
      default: vars['--color-fd-primary'],
      [stylex.when.descendant(':is(code)')]: vars['--color-code-green'],
    },
    textDecoration: {
      default: 'none',
      ':focus-visible': 'underline',
      ':hover': 'underline',
    },
    textDecorationThickness: '2px',
    textDecorationColor: {
      default: 'transparent',
      ':focus-visible': 'color-mix(in srgb, currentColor 50%, transparent)',
      ':hover': 'color-mix(in srgb, currentColor 50%, transparent)',
    },
    textUnderlineOffset: '4px',
  },
});
