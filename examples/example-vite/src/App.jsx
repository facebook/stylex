/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';
import { Button } from '@stylexjs/shared-ui';
import { tokens } from '@stylexjs/shared-ui/tokens.stylex';

const styles = stylex.create({
  app: {
    minHeight: '100%',
    display: 'grid',
    placeItems: 'center',
  },
  title: {
    color: tokens.primaryColor,
    fontSize: 28,
    fontWeight: 700,
  },
});

export default function App() {
  return (
    <main {...stylex.props(styles.app)}>
      <h1 {...stylex.props(styles.title)}>StyleX + Vite + unplugin</h1>
      <Button onClick={() => console.log('Clicked!')}>
        Test Library Button
      </Button>
    </main>
  );
}
