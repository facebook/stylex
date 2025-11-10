import '../global.css';

import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();

  return (
    <div {...stylex.props(styles.root)}>
      <meta name="description" content={data.description} />
      <link rel="icon" type="image/png" href={data.icon} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        precedence="font"
      />
      {/* @ts-ignore */}
      {import.meta.env.DEV ? (
        <>
          <link rel="stylesheet" href="/virtual:stylex.css" />
          <script type="module" src="virtual:stylex:css-only" />
        </>
      ) : null}
      <Header />
      <main {...stylex.props(styles.main)}>{children}</main>
      <Footer />
    </div>
  );
}

const getData = async () => {
  const data = {
    description: 'An internet website!',
    icon: '/images/favicon.png',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};

const styles = stylex.create({
  root: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    color: '#0f172a',
    fontFamily:
      "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    alignItems: 'center',
    margin: {
      default: '1.5rem',
      '@media (min-width: 1024px)': 0,
    },
    minHeight: {
      default: 'auto',
      '@media (min-width: 1024px)': '100svh',
    },
    justifyContent: {
      default: 'flex-start',
      '@media (min-width: 1024px)': 'center',
    },
  },
});
