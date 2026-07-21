import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    paddingBottom: '3px',
    paddingLeft: '4px',
    paddingRight: '2px',
    paddingTop: '1px',
  },
});

export default function Card() {
  return <div {...stylex.props(styles.card)}>Card</div>;
}
