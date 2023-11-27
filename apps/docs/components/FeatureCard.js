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

const LARGE = '@container (min-width: 540px)';

const styles = stylex.create({
  card: {
    borderRadius: 32,
    containerType: 'inline-size',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.1)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gridRow: {
      default: 'span 2',
      '@media (max-width: 940px)': 'span 1',
    },
    backgroundColor: 'var(--bg1)',
    boxShadow:
      '0 2px 4px hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.1)',
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
    textAlign: {
      default: 'center',
      [LARGE]: 'left',
    },
    padding: {
      default: 16,
      [LARGE]: 32,
    },
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
    opacity: 0.5,
  },
});

export default function FeatureCard({emoji, title, subtitle, children, style}) {
  return (
    <article {...stylex.props(styles.card, style)}>
      <div {...stylex.props(styles.layout)}>
        <div {...stylex.props(styles.emoji)} aria-hidden>
          {emoji}
        </div>
        <div>
          <h3 {...stylex.props(styles.title)}>{title}</h3>
          <h4 {...stylex.props(styles.subTitle)}>{subtitle}</h4>
          <p {...stylex.props(styles.body)}>{children}</p>
        </div>
      </div>
    </article>
  );
}
