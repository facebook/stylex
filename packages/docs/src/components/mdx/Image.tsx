import * as stylex from '@stylexjs/stylex';
import type { ImgHTMLAttributes } from 'react';

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'className' | 'style'
> {
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
      sizes={sizes}
      fetchPriority={priority ? 'high' : 'auto'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...stylex.props(styles.image)}
      {...props}
    />
  );
}

const styles = stylex.create({
  image: {
    borderRadius: 8,
    borderShape: 'squircle',
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    marginBlock: 16,
  },
});
