/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';

const fancy = css`
  color: red;
`;

export default function Fancy() {
  return (
    /* TODO(stylex-migration): dynamic value — needs a StyleX function-form style (v1.1) */
    <div css={fancy}>Fancy</div>
  );
}
