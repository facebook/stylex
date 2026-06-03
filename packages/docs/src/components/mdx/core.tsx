/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';
import type { ComponentPropsWithoutRef } from 'react';
import { vars } from '@/theming/vars.stylex';

export function P({
  xstyle,
  ...props
}: Omit<ComponentPropsWithoutRef<'p'>, 'className' | 'style'> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <p {...stylex.props(styles.p, stylex.defaultMarker(), xstyle)} {...props} />
  );
}

export function Ul({
  xstyle,
  ...props
}: Omit<ComponentPropsWithoutRef<'ul'>, 'className' | 'style'> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <ul
      {...stylex.props(styles.list, styles.ul, stylex.defaultMarker(), xstyle)}
      {...props}
    />
  );
}

export function Ol({
  xstyle,
  ...props
}: Omit<ComponentPropsWithoutRef<'ol'>, 'className' | 'style'> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <ol
      {...stylex.props(styles.list, styles.ol, stylex.defaultMarker(), xstyle)}
      {...props}
    />
  );
}

export function Li({
  xstyle,
  ...props
}: Omit<ComponentPropsWithoutRef<'li'>, 'className' | 'style'> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <li
      {...stylex.props(styles.li, stylex.defaultMarker(), xstyle)}
      {...props}
    />
  );
}

const styles = stylex.create({
  p: {
    marginTop: {
      default: '1.25em',
      ':first-child': 0,
    },
    marginBottom: {
      default: '1.25em',
      ':last-child': 0,
    },
    fontSize: '1rem',
    lineHeight: 1.65,
    color: vars['--color-fd-foreground'],
  },
  list: {
    paddingInlineStart: '1.25rem',
    marginTop: {
      default: '1.25em',
      [stylex.when.ancestor(':where(p)')]: 0,
      [stylex.when.ancestor(':where(ul, ol)')]: '0.75em',
    },
  },
  ul: {
    listStyleType: 'disc',
  },
  ol: {
    listStyleType: {
      default: 'decimal',
      ':is([type="A"])': 'upper-alpha',
      ':is([type="I"])': 'upper-roman',
      ':is([type="a"])': 'lower-alpha',
      ':is([type="i"])': 'lower-roman',
    },
  },
  li: {
    paddingInlineStart: {
      default: 0,
      [stylex.when.ancestor(':where(ol)')]: '0.375em',
      [stylex.when.ancestor(':where(ul)')]: 0,
    },
    marginBlock: '0.5em',
  },
});
