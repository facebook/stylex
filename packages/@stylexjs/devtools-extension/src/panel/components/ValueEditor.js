/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as React from 'react';
import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  formatCssValueForDisplay,
  isLongCssValue,
} from '../declarations/formatValue';
import { colors } from '../theme.stylex';
import { ComboBox } from './ComboBox';

export function ValueEditor({
  onCommit,
  suggestions,
  value,
}: {
  onCommit: (value: string) => Promise<void>,
  suggestions: $ReadOnlyArray<string>,
  value: string,
}): React.Node {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const displayValue = formatCssValueForDisplay(value);

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        {...stylex.props(
          styles.valueButton,
          isLongCssValue(value) && styles.longValue,
        )}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        type="button"
      >
        {displayValue}
      </button>
    );
  }

  return (
    <ComboBox
      autoFocus
      disabled={pending}
      onCancel={cancel}
      onChange={setDraft}
      onCommit={(nextValue) => {
        const trimmed = nextValue.trim();
        if (trimmed === '' || trimmed === value.trim()) {
          cancel();
          return;
        }
        setPending(true);
        onCommit(trimmed).then(
          () => {
            setPending(false);
            cancel();
          },
          () => setPending(false),
        );
      }}
      suggestions={suggestions}
      value={draft}
    />
  );
}

const styles = stylex.create({
  valueButton: {
    appearance: 'none',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: {
      default: colors.textPrimary,
      ':focus-visible': colors.textAccent,
      ':hover': colors.textAccent,
    },
    cursor: 'text',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    margin: 0,
    maxWidth: '100%',
    minWidth: 0,
    overflowWrap: 'anywhere',
    padding: 0,
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  },
  longValue: { textWrap: 'pretty' },
});
