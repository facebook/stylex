/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Menu, Item } from './Menu';
import { FileNameDialog, ConfirmDialog } from './Dialogs';
import { vars } from '@/theming/vars.stylex';

export function Tabs({
  files,
  activeFile,
  getDefaultFilename,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onFormat,
}: {
  files: string[];
  activeFile: string;
  getDefaultFilename: (fileKind: string) => string;
  onSelectFile: (filename: string) => void;
  onCreateFile: (fileKind: 'component' | 'stylex', name: string) => void;
  onDeleteFile: (filename: string) => void;
  onRenameFile: (filename: string, newName: string) => void;
  onFormat: () => void;
}) {
  return (
    <div role="tablist" {...stylex.props(styles.tabs)}>
      {files.map((filename, i) => (
        <Tab
          filename={filename}
          immutable={i === 0}
          isActive={activeFile === filename}
          key={filename}
          onDelete={onDeleteFile}
          onRename={onRenameFile}
          onSelect={() => onSelectFile(filename)}
        />
      ))}
      <NewFileButton
        getDefaultFilename={getDefaultFilename}
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
}: {
  filename: string;
  isActive: boolean;
  onSelect: () => void;
  onRename: (filename: string, newName: string) => void;
  onDelete: (filename: string) => void;
  immutable: boolean;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const renameDialogRef = useRef<HTMLDialogElement | null>(null);
  const id = filename.split('.').join('-');

  return (
    <div {...stylex.props(styles.tab, isActive && styles.tabActive)}>
      <button
        aria-selected={isActive}
        onClick={onSelect}
        {...stylex.props(styles.tabLabelButton)}
        role="tab"
        title={filename}
      >
        {filename}
      </button>
      {!immutable && (
        <>
          <button
            {...stylex.props(styles.tabIconButton)}
            popoverTarget={`${id}-menu`}
            type="button"
          >
            ⋯
          </button>
          <Menu id={`${id}-menu`} ref={menuRef}>
            <Item onClick={() => renameDialogRef.current?.showModal()}>
              Rename
            </Item>
            <Item onClick={() => deleteDialogRef.current?.showModal()}>
              Delete
            </Item>
          </Menu>
          <FileNameDialog
            defaultValue={filename}
            description="Rename the file to a new name."
            onCancel={() => renameDialogRef.current?.close()}
            onConfirm={(newName) => onRename(filename, newName)}
            ref={renameDialogRef}
            title="Rename file"
          />
          <ConfirmDialog
            description="Delete the file from the playground."
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
  getDefaultFilename: (fileKind: 'component' | 'stylex') => string;
  onCreateFile: (fileKind: 'component' | 'stylex', name: string) => void;
}) {
  const addButtonRef = useRef(null);
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
    paddingInlineStart: 8,
    backgroundColor: vars['--color-fd-card'],
    gap: 8,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: vars['--color-fd-border'],
  },
  tab: {
    display: 'flex',
    fontSize: 12,
    color: vars['--color-fd-muted-foreground'],
    cursor: 'pointer',
    backgroundColor: 'transparent',
    // borderBottomWidth: 4,
    // borderBottomStyle: 'solid',
    // borderBottomColor: 'transparent',
    borderStyle: 'none',
  },
  tabActive: {
    color: vars['--color-fd-accent-foreground'],
    boxShadow: '0 -4px 0 0 currentColor inset',
  },
  tabLabelButton: {
    backgroundColor: 'transparent',
    color: 'inherit',
    borderStyle: 'none',
    paddingBlock: 8,
    fontSize: 12,
    cursor: 'pointer',
  },
  tabIconButton: {
    backgroundColor: { default: 'transparent', ':hover': 'var(--pink)' },
    color: { default: 'inherit', ':hover': '#fff', ':focus-visible': '#fff' },
    borderRadius: 4,
    height: 32,
    width: 32,
    fontSize: 12,
    cursor: 'pointer',
    borderStyle: 'none',
  },

  addWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: '6px',
  },
});
