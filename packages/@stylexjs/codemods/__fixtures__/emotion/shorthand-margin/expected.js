import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  box: {
    marginBlock: '8px',
    marginInline: '16px',
    color: 'navy',
  },
});

export default function Box() {
  return <div {...stylex.props(styles.box)}>Box</div>;
}
