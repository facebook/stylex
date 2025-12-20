/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as React from 'react';
import { useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import type { SourcePreview } from '../../types';
import { SourceRow } from './SourceRow';
import { colors } from '../theme.stylex';

export function SourcesList({
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

const styles = stylex.create({
  muted: {
    color: colors.textMuted,
  },
  sourcesList: {
    display: 'grid',
    gap: 6,
  },
});
