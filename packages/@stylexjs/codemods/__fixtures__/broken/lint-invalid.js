// DELIBERATELY BROKEN: compiles, but violates @stylexjs/eslint-plugin rules
// ('colr' is not a valid property; styles are never used). The lint gate
// must FAIL on this file.
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  badge: { colr: 'red' },
});

export default function Badge() {
  return styles != null;
}
