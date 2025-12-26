/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useRef } from 'react';
import * as stylex from '@stylexjs/stylex';

export function FileNameDialog({
  title,
  description,
  defaultValue,
  onConfirm,
  onCancel,
  ref,
}: {
  title: string;
  description: string;
  defaultValue: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  ref: React.RefObject<HTMLDialogElement | null>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const trimmed = inputRef.current?.value?.trim();
    if (!trimmed) {
      event.preventDefault();
      return;
    }
    onConfirm?.(trimmed);
  };

  return (
    <dialog
      onClose={() => {
        if (inputRef.current) {
          inputRef.current.value = defaultValue;
        }
      }}
      ref={ref}
      style={{ backdropFilter: 'blur(2px)' }}
      {...stylex.props(styles.dialog)}
    >
      <form method="dialog" onSubmit={handleSubmit}>
        <h3 {...stylex.props(styles.heading)}>{title}</h3>
        {description ? (
          <p {...stylex.props(styles.description)}>{description}</p>
        ) : null}

        <div {...stylex.props(styles.field)}>
          <label>
            <span style={{ display: 'none' }}>New filename</span>
            <input
              autoFocus
              defaultValue={defaultValue}
              ref={inputRef}
              {...stylex.props(styles.input)}
            />
          </label>
        </div>
        <div {...stylex.props(styles.actions)}>
          <button
            {...stylex.props(styles.button)}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            {...stylex.props(styles.button, styles.primary)}
            type="submit"
          >
            Confirm
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  ref,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  ref: React.RefObject<HTMLDialogElement | null>;
}) {
  return (
    <dialog
      ref={ref}
      style={{ backdropFilter: 'blur(2px)' }}
      {...stylex.props(styles.dialog)}
    >
      <h3 {...stylex.props(styles.heading)}>{title}</h3>
      <p {...stylex.props(styles.description)}>{description}</p>
      <div {...stylex.props(styles.actions)}>
        <button
          {...stylex.props(styles.button)}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          {...stylex.props(styles.button, styles.primary)}
          onClick={() => {
            onConfirm?.();
          }}
          type="button"
        >
          Confirm
        </button>
      </div>
    </dialog>
  );
}

const styles = stylex.create({
  dialog: {
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--fg2)',
    padding: '20px',
    minWidth: '320px',
    backgroundColor: 'var(--bg1)',
    color: 'var(--fg1)',
  },
  heading: {
    marginTop: 0,
    marginBottom: '8px',
    fontSize: '16px',
  },
  description: {
    marginTop: 0,
    marginBottom: '12px',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  input: {
    padding: '8px',
    borderRadius: '6px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--fg2)',
    backgroundColor: 'var(--bg2)',
    color: 'var(--fg1)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '8px 12px',
    borderRadius: '6px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--fg2)',
    backgroundColor: 'var(--bg2)',
    color: 'var(--fg1)',
    cursor: 'pointer',
  },
  primary: {
    backgroundColor: 'var(--pink)',
    color: 'var(--bg1)',
    borderColor: 'transparent',
  },
});
