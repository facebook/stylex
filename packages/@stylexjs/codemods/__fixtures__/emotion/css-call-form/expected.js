import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  alert: {
    color: 'maroon',
    fontWeight: 700,
  },
});

export default function Alert() {
  return <p {...stylex.props(styles.alert)}>Alert</p>;
}
