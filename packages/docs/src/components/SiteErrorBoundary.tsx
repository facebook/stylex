/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { Component, type ReactNode } from 'react';

const DEFAULT_TITLE = 'StyleX — The styling system for ambitious interfaces';
const DEFAULT_DESCRIPTION = 'The styling system that powers Meta.';
const RELOAD_KEY_PREFIX = 'stylex:chunk-reload:';
const RELOAD_WINDOW_MS = 60_000;
const DYNAMIC_IMPORT_ERROR =
  /chunkloaderror|failed to fetch dynamically imported module|importing a module script failed|loading chunk .* failed/i;

type State = {
  error: unknown | null;
};

function getReloadKey(): string {
  return `${RELOAD_KEY_PREFIX}${window.location.pathname}`;
}

function reloadAfterDynamicImportError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  if (!DYNAMIC_IMPORT_ERROR.test(message)) {
    return;
  }

  try {
    const key = getReloadKey();
    const lastReload = Number(window.sessionStorage.getItem(key) ?? 0);
    if (Date.now() - lastReload < RELOAD_WINDOW_MS) {
      return;
    }
    window.sessionStorage.setItem(key, String(Date.now()));
  } catch {
    return;
  }

  window.location.reload();
}

export class SiteErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown): void {
    reloadAfterDynamicImportError(error);
  }

  render(): ReactNode {
    if (this.state.error == null) {
      return this.props.children;
    }

    return (
      <>
        <title>{DEFAULT_TITLE}</title>
        <meta content={DEFAULT_DESCRIPTION} name="description" />
        <meta content="noindex" name="robots" />
        <main
          data-nosnippet=""
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, sans-serif',
            height: '100dvh',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h1>StyleX is temporarily unavailable</h1>
          <p>Refresh the page to try again.</p>
          <button
            onClick={() => {
              try {
                window.sessionStorage.removeItem(getReloadKey());
              } catch {}
              window.location.reload();
            }}
            type="button"
          >
            Refresh
          </button>
        </main>
      </>
    );
  }
}
