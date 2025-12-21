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
// import { openInVsCodeFromStylexSource } from '../../utils/vscode';
import {
  getSourcePreview,
  openSourceBestEffort,
} from '../../devtools/resources';
import { Button } from './Button';
import { colors } from '../theme.stylex';

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
        <button
          {...stylex.props(styles.sourcePath)}
          onClick={() =>
            openSourceBestEffort(src.file, src.line).catch((e) =>
              onError(
                e instanceof Error ? e.message : 'Failed to open source.',
              ),
            )
          }
          title={src.raw}
        >
          {src.raw}
        </button>
        {/* <Button
          onClick={() => openInVsCodeFromStylexSource(src.file, src.line)}
          title="Opens the StyleX source location in VS Code (requires setting a local root path once)."
        >
          VS Code
        </Button> */}
        <Button
          onClick={togglePreview}
          title="Shows file contents (best-effort via DevTools resources)"
        >
          {isPreviewOpen ? 'Hide' : 'Preview'}
        </Button>
      </div>

      {isPreviewOpen ? (
        <div {...stylex.props(styles.sourcePreview)}>
          <pre {...stylex.props(styles.sourcePreviewCode)}>
            {isLoadingPreview ? 'Loading…' : (preview?.snippet ?? '')}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

const styles = stylex.create({
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
    appearance: 'none',
    textAlign: 'start',
    backgroundColor: 'transparent',
    display: 'inline',
    borderStyle: 'none',
    cursor: 'pointer',
    flexGrow: 1,
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    color: {
      default: colors.textPrimary,
      ':hover': colors.textAccent,
      ':focus-visible': colors.textAccent,
    },
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
      ':focus-visible': 'underline',
    },
    wordBreak: 'break-word',
  },
  sourcePreview: {
    // borderWidth: 1,
    // borderStyle: 'solid',
    // borderColor: colors.border,
    // borderRadius: 8,
    // backgroundColor: colors.bgRaised,
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
    color: colors.textMuted,
    wordBreak: 'break-word',
  },
  sourcePreviewCode: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    whiteSpace: 'pre',
    overflow: 'auto',
    maxHeight: 220,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
  },
});
