/** @jsxImportSource @emotion/react */
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    padding: '8px',
  },
});

export default function Mixed() {
  return (
    <div {...stylex.props(styles.card)}>
      <span css={{ color: 'gray' }}>Mixed</span>
    </div>
  );
}
