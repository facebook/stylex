/* eslint-disable no-unused-vars */

import stylex from '@stylexjs/stylex';
import type {
  StaticStyles,
  StyleXStyles,
  StaticStylesWithout,
  StyleXStylesWithout,
  StyleXClassNameFor,
  InlineStyles,
} from '@stylexjs/stylex/lib/StyleXTypes';

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
