'use strict';

import stylex from 'stylex';
import otherStyles from './otherStyles';

const styles = stylex.create({
  foo: {
    display: 'flex',
    marginStart: 10,
    marginBlockStart: 99,
    height: 500,
    ':hover': {
      background: 'red',
    },
  },
});

export default function App() {
  return stylex(otherStyles.bar, styles.foo);
}
