/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

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
  onConfirm: (_name: string) => void;
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
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: vars['--color-fd-border'],
    padding: '20px',
    width: 480,
    maxWidth: '100%',
    backgroundColor: vars['--color-fd-card'],
    color: vars['--color-fd-muted-foreground'],
    boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
    '::backdrop': {
      backdropFilter: 'brightness(0.8) blur(2px)',
    },
  },
  heading: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: '1rem',
    color: vars['--color-fd-foreground'],
  },
  description: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  input: {
    padding: 8,
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars['--color-fd-border'],
    backgroundColor: vars['--color-fd-background'],
    color: vars['--color-fd-foreground'],
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  button: {
    paddingBlock: 8,
    paddingInline: 12,
    borderRadius: 6,
    boxShadow: `0 0 0 1px ${vars['--color-fd-border']}`,
    backgroundColor: vars['--color-fd-background'],
    color: vars['--color-fd-foreground'],
    cursor: 'pointer',
  },
  primary: {
    backgroundColor: vars['--color-fd-primary'],
    color: vars['--color-fd-primary-foreground'],
    borderColor: 'transparent',
    boxShadow: null,
  },
});
