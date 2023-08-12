/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import stylex from '@stylexjs/stylex';

const {useEffect, useState} = React;

const styles = stylex.create({
  container: {
    display: 'inline-flex',
    flexDirection: 'column',
    height: '1.3em',
    position: 'relative',
    // borderWidth: 1,
    // borderStyle: 'solid',
    // borderColor: 'rgba(200, 200, 200, 0.1)',
    alignItems: 'flex-start',
    // marginInlineStart: '0.5em',
    overflow: 'hidden',
  },
  itemLayout: {
    visibility: 'hidden',
  },
  item: {
    position: 'absolute',
    top: 0,
    start: 0,
    opacity: 0,
    transition: 'opacity 0.5s ease-in-out',
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
    }, 2500);
    return () => {
      setActive(0);
      clearInterval(interval);
    };
  }, [children.length]);

  return (
    <span className={stylex(styles.container, xstyle)}>
      {children.map((child, _i) => (
        <span className={stylex(styles.itemLayout)}>{child}</span>
      ))}
      {children.map((child, i) => (
        <span className={stylex(styles.item, i === active && styles.visible)}>
          {child}
        </span>
      ))}
    </span>
  );
}
