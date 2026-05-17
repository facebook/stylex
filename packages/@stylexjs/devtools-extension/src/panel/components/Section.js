/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

export function Section({
  title,
  children,
}: {
  title: string,
  children: React.Node,
}): React.Node {
  return (
    <section {...stylex.props(styles.section)}>
      <h2 {...stylex.props(styles.sectionTitle)}>{title}</h2>
      {children}
    </section>
  );
}

const styles = stylex.create({
  section: {
    marginTop: 16,
    padding: 8,
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: '1rem',
    fontWeight: 800,
  },
});
