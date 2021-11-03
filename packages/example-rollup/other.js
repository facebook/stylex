'use strict';

import stylex from 'stylex';

const styles = stylex.create({
  bar: {
    display: 'block',
    width: '100%',
  },
});

export default function other() {
  return stylex(styles.bar);
}
