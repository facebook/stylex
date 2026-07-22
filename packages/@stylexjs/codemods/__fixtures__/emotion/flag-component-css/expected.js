/** @jsxImportSource @emotion/react */
import * as React from 'react';
import { Button } from './Button';

export default function Toolbar() {
  return (
    /* TODO(stylex-migration): css on a component — className forwarding is not provable here */
    <Button css={{ color: 'white' }}>Save</Button>
  );
}
