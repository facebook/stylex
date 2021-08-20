'use strict';

import dynamicImport from 'stylex';

import './other';

const styles = dynamicImport.create({
  foo: {
    display: 'block',
    marginStart: 10,
    height: 500,
    ':hover': {
      background: 'red',
    },
  },
});

console.log(dynamicImport(styles.foo));

export default function App() {};
