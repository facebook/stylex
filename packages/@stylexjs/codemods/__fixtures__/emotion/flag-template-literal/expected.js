/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';

const fancy = css`
  color: red;
`;

export default function Fancy() {
  return (
    /* TODO(stylex-migration): dynamic value (props-driven) */
    <div css={fancy}>Fancy</div>
  );
}
