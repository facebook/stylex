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
  xstyle?: StyleXStyles;

  staticXstyle?: StaticStyles;
};

function Component({ xstyle, staticXstyle }: Props): null {
  // @ts-expect-error - `stylex` can only accept StaticStyles. Not StyleXStyles.
  <div className={stylex(xstyle)} />;

  <div className={stylex(staticXstyle)} />;

  <div {...stylex.spread(xstyle)} />;

  <div {...stylex.spread([staticXstyle])} />;

  return null;
}

const styles = stylex.create({
  base: {
    color: 'red',
  },
});

function OtherComponent() {
  <Component xstyle={styles.base} />;
}
