import * as stylex from '@stylexjs/stylex';
import { Link } from 'waku';

export default function Home() {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.heading)}>Fumadocs on Waku.</h1>
      <Link to="/docs" {...stylex.props(styles.cta)}>
        Open Docs
      </Link>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  };
};

const styles = stylex.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  heading: {
    fontWeight: 500,
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    marginBlockEnd: '1rem',
  },
  cta: {
    alignSelf: 'center',
    paddingInline: '0.75rem',
    paddingBlock: '0.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--color-fd-primary)',
    color: 'var(--color-fd-primary-foreground)',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textDecorationLine: 'none',
  },
});
