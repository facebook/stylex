/* eslint-disable no-unused-vars */

import stylex from '@stylexjs/stylex';
import type { StaticStyles } from '@stylexjs/stylex';

type Props = {
  xstyle?: StaticStyles;
};

function Component({ xstyle }: Props) {
  return <div className={stylex(xstyle)} />;
}

const styles = stylex.create({
  base: {
    color: 'red',
  },
});

function OtherComponent() {
  return <Component xstyle={styles.base} />;
}
