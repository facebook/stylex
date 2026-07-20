/** @jsxImportSource @emotion/react */
import * as React from 'react';

export default function Tag() {
  return (
    <span
      css={{
        color: 'black',
        '::before': { color: 'gray' },
      }}
    >
      Tag
    </span>
  );
}
