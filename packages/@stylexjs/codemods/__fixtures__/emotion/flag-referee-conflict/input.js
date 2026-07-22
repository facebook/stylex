/** @jsxImportSource @emotion/react */
import * as React from 'react';

// :focus before :hover — Emotion's source order makes :hover win when both
// are active, but StyleX's priority makes :focus win. The referees disagree,
// so the whole file must be refused (not silently converted incorrectly).
export default function Toggle() {
  return (
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
