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
import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme.stylex';

export function DeclarationsList({
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
          <div {...stylex.props(styles.declList)}>
            {entry.declarations.map((decl, i) => {
              const value = decl.value + (decl.important ? ' !important' : '');
              return (
                <div
                  key={`${decl.property}:${i}`}
                  {...stylex.props(styles.declLine)}
                >
                  <span {...stylex.props(styles.declProperty)}>
                    {decl.property}
                  </span>
                  : {value};
                </div>
              );
            })}
          </div>
          <div {...stylex.props(styles.className)}>{entry.name}</div>
        </div>
      ))}
    </div>
  );
}

const styles = stylex.create({
  muted: {
    color: colors.textMuted,
  },
  classList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingBlock: 8,
  },
  classBlock: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
  },
  className: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    '::before': {
      content: '.',
    },
    color: colors.textMuted,
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
  declProperty: {
    color: colors.textAccent,
  },
});
