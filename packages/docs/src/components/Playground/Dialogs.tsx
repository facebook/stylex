/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

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
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <dialog
      onClick={handleBackdropClick}
      ref={ref}
      {...stylex.props(styles.dialog)}
    >
      <div {...stylex.props(styles.content)}>
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
            onClick={() => onConfirm?.()}
            type="button"
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
}

const styles = stylex.create({
  dialog: {
    top: '50%',
    left: '50%',
    width: 480,
    maxWidth: '100%',
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '8px',
    boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
    transform: 'translate(-50%, -50%)',
    '::backdrop': {
      backdropFilter: 'brightness(0.8) blur(2px)',
    },
  },
  content: {
    padding: '20px',
    fontStyle: 'normal',
    color: vars['--color-fd-muted-foreground'],
    textTransform: 'none',
  },
  heading: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: '1rem',
    fontStyle: 'normal',
    color: vars['--color-fd-foreground'],
  },
  description: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 13,
    fontStyle: 'normal',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  button: {
    paddingBlock: 8,
    paddingInline: 12,
    fontStyle: 'normal',
    color: vars['--color-fd-foreground'],
    cursor: 'pointer',
    backgroundColor: vars['--color-fd-background'],
    borderStyle: 'none',
    borderRadius: 6,
    boxShadow: `0 0 0 1px ${vars['--color-fd-border']}`,
  },
  primary: {
    color: vars['--color-fd-primary-foreground'],
    backgroundColor: vars['--color-fd-primary'],
    borderColor: 'transparent',
    boxShadow: null,
  },
});
