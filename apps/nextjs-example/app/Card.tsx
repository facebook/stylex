/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import stylex from '@stylexjs/stylex';
import { globalTokens as $, spacing, text } from './globalTokens.stylex';
import { colors } from '@stylexjs/open-props/lib/colors.stylex';
import { tokens } from './CardTokens.stylex';

type Props = Readonly<{
  title: string;
  body: string;
  href: string;
}>;

export default function Card({ title, body, href }: Props) {
  return (
    <a
      {...stylex.props(styles.link)}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 {...stylex.props(styles.h2)}>
        {title} <span {...stylex.props(styles.span)}>→</span>
      </h2>
      <p {...stylex.props(styles.p)}>{body}</p>
    </a>
  );
}

type TMobile = '@media (max-width: 700px)';

const MOBILE: TMobile = '@media (max-width: 700px)' as TMobile;
const REDUCE_MOTION = '@media (prefers-reduced-motion: reduce)' as const;

const bgDefault = `rgba(${$.cardR}, ${$.cardG}, ${$.cardB}, 0)` as const;

const styles = stylex.create({
  link: {
    display: {
      default: 'flex',
      [MOBILE]: 'block',
    },
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderRadius: spacing.xs,
    backgroundColor: {
      default: bgDefault,
      ':hover': `rgba(${$.cardR}, ${$.cardG}, ${$.cardB}, 0.1)`,
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: `rgba(${$.cardBorderR}, ${$.cardBorderG}, ${$.cardBorderB}, 0)`,
      ':hover': `rgba(${$.cardBorderR}, ${$.cardBorderG}, ${$.cardBorderB}, 0.1)`,
    },
    color: 'inherit',
    fontFamily: $.fontSans,
    padding: spacing.sm,
    transitionProperty: 'background-color, border-color',
    transitionDuration: '400ms',
    textAlign: 'center',
    textDecoration: 'none',
    [tokens.arrowTransform]: {
      default: 'translateX(0)',
      ':hover': 'translateX(4px)',
    },
  },
  h2: {
    color: colors.blue3,
    fontSize: text.h4,
    fontWeight: 600,
    marginBottom: {
      default: spacing.xs,
      [MOBILE]: spacing.xxs,
    },
  },
  span: {
    display: 'inline-block',
    transitionProperty: 'transform',
    transform: tokens.arrowTransform,
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
  color: (color: string) => ({ color }),
  width: (width: string) => ({ width }),
});
