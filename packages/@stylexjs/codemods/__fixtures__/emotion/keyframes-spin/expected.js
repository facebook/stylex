import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const spin = stylex.keyframes({
  from: {
    transform: 'rotate(0deg)',
  },

  to: {
    transform: 'rotate(360deg)',
  },
});

const styles = stylex.create({
  spinner: {
    animationDuration: '1s',
    animationName: spin,
  },
});

export default function Spinner() {
  return <div {...stylex.props(styles.spinner)}>Loading</div>;
}
