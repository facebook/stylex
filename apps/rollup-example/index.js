// index.js

'use strict';

import stylex from '@stylexjs/stylex';
import { lotsOfStyles } from './lotsOfStyles';

const styles = lotsOfStyles.map((defs) => Object.values(defs));

export default function App() {
  return stylex(styles);
}
