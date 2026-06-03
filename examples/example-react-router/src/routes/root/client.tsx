/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import * as stylex from '@stylexjs/stylex';
import { Button } from '@stylexjs/shared-ui';
import { tokens } from '@stylexjs/shared-ui/tokens.stylex';
import {
  isRouteErrorResponse,
  Link,
  NavLink,
  useNavigation,
  useRouteError,
} from 'react-router';

import MainArticle from '../../components/MainArticle';
import { DevStyleXInject } from './DevStyleXInject';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
        {import.meta.env.DEV ? <DevStyleXInject /> : null}
        <meta charSet="utf-8" />
      </head>
      <body {...stylex.props(layoutStyles.body)}>
        <header {...stylex.props(layoutStyles.header)}>
          <div {...stylex.props(layoutStyles.shell)}>
            <Link to="/" {...stylex.props(layoutStyles.brand)}>
              React Router 🚀
            </Link>
            <Button onClick={() => console.log('Router Test')}>Ext</Button>
            <nav>
              <ul {...stylex.props(layoutStyles.navList)}>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      stylex.props(
                        layoutStyles.navLink,
                        layoutStyles.navLinkHover,
                        isActive && layoutStyles.navLinkActive,
                      ).className
                    }
                    end
                    to="/"
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      stylex.props(
                        layoutStyles.navLink,
                        layoutStyles.navLinkHover,
                        isActive && layoutStyles.navLinkActive,
                      ).className
                    }
                    to="/about"
                  >
                    About
                  </NavLink>
                </li>
              </ul>
            </nav>
            <div>
              {navigation.state !== 'idle' && (
                <p {...stylex.props(layoutStyles.loadingText)}>Loading…</p>
              )}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

const MEDIA_SM = '@media (min-width: 640px)' as const;

const layoutStyles = stylex.create({
  body: {
    fontFamily:
      "'Inter', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    minHeight: '100vh',
  },
  header: {
    position: 'sticky',
    insetBlockStart: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    zIndex: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e4e7eb',
  },
  shell: {
    marginInline: 'auto',
    maxWidth: 1200,
    paddingInline: '16px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    gap: '1rem',
    [MEDIA_SM]: {
      gap: '2rem',
    },
  },
  brand: {
    fontSize: '1rem',
    fontWeight: 600,
    color: tokens.primaryColor,
    textDecoration: 'none',
  },
  navList: {
    display: 'flex',
    gap: '1rem',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  navLink: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#111827',
    textDecorationLine: 'none',
    transitionProperty: 'opacity',
    transitionDuration: '120ms',
    opacity: 0.9,
  },
  navLinkHover: {
    opacity: {
      ':hover': 0.65,
    },
  },
  navLinkActive: {
    color: '#2563eb',
    opacity: 1,
  },
  loadingText: {
    fontSize: '0.875rem',
    color: '#2563eb',
  },
});

export function ErrorBoundary() {
  const error = useRouteError();
  let status = 500;
  let message = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = status === 404 ? 'Page not found.' : error.statusText || message;
  }

  return (
    <MainArticle>
      <h1>{status}</h1>
      <p>{message}</p>
    </MainArticle>
  );
}
