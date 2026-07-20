import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  badge: {
    color: 'red',
  },
});

export default function Badge() {
  return <div {...stylex.props(styles.badge)}>Badge</div>;
}
