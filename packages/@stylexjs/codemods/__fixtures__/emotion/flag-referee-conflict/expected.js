/** @jsxImportSource @emotion/react */
import * as React from 'react';

// :focus before :hover — Emotion's source order makes :hover win when both
// are active, but StyleX's priority makes :focus win. The referees disagree,
// so the whole file must be refused (not silently converted incorrectly).
export default function Toggle() {
  return (
    /* TODO(stylex-migration): 'color': Emotion source-order and StyleX priority disagree on which conditional value wins when several are active (:focus vs :hover) */
    <button
      css={{
        ':focus': { color: 'green' },
        ':hover': { color: 'blue' },
      }}
    >
      Toggle
    </button>
  );
}
