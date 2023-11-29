/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import useId from './hooks/useId';

export default function FeatureCard({
  to,
  emoji,
  title,
  subtitle,
  children,
  style,
}) {
  const titleId = useId();
  return (
    <div
      {...stylex.props(styles.card, style)}
      aria-labelledby={titleId}
      to={to}>
      <div {...stylex.props(styles.layout)}>
        <div {...stylex.props(styles.emoji)} aria-hidden>
          {emoji}
        </div>
        <div>
          <h3 {...stylex.props(styles.title)} id={titleId}>
            {title}
          </h3>
          <h4 {...stylex.props(styles.subTitle)}>{subtitle}</h4>
          <p {...stylex.props(styles.body)}>{children}</p>
        </div>
      </div>
    </div>
  );
}

const LARGE = '@container (min-width: 540px)';

const styles = stylex.create({
  card: {
    alignItems: 'center',
    backgroundColor: 'var(--bg1)',
    borderColor: 'hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.25)',
    borderRadius: 32,
    borderStyle: 'solid',
    borderWidth: 1,
    // boxShadow: {
    //   default:
    //     '0 2px 4px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.1)',
    //   ':hover':
    //     '0 2px 8px hsla(var(--pink-h), var(--pink-s), var(--pink-l), 0.5)',
    // },
    boxSizing: 'border-box',
    color: {
      default: 'inherit',
      ':hover': 'inherit',
    },
    textDecoration: {
      default: 'none',
      ':hover': 'none',
    },
    containerType: 'inline-size',
    display: 'flex',
    gridRow: {
      default: 'span 2',
      '@container (max-width: 940px)': 'span 1',
    },
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    transitionProperty: 'box-shadow',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-in-out',
  },
  layout: {
    display: 'flex',
    flexDirection: {
      default: 'column',
      [LARGE]: 'row',
    },
    width: '100%',
    alignItems: 'center',
    justifyContent: {
      default: 'center',
      [LARGE]: 'flex-start',
    },
    // textAlign: {
    //   default: 'center',
    //   [LARGE]: 'left',
    // },
    padding: {
      default: 16,
      [LARGE]: 32,
    },
    paddingInline: 32,
    columnGap: 32,
  },
  emoji: {
    fontSize: '8rem',
    alignSelf: 'center',
    marginBlock: '-0.16em',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
  },
  subTitle: {
    fontSize: '1rem',
    margin: 0,
    marginTop: '0.2em',
    color: 'var(--pink)',
    fontWeight: 400,
  },
  body: {
    marginTop: '1em',
    fontSize: '1rem',
    lineHeight: 1.4,
    color: 'var(--fg2)',
  },
});
