/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import * as stylex from '@stylexjs/stylex';

export default function App() {
  return (
    <div {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.card)}>Content</div>
    </div>
  );
}

const styles = stylex.create({
  main: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
  },
  card: {
    backgroundColor: '#fefefe',
    padding: '1rem',
    borderRadius: 10,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    color: '#333',
    fontFamily: 'Arial',
  },
});
