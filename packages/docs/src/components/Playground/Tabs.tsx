/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useEffect, useRef, useState, type SVGProps } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Menu, Item } from './Menu';
import { FileNameDialog, ConfirmDialog } from './Dialogs';
import { vars, playgroundVars } from '@/theming/vars.stylex';

export function Tabs({
  files,
  activeFile,
  getDefaultFilename,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onFormat,
  readOnly = false,
  hideFileIcon = false,
}: {
  files: string[];
  activeFile: string;
  getDefaultFilename?: (_fileKind: string) => string;
  onSelectFile: (_filename: string) => void;
  onCreateFile?: (_fileKind: 'component' | 'stylex', _name: string) => void;
  onDeleteFile?: (_filename: string) => void;
  onRenameFile?: (_filename: string, _newName: string) => boolean | void;
  onFormat?: () => void;
  readOnly?: boolean;
  hideFileIcon?: boolean;
}) {
  return (
    <div role="tablist" {...stylex.props(styles.tabs)}>
      {files.map((filename, i) => (
        <Tab
          filename={filename}
          hideFileIcon={hideFileIcon}
          immutable={readOnly || i === 0}
          isActive={activeFile === filename}
          key={filename}
          onDelete={readOnly ? undefined : onDeleteFile}
          onRename={readOnly ? undefined : onRenameFile}
          onSelect={() => onSelectFile(filename)}
          readOnly={readOnly}
        />
      ))}
      {!readOnly && onCreateFile && (
        <>
          <NewFileButton
            getDefaultFilename={
              getDefaultFilename ??
              ((_fileKind: 'component' | 'stylex') => 'File.tsx')
            }
            onCreateFile={onCreateFile}
          />
          <div {...stylex.props(styles.addWrapper)}>
            {onFormat ? (
              <button
                {...stylex.props(styles.tabIconButton)}
                onClick={onFormat}
                title="Format file"
                type="button"
              >
                ✨
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function Tab({
  filename,
  isActive,
  onSelect,
  onRename,
  onDelete,
  immutable = false,
  readOnly = false,
  hideFileIcon = false,
}: {
  filename: string;
  isActive: boolean;
  onSelect: () => void;
  onRename?: (_filename: string, _newName: string) => boolean | void;
  onDelete?: (_filename: string) => void;
  immutable: boolean;
  readOnly?: boolean;
  hideFileIcon?: boolean;
}) {
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const renameTimerRef = useRef<number | null>(null);

  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(filename);

  useEffect(() => {
    setDraftName(filename);
  }, [filename]);

  const cancelRename = () => {
    setIsRenaming(false);
    setDraftName(filename);
  };

  const commitRename = () => {
    if (!onRename) {
      setIsRenaming(false);
      return;
    }
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === filename) {
      cancelRename();
      return;
    }
    const renameResult = onRename(filename, trimmed);
    if (renameResult === false) {
      cancelRename();
      return;
    }
    setIsRenaming(false);
  };

  const startLongPress = () => {
    if (immutable || readOnly || !onRename) return;
    renameTimerRef.current = window.setTimeout(() => {
      setIsRenaming(true);
    }, 500);
  };

  const clearLongPress = () => {
    if (renameTimerRef.current != null) {
      clearTimeout(renameTimerRef.current);
      renameTimerRef.current = null;
    }
  };

  return (
    <div {...stylex.props(styles.tab, isActive && styles.tabActive)}>
      <button
        aria-selected={isActive}
        onClick={onSelect}
        onDoubleClick={() =>
          !immutable && !readOnly && onRename && setIsRenaming(true)
        }
        onPointerDown={startLongPress}
        onPointerLeave={clearLongPress}
        onPointerMove={clearLongPress}
        onPointerUp={clearLongPress}
        role="tab"
        title={filename}
        {...stylex.props(styles.tabLabelButton)}
      >
        {!hideFileIcon && <FileIcon {...stylex.props(styles.fileIcon)} />}
        {isRenaming && !readOnly && onRename ? (
          <input
            autoFocus
            onBlur={commitRename}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitRename();
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancelRename();
              }
            }}
            value={draftName}
            {...stylex.props(styles.tabRenameInput)}
          />
        ) : (
          filename
        )}
      </button>
      {!immutable && !readOnly && onDelete && (
        <>
          <button
            {...stylex.props(styles.tabCloseButton)}
            onClick={() => deleteDialogRef.current?.showModal()}
            title="Close file"
            type="button"
          >
            ×
          </button>
          <ConfirmDialog
            description={`Are you sure you want to delete ${filename}?`}
            onCancel={() => deleteDialogRef.current?.close()}
            onConfirm={() => onDelete(filename)}
            ref={deleteDialogRef}
            title="Delete file"
          />
        </>
      )}
    </div>
  );
}

function NewFileButton({
  getDefaultFilename,
  onCreateFile,
}: {
  getDefaultFilename: (_fileKind: 'component' | 'stylex') => string;
  onCreateFile: (_fileKind: 'component' | 'stylex', _name: string) => void;
}) {
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const componentDialogRef = useRef<HTMLDialogElement | null>(null);
  const stylexDialogRef = useRef<HTMLDialogElement | null>(null);

  const id = 'new-file';

  return (
    <>
      <button
        ref={addButtonRef}
        {...stylex.props(styles.tabIconButton)}
        popoverTarget={id}
        title="Add file"
        type="button"
      >
        +
      </button>
      <Menu id={id}>
        <Item onClick={() => componentDialogRef.current?.showModal()}>
          Component file
        </Item>
        <Item onClick={() => stylexDialogRef.current?.showModal()}>
          StyleX vars file
        </Item>
      </Menu>
      <FileNameDialog
        defaultValue={getDefaultFilename('component')}
        description="Add a new component file to the playground."
        onCancel={() => componentDialogRef.current?.close()}
        onConfirm={(name) => onCreateFile('component', name)}
        ref={componentDialogRef}
        title="Create component file"
      />
      <FileNameDialog
        defaultValue={getDefaultFilename('stylex')}
        description="Create a .stylex file for defining StyleX variables, constants and markers"
        onCancel={() => stylexDialogRef.current?.close()}
        onConfirm={(name) => onCreateFile('stylex', name)}
        ref={stylexDialogRef}
        title="Create StyleX file"
      />
    </>
  );
}

const styles = stylex.create({
  tabs: {
    display: 'flex',
    gap: 8,
    paddingInlineStart: 8,
    backgroundColor: playgroundVars['--pg-header-surface'],
    borderBottomColor: playgroundVars['--pg-tabs-border'],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  tab: {
    display: 'flex',
    fontSize: 12,
    color: vars['--color-fd-foreground'],
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderStyle: 'none',
  },
  tabActive: {
    color: vars['--color-fd-primary'],
    boxShadow: `0 -2px 0 0 ${vars['--color-fd-primary']} inset`,
  },
  tabLabelButton: {
    display: 'inline-flex',
    gap: 4,
    alignItems: 'center',
    paddingBlock: 8,
    paddingInline: 6,
    fontSize: 12,
    color: 'inherit',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderStyle: 'none',
  },
  tabRenameInput: {
    flexShrink: 1,
    minWidth: 0,
    height: '1.4em',
    padding: 0,
    fontSize: 12,
    lineHeight: 1.4,
    color: 'inherit',
    outline: 'none',
    backgroundColor: 'transparent',
    borderStyle: 'none',
  },
  fileIcon: {
    display: 'inline-flex',
    minWidth: 12,
    color: 'currentColor',
  },
  tabIconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 4,
    fontSize: 14,
    lineHeight: 1,
    color: { default: vars['--color-fd-foreground'] },
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${vars['--color-fd-foreground']} 8%, transparent)`,
    },
    borderStyle: 'none',
    borderRadius: 4,
  },
  tabCloseButton: {
    paddingBlock: 8,
    paddingRight: 6,
    fontSize: 12,
    lineHeight: 1,
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':hover': vars['--color-fd-foreground'],
    },
    cursor: 'pointer',
    backgroundColor: { default: 'transparent' },
    borderStyle: 'none',
  },
  addWrapper: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginLeft: 'auto',
  },
});

function FileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="12"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
