/** @jsxImportSource @emotion/react */
import * as React from 'react';

export default function Field() {
  return (
    <input
      css={{
        color: 'black',
        ':focus': { color: 'blue' },
        '@media (min-width: 600px)': { fontSize: 18 },
      }}
    />
  );
}
