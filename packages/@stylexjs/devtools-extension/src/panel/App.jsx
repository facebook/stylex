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
import { useState, useCallback, useEffect, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';

import type { StatusState, StylexDebugData } from '../types.js';
import { subscribeToSelectionAndNavigation } from '../devtools/events.js';
import { evalInInspectedWindow } from '../devtools/api.js';
import { collectStylexDebugData } from '../inspected/collectStylexDebugData.js';
import { Button } from './components/Button';
import { DeclarationsList } from './components/DeclarationsList';
import { SourcesList } from './components/SourcesList';
import { Section } from './components/Section';
import { colors } from './theme.stylex';
import Logo from './components/Logo';

export function App(): React.Node {
  const [data, setData] = useState<StylexDebugData | null>(null);
  const [_status, setStatus] = useState<StatusState>({
    message: 'Loading…',
    kind: 'info',
  });

  const requestIdRef = useRef<number>(0);

  const refresh = useCallback(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setStatus({ message: 'Loading…', kind: 'info' });
    evalInInspectedWindow(collectStylexDebugData)
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setData(result);
        setStatus({ message: 'Ready', kind: 'info' });
      })
      .catch((e) => {
        console.error('RAN INTO ERROR', e);
        if (requestId !== requestIdRef.current) return;
        setStatus({
          message: e instanceof Error ? e.message : 'Unknown error.',
          kind: 'error',
        });
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => subscribeToSelectionAndNavigation(refresh), [refresh]);

  const tagName = data?.element?.tagName ?? '—';

  const classes = data?.applied?.classes ?? [];

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

      <Section title="Sources">
        <SourcesList
          onError={(msg) => setStatus({ message: msg, kind: 'error' })}
          sources={data?.sources ?? []}
        />
      </Section>

      <Section title="Applied Styles">
        <DeclarationsList classes={classes} />
      </Section>
    </div>
  );
}

const styles = stylex.create({
  root: {
    backgroundColor: colors.bg,
    color: colors.textPrimary,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    fontSize: 12,
    height: '100%',
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
