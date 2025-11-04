/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  app: {
    minHeight: '100%',
    display: 'grid',
    placeItems: 'center',
  },
  title: {
    color: '#0b5fff',
    fontSize: 28,
    fontWeight: 700,
  },
});

export default function App() {
  return (
    <main {...stylex.props(styles.app)}>
      <h1 {...stylex.props(styles.title)}>StyleX + Vite + unplugin</h1>
    </main>
  );
}
