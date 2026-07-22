/** @jsxImportSource @emotion/react */
import * as React from 'react';

// A descendant selector reaches outside the element — not self-targeting,
// so it cannot enter the IR and the file is refused.
export default function List() {
  return (
    /* TODO(stylex-migration): selector '& > li' is not self-targeting */
    <ul css={{ color: 'black', '& > li': { color: 'gray' } }}>
      <li>Item</li>
    </ul>
  );
}
