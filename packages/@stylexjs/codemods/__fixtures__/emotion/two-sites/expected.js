import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  badge: {
    color: 'darkgreen',
  },

  card: {
    padding: '16px',
  },
});

export function Badge() {
  return <span {...stylex.props(styles.badge)}>Badge</span>;
}

export function Card() {
  return <article {...stylex.props(styles.card)}>Card</article>;
}
