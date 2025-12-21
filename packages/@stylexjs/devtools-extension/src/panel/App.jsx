/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import * as React from 'react';
import {
  useState,
  useCallback,
  useEffect,
  use,
  startTransition,
  Suspense,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import type { StylexDebugData } from '../types.js';
import { subscribeToSelectionAndNavigation } from '../devtools/events.js';
import { evalInInspectedWindow } from '../devtools/api.js';
import { collectStylexDebugData } from '../inspected/collectStylexDebugData.js';
import { Button } from './components/Button';
import { DeclarationsList } from './components/DeclarationsList';
import { SourcesList } from './components/SourcesList';
import { Section } from './components/Section';
import { colors } from './theme.stylex';
import Logo from './components/Logo';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App(): React.Node {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    startTransition(async () => {
      setCount((x) => x + 1);
    });
  }, []);

  useEffect(() => subscribeToSelectionAndNavigation(refresh), [refresh]);

  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary
        fallback={(error) => (
          <ErrorFallback errorMessage={error.message} retry={refresh} />
        )}
        key={count}
      >
        <Panel id={count} key={count} refresh={refresh} />
      </ErrorBoundary>
    </Suspense>
  );
}

function Loading() {
  return (
    <div {...stylex.props(styles.fallbackContainer)}>
      <Logo xstyle={styles.logo} />
    </div>
  );
}

function ErrorFallback({
  errorMessage,
  retry,
}: {
  errorMessage: string,
  retry: () => void,
}) {
  return (
    <div {...stylex.props(styles.fallbackContainer)}>
      <div {...stylex.props(styles.errorMessage)}>{errorMessage}</div>
      <Button onClick={retry}>Retry</Button>
    </div>
  );
}

let cache: ?[number, Promise<StylexDebugData>] = null;
const debugDataPromise = (id: number): Promise<StylexDebugData> => {
  if (cache != null && cache[0] === id) {
    return cache[1];
  }
  const promise = evalInInspectedWindow(collectStylexDebugData);
  cache = [id, promise];
  return promise;
};

function Panel({
  id,
  refresh,
}: {
  id: number,
  refresh: () => void,
}): React.Node {
  const data = use(debugDataPromise(id));

  const tagName = data?.element?.tagName ?? '—';

  const classes = data?.applied?.classes ?? [];
  const computed = data?.computed ?? {};

  const hasSources = data?.sources?.length > 0;
  const hasClasses = classes.length > 0;
  const showEmptyState = !hasSources && !hasClasses;

  return (
    <div {...stylex.props(styles.root)}>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.title)}>
          <Logo xstyle={styles.logo} />
        </div>
        <div {...stylex.props(styles.title)}>
          <span {...stylex.props(styles.pill, styles.mono)}>{tagName}</span>
          <Button onClick={refresh}>Refresh</Button>
        </div>
      </header>

      {/* <div
        {...stylex.props(
          styles.status,
          status.kind === 'error' && styles.statusError,
        )}
      >
        {status.message}
      </div> */}

      {hasSources && (
        <Section title="Sources">
          <SourcesList onError={(_msg) => {}} sources={data.sources} />
        </Section>
      )}

      {hasClasses && (
        <Section title="Applied Styles">
          <DeclarationsList classes={classes} computed={computed} />
        </Section>
      )}

      {showEmptyState && (
        <div {...stylex.props(styles.emptyState)}>No styles found</div>
      )}
    </div>
  );
}

const styles = stylex.create({
  fallbackContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    boxSizing: 'border-box',
    color: 'tomato',
    fontSize: '0.8rem',
    fontWeight: 400,
    padding: 16,
    width: '100%',
    whiteSpace: 'pre-wrap',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: colors.textMuted,
    padding: 16,
  },
  root: {
    backgroundColor: colors.bg,
    color: colors.textPrimary,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    fontSize: 12,
    minHeight: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    height: '2rem',
    color: colors.textPrimary,
  },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: 13,
  },

  status: {
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 10,
  },
  statusError: {
    color: '#cf222e',
  },

  pill: {
    display: 'inline-block',
    paddingTop: 1,
    paddingRight: 6,
    paddingBottom: 1,
    paddingLeft: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.bgRaised,
    color: colors.textMuted,
    fontSize: 11,
  },
});
