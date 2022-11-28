import stylex from '@stylexjs/stylex';
import Card from '../components/Card';

const styles = stylex.create({
  main: {
    padding: 0,
    paddingHorizontal: '4rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    lineHeight: 1.15,
    fontSize: '4rem',
    textAlign: 'center',
  },
  titleLink: {
    color: '#0070f3',
    textDecoration: 'none',
    ':hover': { textDecoration: 'underline' },
    ':focus': { textDecoration: 'underline' },
    ':active': { textDecoration: 'underline' },
  },
  description: {
    marginHorizontal: '4rem',
    textAlign: 'center',
    lineHeight: 1.5,
    fontSize: '1.5rem',
  },
  code: {
    backgroundColor: '#fafafa',
    borderRadius: '5px',
    padding: '0.75rem',
    fontSize: '1.1rem',
    fontFamily:
      'Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: '#111',
    },
  },
  grid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: 800,
    '@media (max-width: 600px)': {
      width: '100%',
      flexDirection: 'column',
    },
  },
});

export default function Home() {
  return (
    <main className={stylex(styles.main)}>
      <h1 className={stylex(styles.title)}>
        Welcome to{' '}
        <a className={stylex(styles.titleLink)} href="https://nextjs.org">
          Next.js!
        </a>
      </h1>

      <p className={stylex(styles.description)}>
        Get started by editing{' '}
        <code className={stylex(styles.code)}>pages/index.tsx</code>
      </p>

      <div className={stylex(styles.grid)}>
        <Card href="https://nextjs.org/docs" title="Documentation">
          Find in-depth information about Next.js features and API.
        </Card>

        <Card href="https://nextjs.org/learn" title="Learn">
          Learn about Next.js in an interactive course with quizzes!
        </Card>

        <Card
          href="https://github.com/vercel/next.js/tree/canary/examples"
          title="Examples"
        >
          Discover and deploy boilerplate example Next.js projects.
        </Card>

        <Card
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
          title="Deploy"
        >
          Instantly deploy your Next.js site to a public URL with Vercel.
        </Card>
      </div>
    </main>
  );
}
