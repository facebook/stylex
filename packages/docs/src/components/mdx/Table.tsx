/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';
import type { ComponentProps } from 'react';

export interface TableProps
  extends Omit<ComponentProps<'table'>, 'className' | 'style'> {}

export default function Table(props: TableProps) {
  return (
    <div {...stylex.props(styles.wrapper)}>
      <table {...stylex.props(styles.table)} {...props} />
    </div>
  );
}

const styles = stylex.create({
  wrapper: {
    position: 'relative',
    marginBlock: 24,
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    fontSize: 14,
    lineHeight: 1.5,
    borderCollapse: 'collapse',
  },
});
