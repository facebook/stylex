import * as stylex from '@stylexjs/stylex';
import { Link } from 'waku';

export const Header = () => {
  return (
    <header {...stylex.props(styles.container)}>
      <h2 {...stylex.props(styles.title)}>
        <Link to="/" {...stylex.props(styles.link)}>
          Waku starter
        </Link>
      </h2>
    </header>
  );
};

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    position: {
      default: null,
      '@media (min-width: 1024px)': 'fixed',
    },
    top: {
      default: null,
      '@media (min-width: 1024px)': 0,
    },
    insetInlineStart: {
      default: null,
      '@media (min-width: 1024px)': 0,
    },
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  link: {
    color: '#0f172a',
    textDecorationLine: 'none',
  },
});
