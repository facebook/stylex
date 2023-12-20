/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  text: { fontSize: '20px', cursor: 'pointer' },
  blue: {
    color: 'blue',
  },
  red: {
    color: 'red',
  },
});

export default function Application() {
  const [color, setColor] = useState('red');

  const handleClick = () => {
    setColor((pre) => (pre === 'red' ? 'blue' : 'red'));
  };

  return (
    <div>
      <button
        onClick={handleClick}
        {...stylex.props(
          styles.text,
          color === 'red' ? styles.red : styles.blue,
        )}
      >
        Action
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.querySelector('#app')).render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>,
);
