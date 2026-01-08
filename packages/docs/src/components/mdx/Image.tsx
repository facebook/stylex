/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';
import type { ImgHTMLAttributes } from 'react';

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className' | 'style'> {
  /**
   * Responsive sizes attribute
   * @defaultValue "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
   */
  sizes?: string;
  /**
   * Priority loading
   */
  priority?: boolean;
}

export default function Image({
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px',
  priority,
  alt,
  ...props
}: ImageProps) {
  return (
    <img
      alt={alt}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      loading={priority ? 'eager' : 'lazy'}
      sizes={sizes}
      {...stylex.props(styles.image)}
      {...props}
    />
  );
}

const styles = stylex.create({
  image: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    marginBlock: 16,
    borderRadius: 8,
    cornerShape: 'squircle',
  },
});
