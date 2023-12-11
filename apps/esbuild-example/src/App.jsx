/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

import * as React from 'react';
import ReactDOM from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import { spacing, color } from './tokens.stylex';

const styles = stylex.create({
  main: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.pink,
  },
  card: {
    backgroundColor: color.blue,
    padding: spacing.medium,
    borderRadius: spacing.small,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    color: 'white',
  },
});

function App() {
  return (
    <div {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.card)}>
        <span>Blue rounded rectangle</span>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
