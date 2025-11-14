/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens } from './DetailsTokens.stylex';

export default function MDXDetails({
  children: _children,
  style,
  mdxType: _1,
  originalType: _2,
  open = false,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(open);

  const toggleDetails = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const items = React.Children.toArray(_children);
  // Split summary item from the rest to pass it as a separate prop to the
  // Details theme component
  const summary = items.find(
    (item) => React.isValidElement(item) && item.props?.mdxType === 'summary',
  );
  const { mdxType: _3, originalType: _4, ...summaryProps } = summary.props;
  const children = <>{items.filter((item) => item !== summary)}</>;

  return (
    <details
      {...props}
      {...stylex.props(styles.details, style)}
      {...(isOpen && { open: true })}
    >
      <summary
        {...summaryProps}
        {...stylex.props(styles.summary)}
        onClick={toggleDetails}
      />
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
      default: '-1rem',
      ':is([open])': '0rem',
    },
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    listStyleType: 'none',
    margin: '-1rem',
    marginBottom: tokens.summaryGap,
    paddingInlineStart: '2.2rem',
    padding: '1rem',
    position: 'relative',
    // eslint-disable-next-line @stylexjs/valid-styles
    '::-webkit-details-marker': {
      display: 'none',
    },
    '::marker': {
      display: 'none',
    },
    '::before': {
      content: '',
      borderWidth: '.4rem',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderInlineStartColor: 'var(--pink)',
      position: 'absolute',
      top: '1.5rem',
      insetInlineStart: '1.25rem',
      transform: `rotate(${tokens.arrowRotate})`,
      transformOrigin: '0.2rem 50%',
      transitionProperty: 'transform',
      transitionDuration: '0.2s',
      transitionTimingFunction: 'ease-in-out',
    },
  },
});
