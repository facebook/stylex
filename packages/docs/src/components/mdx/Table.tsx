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
    overflowX: 'auto',
    marginBlock: 24,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    lineHeight: 1.5,
  },
});
