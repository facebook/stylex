import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fancyCard: {
    color: 'rgb(10, 20, 30)',
    fontSize: 16,
    lineHeight: 1.5,
    marginTop: -4,
  },
});

export default function Card() {
  return <section {...stylex.props(styles.fancyCard)}>Card</section>;
}
