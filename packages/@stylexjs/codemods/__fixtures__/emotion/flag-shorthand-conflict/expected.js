/** @jsxImportSource @emotion/react */
import * as React from 'react';

export default function Box() {
  return (
    /* TODO(stylex-migration): shorthand/longhand overlap ('margin' + 'marginTop') */
    <div css={{ marginTop: 20, margin: 4 }}>Box</div>
  );
}
