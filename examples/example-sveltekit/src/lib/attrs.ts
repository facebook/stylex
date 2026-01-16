import type * as stylex from '@stylexjs/stylex';

/**
 * Translates stylex.props to fit svelte attributes.
 * @example
 *  <div {...attrs(stylex.props(...styles))} />
 */
export function attrs({ className, 'data-style-src': dataStyleSrc, style }: ReturnType<typeof stylex.props>) {
  const result: {class?: string, style?: string, 'data-style-src'?: string} = {};
  // Convert className to class
  if (className != null && className !== '') {
    result.class = className;
  }
  // Convert style object to string
  if (style != null && Object.keys(style).length > 0) {
    result.style = Object.keys(style)
      .map((key) => `${key}:${style[key]};`)
      .join('');
  }
  if (dataStyleSrc != null && dataStyleSrc !== '') {
    result['data-style-src'] = dataStyleSrc;
  }
  return result;
}