'use client';

import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);

  const handleIncrement = () => setCount((c) => c + 1);

  return (
    <section {...stylex.props(styles.wrapper)}>
      <div>Count: {count}</div>
      <button onClick={handleIncrement} {...stylex.props(styles.button)}>
        Increment
      </button>
    </section>
  );
};

const styles = stylex.create({
  wrapper: {
    marginBlockStart: '1rem',
    marginInline: '-1rem',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#60a5fa',
    borderRadius: 6,
    padding: '1rem',
  },
  button: {
    marginBlockStart: '0.5rem',
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: '#111827',
    color: '#fff',
    fontSize: '0.875rem',
    paddingInline: '0.75rem',
    paddingBlock: '0.25rem',
    cursor: 'pointer',
  },
});
