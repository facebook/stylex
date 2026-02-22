/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as stylex from '@stylexjs/stylex';
import {
  globalTokens as $,
  spacing,
  text,
  colors,
} from '@/app/globalTokens.stylex';
import { cardMarker, headingMarker } from './CardTokens.stylex';

type Props = Readonly<{
  title: string;
  body: string;
  href: string;
}>;

export default function Card({ title, body, href }: Props) {
  return (
    <a
      {...stylex.props(styles.link, cardMarker)}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 {...stylex.props(styles.h2, headingMarker)}>
        {title} <span {...stylex.props(styles.span)}>→</span>
      </h2>
      <p {...stylex.props(styles.p)}>{body}</p>
    </a>
  );
}

type TMobile = '@media (max-width: 700px)';

const MOBILE: TMobile = '@media (max-width: 700px)' as TMobile;
const REDUCE_MOTION = '@media (prefers-reduced-motion: reduce)' as const;

const DARK = '@media (prefers-color-scheme: dark)' as const;

const styles = stylex.create({
  link: {
    display: {
      default: 'flex',
      [MOBILE]: 'block',
    },
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderRadius: spacing.sm,
    backgroundColor: {
      default: 'transparent',
      ':hover': $.surfaceHover,
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.gray2,
      ':hover': colors.accent,
      [DARK]: {
        default: colors.gray8,
        ':hover': colors.accent,
      },
    },
    color: 'inherit',
    fontFamily: $.fontSans,
    padding: spacing.md,
    transitionProperty: 'background-color, border-color, transform, box-shadow',
    transitionDuration: '300ms',
    textAlign: 'center',
    textDecoration: 'none',
    transform: {
      default: null,
      ':hover': 'translateY(-2px)',
    },
    boxShadow: {
      default: 'none',
      ':hover': '0 4px 16px rgba(0, 0, 0, 0.08)',
    },
  },
  h2: {
    color: colors.accent,
    fontSize: text.h4,
    fontWeight: 600,
    marginBottom: {
      default: spacing.xs,
      [MOBILE]: spacing.xxs,
    },
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  span: {
    display: 'inline-block',
    transitionProperty: 'transform',
    transform: {
      default: null,
      [stylex.when.ancestor(':hover', cardMarker)]: 'translateX(10px)',
      [stylex.when.ancestor(':hover', headingMarker)]: 'translateX(4px)',
    },
    transitionDuration: {
      default: '200ms',
      [REDUCE_MOTION]: '0s',
    },
  },
  p: {
    margin: 0,
    opacity: 0.6,
    fontSize: text.p,
    textWrap: 'balance',
    lineHeight: 1.5,
    maxWidth: '30ch',
  },
});
