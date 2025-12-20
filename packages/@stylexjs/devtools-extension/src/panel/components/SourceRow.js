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
import { useState, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import type { SourcePreview } from '../../types';
import { openInVsCodeFromStylexSource } from '../../utils/vscode';
import {
  getSourcePreview,
  openSourceBestEffort,
} from '../../devtools/resources';

export function SourceRow({
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
          {...stylex.props(styles.button)}
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
          {...stylex.props(styles.button)}
          onClick={() => openInVsCodeFromStylexSource(src.file, src.line)}
          title="Opens the StyleX source location in VS Code (requires setting a local root path once)."
          type="button"
        >
          VS Code
        </button>
        <button
          {...stylex.props(styles.button)}
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
              {...stylex.props(styles.button)}
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

const styles = stylex.create({
  button: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: '#d1d9e0',
      ':hover': '#0969da',
    },
    backgroundColor: '#f6f8fa',
    padding: '4px 8px',
    borderRadius: 6,
    cursor: 'pointer',
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
});
