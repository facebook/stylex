import * as stylex from '@stylexjs/stylex';
import { Link } from 'waku';
import { Counter } from '../components/counter';

export default async function HomePage() {
  const data = await getData();

  return (
    <div {...stylex.props(styles.section)}>
      <title>{data.title}</title>
      <h1 {...stylex.props(styles.headline)}>{data.headline}</h1>
      <p {...stylex.props(styles.body)}>{data.body}</p>
      <Counter />
      <Link to="/about" {...stylex.props(styles.link)}>
        About page
      </Link>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'Waku',
    headline: 'Waku',
    body: 'Hello world!',
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
