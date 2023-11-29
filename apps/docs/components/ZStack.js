/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';

const {useEffect, useState} = React;

const styles = stylex.create({
  container: {
    display: 'inline-flex',
    flexDirection: 'column',
    height: '1.3em',
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemLayout: {
    visibility: 'hidden',
  },
  item: {
    position: 'absolute',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'linear',
  },
  visible: {
    opacity: 1,
  },
});

export default function ZStack({children, xstyle}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((active) => (active + 1) % children.length);
    }, 3000);
    return () => {
      setActive(0);
      clearInterval(interval);
    };
  }, [children.length]);

  return (
    <span {...stylex.props(styles.container, xstyle)}>
      {children.map((child, _i) => (
        <span {...stylex.props(styles.itemLayout)}>{child}</span>
      ))}
      {children.map((child, i) => (
        <span {...stylex.props(styles.item, i === active && styles.visible)}>
          {child}
        </span>
      ))}
    </span>
  );
}
