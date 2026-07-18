// DELIBERATELY BROKEN: `stylex.create` must be called with a statically
// analyzable object literal — a function call argument makes the real
// @stylexjs/babel-plugin throw. The compile gate must FAIL on this file.
import * as stylex from '@stylexjs/stylex';

function getStyles() {
  return { badge: { color: 'red' } };
}

const styles = stylex.create(getStyles());

export default styles;
