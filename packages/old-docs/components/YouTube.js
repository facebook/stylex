/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    width: '100%',
    paddingTop: '56.25%',
    position: 'relative',
    marginBlock: 16,
  },
  iframe: {
    position: 'absolute',
    top: 0,
    insetInlineEnd: 0,
    bottom: 0,
    insetInlineStart: 0,
  },
});

export default function YouTube({ width: _w, height: _h, src, title }) {
  return (
    <div {...stylex.props(styles.container)}>
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen={true}
        frameBorder={0}
        height={'100%'}
        src={src}
        title={title}
        width={'100%'}
        {...stylex.props(styles.iframe)}
      />
    </div>
  );
}
