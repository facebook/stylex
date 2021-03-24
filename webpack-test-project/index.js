'use strict';

import stylex from 'stylex';

import './other'

const styles = stylex.create({
  foo: {
    display: 'block',
    height: 500
  }
});

console.log(stylex(styles.foo))
