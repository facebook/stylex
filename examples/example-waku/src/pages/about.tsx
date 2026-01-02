/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as stylex from '@stylexjs/stylex';
import { Link } from 'waku';

export default async function AboutPage() {
  const data = await getData();

  return (
    <div {...stylex.props(styles.section)}>
      <title>{data.title}</title>
      <h1 {...stylex.props(styles.headline)}>{data.headline}</h1>
      <p {...stylex.props(styles.body)}>{data.body}</p>
      <Link to="/" {...stylex.props(styles.link)}>
        Return home
      </Link>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'About',
    headline: 'About Waku',
    body: 'The minimal React framework',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};

const styles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '16rem',
    minWidth: '16rem',
  },
  headline: {
    fontSize: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    margin: 0,
  },
  body: {
    margin: 0,
    color: '#1f2937',
    fontSize: '1rem',
  },
  link: {
    marginTop: '1rem',
    display: 'inline-block',
    textDecorationLine: 'underline',
    color: '#2563eb',
  },
});
