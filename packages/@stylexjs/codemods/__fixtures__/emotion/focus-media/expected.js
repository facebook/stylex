import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  field: {
    color: {
      default: 'black',
      ':focus': 'blue',
    },

    fontSize: {
      default: null,
      '@media (min-width: 600px)': 18,
    },
  },
});

export default function Field() {
  return <input {...stylex.props(styles.field)} />;
}
