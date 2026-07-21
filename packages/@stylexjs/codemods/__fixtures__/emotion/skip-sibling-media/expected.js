/** @jsxImportSource @emotion/react */
import * as React from 'react';

// Two sibling media queries on one property: their source order is semantic
// to the StyleX compiler, but sort-keys would reorder them. Refused until the
// upstream inconsistency is resolved.
export default function Panel() {
  return (
    <div
      css={{
        width: '100%',
        '@media (min-width: 700px)': { width: '40%' },
        '@media (min-width: 500px)': { width: '60%' },
      }}
    >
      Panel
    </div>
  );
}
