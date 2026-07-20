import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  link: {
    color: {
      default: 'blue',

      '@media (hover: hover)': {
        default: null,
        ':hover': 'navy',
      },
    },
  },
});

export default function Link() {
  return (
    <a {...stylex.props(styles.link)} href="#top">
      Link
    </a>
  );
}
