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
import { useState, useCallback, use, Suspense, useTransition } from 'react';
import * as stylex from '@stylexjs/stylex';
import type { SourcePreview } from '../../types';
// import { openInVsCodeFromStylexSource } from '../../utils/vscode';

import {
  getSourcePreview,
  openSourceBestEffort,
} from '../../devtools/resources';
// import { Button } from './Button';
import { colors } from '../theme.stylex';
import { EyeIcon } from './EyeIcon';

export function SourceRow({
  src,
  onError,
}: {
  src: { raw: string, file: string, line: number | null, ... },
  onError: (message: string) => void,
}): React.Node {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const togglePreview = useCallback(() => {
    startTransition(() => {
      setIsPreviewOpen((open) => !open);
    });
  }, []);

  return (
    <div {...stylex.props(styles.sourceEntry)}>
      <div {...stylex.props(styles.sourceRow)}>
        <button
          {...stylex.props(
            styles.pill,
            isPreviewOpen && styles.pillActive,
            isPending && styles.buttonPending,
          )}
          onClick={togglePreview}
          title="Order in data-style-src"
        >
          <EyeIcon xstyle={styles.icon} />
        </button>
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
        {/* <Button
          onClick={togglePreview}
          title="Shows file contents (best-effort via DevTools resources)"
          xstyle={isPending ? styles.buttonPending : undefined}
        >
          {isPreviewOpen ? 'Hide' : 'Preview'}
        </Button> */}
      </div>

      {isPreviewOpen ? (
        <div {...stylex.props(styles.sourcePreview)}>
          <SourceSnippetSuspense file={src.file} line={src.line ?? 0} />
        </div>
      ) : null}
    </div>
  );
}

const cache: { [string]: Promise<SourcePreview> } = {};
function getSourcePreviewPromise(file: string, line: number) {
  const cacheKey = `${file}:${line}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }
  const promise = getSourcePreview(file, line);
  cache[cacheKey] = promise;
  return promise;
}

function SourceSnippet({ file, line }: { file: string, line: number }) {
  const preview = use(getSourcePreviewPromise(file, line));

  return (
    <pre {...stylex.props(styles.sourcePreviewCode)}>
      {preview?.snippet ?? 'no source found'}
    </pre>
  );
}

function SourceSnippetSuspense({ file, line }: { file: string, line: number }) {
  return (
    <Suspense fallback={<SourceSnippetFallback />}>
      <SourceSnippet file={file} line={line} />
    </Suspense>
  );
}

function SourceSnippetFallback() {
  return (
    <div {...stylex.props(styles.sourcePreviewCode, styles.loading)}>
      Loading…
    </div>
  );
}

const styles = stylex.create({
  icon: {
    width: 16,
    height: 16,
  },
  pill: {
    appearance: 'none',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgRaised,
      ':focus-visible': colors.bgRaised,
    },
    transform: {
      default: null,
      ':active': 'scale(0.95)',
    },
    display: 'inline-block',
    paddingTop: 8,
    paddingBottom: 2,
    paddingInline: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'none',
  },
  pillActive: {
    color: colors.textAccent,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textMuted,
  },
  sourceEntry: {
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sourceRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
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
  buttonPending: {
    opacity: 0.5,
  },
  sourcePreview: {},
  sourcePreviewCode: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    whiteSpace: 'pre',
    width: '100%',
    overflow: 'auto',
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 6,
    margin: 0,
    padding: 8,
  },
});
