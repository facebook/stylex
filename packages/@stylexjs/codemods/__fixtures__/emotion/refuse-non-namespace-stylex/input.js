/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { create, props } from '@stylexjs/stylex';

const styles = create({ card: { padding: '8px' } });

export default function Mixed() {
  return (
    <div {...props(styles.card)}>
      <span css={{ color: 'gray' }}>Mixed</span>
    </div>
  );
}
