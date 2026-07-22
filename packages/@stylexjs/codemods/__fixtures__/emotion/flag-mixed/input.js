/** @jsxImportSource @emotion/react */
import * as React from 'react';

export default function Panel() {
  return (
    <div>
      <span css={{ color: 'gray', fontSize: 14 }}>convert me</span>
      <button
        css={{ ':focus': { color: 'green' }, ':hover': { color: 'blue' } }}
      >
        flag me
      </button>
      <a
        css={{
          backgroundColor: 'white',
          ':hover': { backgroundColor: 'navy' },
        }}
        href="#top"
      >
        convert me too
      </a>
    </div>
  );
}
