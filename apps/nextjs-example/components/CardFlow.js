// @flow
import React from 'react';
import stylex from '@stylexjs/stylex';

/*:: 
import type { StyleXClassName } from '@stylexjs/stylex/lib/StyleXTypes';
*/

const styles = stylex.create({
  card: {
    backgroundColor: {
      default: null,
      '@media (prefers-color-scheme: dark)': '#222',
    },
    borderColor: {
      default: '#eaeaea',
      ':hover': '#0070f3',
      ':focus': '#0070f3',
      ':active': '#0070f3',
    },
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    color: {
      default: 'inherit',
      ':hover': '#0070f3',
      ':focus': '#0070f3',
      ':active': '#0070f3',
    },
    margin: '1rem',
    maxWidth: 300,
    padding: '1.5rem',
    textAlign: 'start',
    textDecoration: 'none',
    transitionDuration: '0.15s',
    transitionProperty: 'color, border-color',
    transitionTimingFunction: 'ease',
  },
  cardTitle: {
    margin: 0,
    marginBottom: '1rem',
    fontSize: '1.5rem',
  },
  cardBody: {
    margin: 0,
    fontSize: '1.25rem',
    lineHeight: 1.5,
  },
});

// eslint-disable-next-line no-unused-vars

/*::
const cardTitle: {
  +$$css: true,
  +margin: StyleXClassName,
  +marginBottom: StyleXClassName,
  +fontSize: StyleXClassName,
} = styles.cardTitle;

type Props = {
  title: string,
  children: string,
  href: string,
  target?: string,
  rel?: string,
};
*/

export default function Card(
  { href, title, children, ...props } /*: Props */,
) /*: React$Node */ {
  return (
    <a {...props} className={stylex(styles.cardBody)} href={href}>
      <h2 className={stylex(styles.cardTitle)}>{title} &rarr;</h2>
      <p className={stylex(styles.cardBody)}>{children}</p>
    </a>
  );
}
