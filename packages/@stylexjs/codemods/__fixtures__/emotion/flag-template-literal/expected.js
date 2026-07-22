/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { css } from '@emotion/react';

const fancy = css`
  color: red;
`;

export default function Fancy() {
  return <div css={fancy}>Fancy</div>;
}
