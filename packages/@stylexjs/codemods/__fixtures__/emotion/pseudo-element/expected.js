import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  tag: {
    color: {
      default: 'black',
      '::before': 'gray',
    },
  },
});

export default function Tag() {
  return <span {...stylex.props(styles.tag)}>Tag</span>;
}
