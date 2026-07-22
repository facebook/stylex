import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    padding: '8px',
  },

  mixed: {
    color: 'gray',
  },
});

export default function Mixed() {
  return (
    <div {...stylex.props(styles.card)}>
      <span {...stylex.props(styles.mixed)}>Mixed</span>
    </div>
  );
}
