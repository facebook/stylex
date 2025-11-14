/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';

const { useEffect, useState } = React;

const styles = stylex.create({
  container: {
    display: 'inline-grid',
  },
  item: {
    gridArea: '1 / 1',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'linear',
  },
  visible: {
    opacity: 1,
  },
});

const ActiveItemContext = React.createContext(false);

export function ZStack({ children, xstyle }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((active) => (active + 1) % children.length);
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [children.length]);

  return (
    <span {...stylex.props(styles.container, xstyle)}>
      {children.map((child, i) => (
        <ActiveItemContext.Provider key={i} value={i === active}>
          {child}
        </ActiveItemContext.Provider>
      ))}
    </span>
  );
}

export function ZStackItem({ children, style }) {
  const active = React.useContext(ActiveItemContext);
  return (
    <span {...stylex.props(styles.item, active && styles.visible, style)}>
      {children}
    </span>
  );
}
