/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

export function Menu({
  id,
  children,
  ref,
}: {
  id: string;
  children: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div id={id} popover="auto" ref={ref} {...stylex.props(styles.menu)}>
        <div {...stylex.props(styles.menuContent)}>{children}</div>
      </div>
    </>
  );
}

export function Item({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
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
    position: 'fixed',
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: '6px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.35)',
    transform: 'translate(-30px, 0)',
  },
  menuContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  menuItem: {
    padding: 8,
    paddingInline: 16,
    fontSize: 14,
    color: vars['--color-fd-foreground'],
    textAlign: 'left',
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':focus-visible': vars['--color-fd-accent'],
      ':hover': vars['--color-fd-accent'],
    },
    borderWidth: 0,
    borderRadius: 4,
  },
});
