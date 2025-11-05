'use client';

import React from 'react';
import * as stylex from '@stylexjs/stylex';

export function ClientCounter() {
  const [count, setCount] = React.useState(0);

  return (
    <button
      {...stylex.props(styles.button)}
      onClick={() => setCount((count) => count + 1)}
    >
      Client Component Counter: {count}
    </button>
  );
}

const styles = stylex.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    padding: '0.6em 1.2em',
    fontSize: '1em',
    fontWeight: 500,
    fontFamily: 'inherit',
    backgroundColor: 'green',
    color: 'white',
    cursor: 'pointer',
    transitionProperty: 'border-color',
    transitionDuration: '250ms',
  },
});
