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

import type { SourcePreview, StatusState, StylexDebugData } from '../types.js';
import { subscribeToSelectionAndNavigation } from '../devtools/events.js';
import { evalInInspectedWindow } from '../devtools/api.js';
import {
  openSourceBestEffort,
  getSourcePreview,
} from '../devtools/resources.js';
import { openInVsCodeFromStylexSource } from '../utils/vscode.js';
import { collectStylexDebugData } from '../inspected/collectStylexDebugData.js';

export function App(): React.Node {
  const [data, setData] = useState<StylexDebugData | null>(null);
  const [status, setStatus] = useState<StatusState>({
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
          <span>StyleX</span>
          <span {...stylex.props(styles.pill, styles.mono)}>{tagName}</span>
        </div>
        <div>
          <button
            type="button"
            {...stylex.props(styles.button, styles.buttonHover)}
            onClick={refresh}
          >
            Refresh
          </button>
        </div>
      </header>

      <div
        {...stylex.props(
          styles.status,
          status.kind === 'error' && styles.statusError,
        )}
      >
        {status.message}
      </div>

      <Section title="Sources">
        <SourcesList
          onError={(msg) => setStatus({ message: msg, kind: 'error' })}
          sources={data?.sources ?? []}
        />
      </Section>

      <Section title="Applied StyleX Declarations">
        <DeclarationsList classes={classes} />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string,
  children: React.Node,
}): React.Node {
  return (
    <section {...stylex.props(styles.section)}>
      <h2 {...stylex.props(styles.sectionTitle)}>{title}</h2>
      {children}
    </section>
  );
}

function SourcesList({
  sources,
  onError,
}: {
  sources: $ReadOnlyArray<{
    raw: string,
    file: string,
    line: number | null,
    ...
  }>,
  onError: (message: string) => void,
}): React.Node {
  const previewCacheRef = useRef<Map<string, SourcePreview>>(new Map());

  if (sources.length === 0) {
    return <div {...stylex.props(styles.muted)}>No data-style-src found.</div>;
  }

  return (
    <div {...stylex.props(styles.sourcesList)}>
      {sources.map((src, index) => (
        <SourceRow
          index={index}
          key={src.raw ?? `${src.file}:${String(src.line ?? '')}:${index}`}
          onError={onError}
          previewCache={previewCacheRef.current}
          src={src}
        />
      ))}
    </div>
  );
}

function SourceRow({
  src,
  index,
  previewCache,
  onError,
}: {
  src: { raw: string, file: string, line: number | null, ... },
  index: number,
  previewCache: Map<string, SourcePreview>,
  onError: (message: string) => void,
}): React.Node {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<SourcePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const key = src.raw ?? `${src.file}:${String(src.line ?? '')}`;

  const openPreview = useCallback(() => {
    setIsPreviewOpen(true);
    const cached = previewCache.get(key);
    if (cached) {
      setPreview(cached);
      return;
    }
    setIsLoadingPreview(true);
    getSourcePreview(src.file, src.line)
      .then((value) => {
        previewCache.set(key, value);
        setPreview(value);
      })
      .catch((e) => {
        onError(e instanceof Error ? e.message : 'Failed to load preview.');
      })
      .finally(() => setIsLoadingPreview(false));
  }, [key, onError, previewCache, src.file, src.line]);

  const togglePreview = useCallback(() => {
    if (isPreviewOpen) {
      setIsPreviewOpen(false);
      return;
    }
    openPreview();
  }, [isPreviewOpen, openPreview]);

  return (
    <div {...stylex.props(styles.sourceEntry)}>
      <div {...stylex.props(styles.sourceRow)}>
        <span {...stylex.props(styles.pill)} title="Order in data-style-src">
          {index + 1}
        </span>
        <span {...stylex.props(styles.sourcePath)} title={src.raw}>
          {src.raw}
        </span>
        <button
          {...stylex.props(styles.button, styles.buttonHover)}
          onClick={() =>
            openSourceBestEffort(src.file, src.line).catch((e) =>
              onError(
                e instanceof Error ? e.message : 'Failed to open source.',
              ),
            )
          }
          title="Best-effort: opens the closest matching loaded resource"
          type="button"
        >
          Open
        </button>
        <button
          {...stylex.props(styles.button, styles.buttonHover)}
          onClick={() => openInVsCodeFromStylexSource(src.file, src.line)}
          title="Opens the StyleX source location in VS Code (requires setting a local root path once)."
          type="button"
        >
          VS Code
        </button>
        <button
          {...stylex.props(styles.button, styles.buttonHover)}
          onClick={togglePreview}
          title="Shows file contents (best-effort via DevTools resources)"
          type="button"
        >
          {isPreviewOpen ? 'Hide' : 'Preview'}
        </button>
      </div>

      {isPreviewOpen ? (
        <div {...stylex.props(styles.sourcePreview)}>
          <div {...stylex.props(styles.sourcePreviewHeader)}>
            <div {...stylex.props(styles.sourcePreviewUrl)}>
              {preview?.url ? preview.url : src.file}
            </div>
            <button
              type="button"
              {...stylex.props(styles.button, styles.buttonHover)}
              onClick={() => setIsPreviewOpen(false)}
            >
              Hide
            </button>
          </div>
          <pre {...stylex.props(styles.sourcePreviewCode)}>
            {isLoadingPreview ? 'Loading…' : (preview?.snippet ?? '')}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function DeclarationsList({
  classes,
}: {
  classes: $ReadOnlyArray<
    $ReadOnly<{
      name: string,
      declarations: $ReadOnlyArray<{
        property: string,
        value: string,
        important: boolean,
        ...
      }>,
      ...
    }>,
  >,
}): React.Node {
  if (classes.length === 0) {
    return (
      <div {...stylex.props(styles.muted)}>
        No matching StyleX CSS rules found for the selected element.
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.classList)}>
      {classes.map((entry) => (
        <div key={entry.name} {...stylex.props(styles.classBlock)}>
          <div {...stylex.props(styles.className)}>{entry.name}</div>
          <div {...stylex.props(styles.declList)}>
            {entry.declarations.map((decl, i) => {
              const value = decl.value + (decl.important ? ' !important' : '');
              return (
                <div
                  key={`${decl.property}:${i}`}
                  {...stylex.props(styles.declLine)}
                >
                  {decl.property}: {value};
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = stylex.create({
  root: {
    padding: 10,
    backgroundColor: '#ffffff',
    color: '#1f2328',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    fontSize: 12,
    height: '100%',
    boxSizing: 'border-box',
  },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: 13,
  },
  button: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d9e0',
    backgroundColor: '#f6f8fa',
    padding: '4px 8px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  buttonHover: {
    borderColor: { ':hover': '#0969da' },
  },
  status: {
    color: '#5e636a',
    marginTop: 6,
    marginBottom: 10,
  },
  statusError: {
    color: '#cf222e',
  },
  section: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d9e0',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 600,
  },
  muted: {
    color: '#5e636a',
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
    borderColor: '#d1d9e0',
    backgroundColor: '#f6f8fa',
    color: '#5e636a',
    fontSize: 11,
  },
  sourcesList: {
    display: 'grid',
    gap: 6,
  },
  sourceEntry: {
    display: 'grid',
    gap: 6,
  },
  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sourcePath: {
    flex: 1,
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    color: '#1f2328',
    wordBreak: 'break-word',
  },
  sourcePreview: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d9e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    marginLeft: 28,
  },
  sourcePreviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  sourcePreviewUrl: {
    flex: 1,
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    color: '#5e636a',
    wordBreak: 'break-word',
  },
  sourcePreviewCode: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    whiteSpace: 'pre',
    overflow: 'auto',
    maxHeight: 220,
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d9e0',
    borderRadius: 6,
    padding: 8,
  },
  classList: {
    display: 'grid',
    gap: 8,
  },
  classBlock: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d9e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f6f8fa',
  },
  className: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    fontWeight: 600,
    marginBottom: 6,
    wordBreak: 'break-word',
  },
  declList: {
    display: 'grid',
    gap: 4,
  },
  declLine: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
});
