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

export function Tabs({
  files,
  activeFile,
  disableDelete,
  getDefaultFilename,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onFormat,
}) {
  return (
    <div role="tablist" {...stylex.props(styles.tabs)}>
      {files.map((filename) => (
        <Tab
          disableDelete={disableDelete}
          filename={filename}
          isActive={activeFile === filename}
          key={filename}
          onDelete={onDeleteFile}
          onRename={onRenameFile}
          onSelect={() => onSelectFile(filename)}
        />
      ))}
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
        <NewFileButton
          getDefaultFilename={getDefaultFilename}
          onCreateFile={onCreateFile}
        />
      </div>
    </div>
  );
}

function Tab({ filename, isActive, onSelect, onRename, onDelete }) {
  const menuRef = useRef(null);
  const renameDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const id = filename.split('.').join('-');

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    menuRef.current?.showPopover();
  };

  return (
    <div {...stylex.props(styles.tab, isActive && styles.tabActive)}>
      <button
        aria-selected={isActive}
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        {...stylex.props(styles.tabLabelButton)}
        role="tab"
        title={filename}
      >
        {filename}
      </button>
      <button
        {...stylex.props(styles.tabIconButton)}
        popovertarget={`${id}-menu`}
        title="Add file"
        type="button"
      >
        ...
      </button>
      <Menu id={`${id}-menu`}>
        <Item onClick={() => renameDialogRef.current?.showModal()}>Rename</Item>
        <Item onClick={() => deleteDialogRef.current?.showModal()}>Delete</Item>
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
        onCancel={() => dialogRef.current?.close()}
        onConfirm={() => onDelete(filename)}
        ref={deleteDialogRef}
        title="Delete file"
      />
    </div>
  );
}

function NewFileButton({ getDefaultFilename, onCreateFile }) {
  const addButtonRef = useRef(null);
  const componentDialogRef = useRef(null);
  const stylexDialogRef = useRef(null);

  const id = 'new-file';

  return (
    <>
      <button
        ref={addButtonRef}
        {...stylex.props(styles.tabIconButton)}
        popovertarget={id}
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
    backgroundColor: 'var(--bg1)',
    gap: 4,
    paddingLeft: '2px',
    paddingTop: 4,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--fg2)',
    alignItems: 'center',
  },
  tab: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: '10px',
    paddingRight: '10px',
    fontSize: 12,
    color: 'var(--fg1)',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottomWidth: 4,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    borderStyle: 'none',
  },
  tabActive: {
    color: 'var(--pink)',
    fontWeight: 600,
    borderBottomColor: 'currentColor',
  },
  tabLabelButton: {
    backgroundColor: 'transparent',
    color: 'inherit',
    borderStyle: 'none',
    padding: 0,
    fontSize: 12,
    cursor: 'pointer',
  },
  tabIconButton: {
    backgroundColor: { default: 'transparent', ':hover': 'var(--pink)' },
    color: { default: 'inherit', ':hover': '#fff', ':focus-visible': '#fff' },
    borderRadius: 4,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
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
  dialog: {
    borderRadius: 8,
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
    marginBottom: 8,
    fontSize: '16px',
  },
  description: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: '13px',
    lineHeight: 1.5,
  },
  error: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: '13px',
    color: 'var(--pink)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  input: {
    padding: 8,
    borderRadius: '6px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--fg2)',
    backgroundColor: 'var(--bg2)',
    color: 'var(--fg1)',
  },
  actions: {
    display: 'flex',
    gap: 8,
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
