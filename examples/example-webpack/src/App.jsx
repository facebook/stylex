/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import './app.css';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  base: {
    color: 'rgb(60,60,60)',
    fontSize: 16,
    lineHeight: 1.5,
  },
  highlighted: {
    color: 'blue',
  },
});

// if (module.hot) module.hot.accept()

const App = () => {
  return (
    <div {...stylex.props(styles.base, styles.highlighted)}>
      React 123 Content Application
    </div>
  )
}

export default App