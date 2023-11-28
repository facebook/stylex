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
import {tokens} from './DetailsTokens.stylex';

export default function MDXDetails({children: _children, style, ...props}) {
  const items = React.Children.toArray(_children);
  // Split summary item from the rest to pass it as a separate prop to the
  // Details theme component
  const summary = items.find(
    (item) => React.isValidElement(item) && item.props?.mdxType === 'summary',
  );
  const children = <>{items.filter((item) => item !== summary)}</>;

  return (
    <details {...props} {...stylex.props(styles.details, style)}>
      <summary {...summary.props} {...stylex.props(styles.summary)} />
      {children}
    </details>
  );
}

const RETINA =
  '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)';

const styles = stylex.create({
  details: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    borderRadius: 8,
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: 'hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.1)',
    borderWidth: {
      default: 1,
      [RETINA]: 0.5,
    },
    borderStyle: 'solid',
    borderColor: 'hsla(var(--cyan-h), var(--cyan-s), var(--cyan-l), 0.5)',
    [tokens.arrowRotate]: {
      default: '0deg',
      ':is([open])': '90deg',
    },
    [tokens.summaryGap]: {
      default: '0rem',
      ':is([open])': '1rem',
    },
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    listStyleType: 'none',
    marginBottom: tokens.summaryGap,
    paddingInlineStart: '1.2rem',
    position: 'relative',
    '::-webkit-details-marker': {
      display: 'none',
    },
    '::marker': {
      display: 'none',
    },
    '::before': {
      content: '',
      marginRight: '0.5rem',
      borderWidth: '.4rem',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderInlineStartColor: 'var(--pink)',
      position: 'absolute',
      top: '0.5rem',
      insetInlineStart: '0.25rem',
      transform: `rotate(${tokens.arrowRotate})`,
      transformOrigin: '0.2rem 50%',
      transitionProperty: 'transform',
      transitionDuration: '0.2s',
      transitionTimingFunction: 'ease-in-out',
    },
  },
});
