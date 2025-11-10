import * as stylex from '@stylexjs/stylex';

export default function MainArticle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main {...stylex.props(styles.main)}>
      <article {...stylex.props(styles.article)}>{children}</article>
    </main>
  );
}

const MEDIA_SM = '@media (min-width: 640px)' as const;

export const styles = stylex.create({
  main: {
    marginInline: 'auto',
    maxWidth: 1200,
    paddingInline: '16px',
    paddingBlock: {
      default: '2.5rem',
      [MEDIA_SM]: '3.5rem',
    },
    backgroundColor: '#efefef',
  },
  article: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    lineHeight: 1.6,
  },
});
