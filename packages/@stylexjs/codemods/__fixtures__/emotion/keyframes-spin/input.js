/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { keyframes } from '@emotion/react';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export default function Spinner() {
  return (
    <div css={{ animationName: spin, animationDuration: '1s' }}>Loading</div>
  );
}
