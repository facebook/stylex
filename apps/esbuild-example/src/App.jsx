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
import { spacings, colors } from './tokens.stylex.js';

const styles = stylex.create({
  main: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pink,
  },
  card: {
    width: 100,
    height: 100,
    backgroundColor: colors.blue,
    padding: spacings.medium,
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
        <span>Blue box</span>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
