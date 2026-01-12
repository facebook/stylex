/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Button } from './shared-ui';
import { tokens } from './shared-ui/tokens.stylex';

export function ClientCounter() {
  const [count, setCount] = React.useState(0);

  return (
    <>
      <button
        {...stylex.props(styles.base, styles.button)}
        onClick={() => setCount((count) => count + 1)}
      >
        Client Counter: {count}
      </button>
      <div style={{ marginTop: 10 }}>
        <Button onClick={() => console.log('RSC works')}>External Lib</Button>
      </div>
    </>
  );
}

const styles = stylex.create({
  base: {
    backgroundColor: 'orange',
    color: tokens.secondaryColor,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    padding: '0.6em 1.2em',
    fontSize: '1em',
    fontWeight: 500,
    fontFamily: 'inherit',
    backgroundColor: 'tomato',
    color: 'white',
    cursor: 'pointer',
    transitionProperty: 'border-color',
    transitionDuration: '250ms',
  },
});
