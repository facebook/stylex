/** @jsxImportSource @emotion/react */
import * as React from 'react';

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  panel: {
    color: 'gray',
    fontSize: 14,
  },

  panel2: {
    backgroundColor: {
      default: 'white',

      '@media (hover: hover)': {
        default: null,
        ':hover': 'navy',
      },
    },
  },
});

export default function Panel() {
  return (
    <div>
      <span {...stylex.props(styles.panel)}>convert me</span>
      {/* TODO(stylex-migration): 'color': Emotion source-order and StyleX priority disagree on which conditional value wins when several are active (:focus vs :hover) */}
      <button
        css={{ ':focus': { color: 'green' }, ':hover': { color: 'blue' } }}
      >
        flag me
      </button>
      <a {...stylex.props(styles.panel2)} href="#top">
        convert me too
      </a>
    </div>
  );
}
