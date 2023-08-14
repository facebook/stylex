import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  card: {
    margin: '1rem',
    padding: '1.5rem',
    textAlign: 'start',
    color: {
      default: 'inherit',
      ':hover': '#0070f3',
      ':focus': '#0070f3',
      ':active': '#0070f3',
    },
    textDecoration: 'none',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: '#eaeaea',
      ':hover': '#0070f3',
      ':focus': '#0070f3',
      ':active': '#0070f3',
    },
    borderRadius: 10,
    transitionProperty: 'color, border-color',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    maxWidth: 300,
    backgroundColor: {
      default: null,
      '@media (prefers-color-scheme: dark)': '#222',
    },
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

type Props = {
  title: string;
  children: string;
  href: string;
  target?: string;
  rel?: string;
};

export default function Card({ href, title, children, ...props }: Props) {
  return (
    <a {...props} className={stylex(styles.card)} href={href}>
      <h2 className={stylex(styles.cardTitle)}>{title} &rarr;</h2>
      <p className={stylex(styles.cardBody)}>{children}</p>
    </a>
  );
}
