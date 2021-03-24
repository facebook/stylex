'use strict';

import stylex from 'stylex';

import './other'

const styles = stylex.create({
  foo: {
    display: 'block',
    marginStart: 10,
    height: 500,
    ':hover': {
      background: 'red'
    }
  }
});

console.log(stylex(styles.foo))
