import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  sidebar: {
    insetInlineStart: 0,
    marginInlineStart: 16,
    paddingInlineEnd: 8,
    marginTop: 4,
  },
});

export default function Sidebar() {
  return <aside {...stylex.props(styles.sidebar)}>Sidebar</aside>;
}
