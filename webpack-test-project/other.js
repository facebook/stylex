'use strict';

import dynamicImport from 'stylex';

const styles = dynamicImport.create({
  bar: {
    display: 'block',
    width: '100%',
  },
});

export default function other() {
  return dynamicImport(styles.bar);
};
