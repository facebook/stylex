import * as stylex from '@stylexjs/stylex';

export const Footer = () => {
  return (
    <footer {...stylex.props(styles.container)}>
      <div>
        visit{' '}
        <a
          href="https://waku.gg/"
          target="_blank"
          rel="noreferrer"
          {...stylex.props(styles.link)}
        >
          waku.gg
        </a>{' '}
        to learn more
      </div>
    </footer>
  );
};

const styles = stylex.create({
  container: {
    padding: '1.5rem',
    position: {
      default: 'static',
      '@media (min-width: 1024px)': 'fixed',
    },
    insetBlockEnd: {
      default: 'auto',
      '@media (min-width: 1024px)': 0,
    },
    insetInlineStart: {
      default: 'auto',
      '@media (min-width: 1024px)': 0,
    },
  },
  link: {
    marginTop: '1rem',
    display: 'inline-block',
    textDecorationLine: 'underline',
    color: '#2563eb',
  },
});
