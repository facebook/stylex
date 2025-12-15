/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { forwardRef } from 'react';
import * as stylex from '@stylexjs/stylex';

export const Menu = forwardRef(function DropdownMenu({ id, children }, ref) {
  return (
    <>
      <div id={id} popover="auto" ref={ref} {...stylex.props(styles.menu)}>
        <div {...stylex.props(styles.menuContent)}>{children}</div>
      </div>
    </>
  );
});

export function Item({ children, onClick }) {
  return (
    <button {...stylex.props(styles.menuItem)} onClick={onClick} type="button">
      {children}
    </button>
  );
}

const styles = stylex.create({
  menu: {
    // eslint-disable-next-line @stylexjs/valid-styles
    positionAnchor: 'auto',
    // eslint-disable-next-line @stylexjs/valid-styles
    positionArea: 'bottom right',
    transform: 'translate(-30px, 0)',
    position: 'fixed',
    backgroundColor: 'var(--bg1)',
    borderRadius: '6px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--fg2)',
  },
  menuContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  menuItem: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--pink)',
      ':focus-visible': 'var(--pink)',
    },
    color: {
      default: 'var(--fg1)',
      ':hover': '#fff',
      ':focus-visible': '#fff',
    },
    textAlign: 'left',
    cursor: 'pointer',
    padding: 8,
    paddingInline: 16,
    borderRadius: 4,
    borderWidth: 0,
    fontSize: 14,
  },
});
