/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import stylexPlugin from '@stylexjs/babel-plugin';
import * as stylex from '@stylexjs/stylex';
import { transform } from '@babel/standalone';
import { loadSandpackClient } from '@codesandbox/sandpack-client';
import Editor from '@monaco-editor/react';
import path from 'path-browserify';
import { useColorMode } from '@docusaurus/theme-common';
import {
  useQueryParam,
  StringParam,
  ObjectParam,
  withDefault,
} from 'use-query-params';
import prettier from 'prettier';
import * as babelPlugin from 'prettier/plugins/babel.js';
import * as estreePlugin from 'prettier/plugins/estree.js';

const INITIAL_INPUT_FILES = {
  'App.js': `import * as stylex from '@stylexjs/stylex';
import { colors } from './tokens.stylex';

const styles = stylex.create({
  container: {
    padding: 16,
    backgroundColor: colors.primary,
    color: colors.secondary,
    fontSize: '2rem',
  },
});

function App() {
  return <div {...stylex.props(styles.container)}>Hello World!</div>;
}

export default App;`,
  'tokens.stylex.js': `import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
  primary: 'rebeccapurple',
  secondary: 'cyan',
});`,
};

const INITIAL_BUNDLER_FILES = {
  '/index.js': {
    code: `import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App />);`,
  },
  '/public/index.html': {
    code: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body><div id="root"></div></body>
</html>`,
  },
  '/package.json': {
    code: JSON.stringify(
      {
        main: '/index.js',
        dependencies: {
          react: 'latest',
          'react-dom': 'latest',
        },
      },
      null,
      2,
    ),
  },
  '/node_modules/@stylexjs/stylex/package.json': {
    code: JSON.stringify(
      {
        name: '@stylexjs/stylex',
        main: './index.js',
      },
      null,
      2,
    ),
  },
  '/node_modules/@stylexjs/stylex/index.js': {
    code: STYLEX_SOURCE, // global variable from DefinePlugin()
  },
};

const CSS_PRELUDE = `@layer resets {
:root {
  color-scheme: light dark;
}
* {
  box-sizing: border-box;
}
html, body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
}
`;

function transformSourceFiles(sourceFiles) {
  const stylexRules = [];
  const transformedFiles = {};

  const sourceFilePaths = Object.keys(sourceFiles).map(
    (filename) => `/${filename}`,
  );

  for (const [filename, code] of Object.entries(sourceFiles)) {
    const result = transform(code, {
      filename,
      plugins: [
        'syntax-jsx',
        [
          stylexPlugin,
          {
            dev: false,
            unstable_moduleResolution: {
              type: 'custom',
              filePathResolver(importPath, sourceFilePath) {
                if (importPath.startsWith('.')) {
                  const result = path.resolve(
                    path.dirname(sourceFilePath),
                    importPath,
                  );
                  if (sourceFilePaths.includes(result)) {
                    return result;
                  }
                  const matchingPrefix = sourceFilePaths.find((fullPath) =>
                    fullPath.startsWith(result),
                  );
                  if (matchingPrefix) {
                    return matchingPrefix;
                  }
                }
                return undefined;
              },
              getCanonicalFilePath(filePath) {
                return filePath;
              },
            },
          },
        ],
      ],
    });
    transformedFiles[filename] = result.code;
    if (result.metadata.stylex) {
      stylexRules.push(...result.metadata.stylex);
    }
  }

  const generatedCSS = stylexPlugin.processStylexRules(stylexRules, {
    useLayers: true,
  });

  return { transformedFiles, generatedCSS };
}

const styles = stylex.create({
  container: {
    display: 'flex',
    height: 'calc(100vh - 60px)',
    gap: '8px',
    padding: '8px',
  },
  column: {
    flexGrow: 1,
    flexShrink: 1,
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
  },
  resizeH: {
    resize: 'horizontal',
  },
  resizeV: {
    resize: 'vertical',
  },
  panel: {
    position: 'relative',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    backgroundColor: 'var(--bg1)',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--fg2)',
    overflow: 'hidden',
  },
  panelHeader: {
    backgroundColor: 'var(--bg2)',
    padding: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--fg1)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--fg2)',
  },
  tabs: {
    display: 'flex',
    backgroundColor: 'var(--bg1)',
    gap: '4px',
    paddingLeft: '2px',
    paddingTop: '4px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--fg2)',
  },
  tab: {
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '10px',
    paddingRight: '10px',
    fontSize: '12px',
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
    fontSize: '12px',
    cursor: 'pointer',
  },
  tabIconButton: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--pink)',
      ':focus-visible': 'var(--pink)',
    },
    color: {
      default: 'var(--fg1)',
      ':hover': 'white',
      ':focus-visible': 'white',
    },
    borderStyle: 'none',
    borderRadius: '4px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '6px',
    paddingRight: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  addWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  addMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'var(--bg1)',
    borderStyle: 'none',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    padding: '6px',
    gap: '4px',
    zIndex: 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  addMenuItem: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--pink)',
      ':focus-visible': 'var(--pink)',
    },
    width: 'max-content',
    appearance: 'none',
    borderStyle: 'none',
    color: {
      default: 'var(--fg1)',
      ':hover': 'white',
      ':focus-visible': 'white',
    },
    textAlign: 'left',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
  },
  tabMenu: {
    position: 'fixed',
    backgroundColor: 'var(--bg1)',
    borderStyle: 'none',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    padding: '6px',
    gap: '4px',
    zIndex: 3,
    boxShadow: '0 8px 16px rgba(0,0,0,0.35)',
    minWidth: '120px',
  },
  tabMenuItem: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--pink)',
      ':focus-visible': 'var(--pink)',
    },
    borderStyle: 'none',
    color: {
      default: 'var(--fg1)',
      ':hover': 'white',
      ':focus-visible': 'white',
    },
    textAlign: 'left',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: '4px',
  },
  tabMenuItemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  iframe: {
    flex: '1',
    width: '100%',
    height: '100%',
    borderWidth: '0',
    outline: 'none',
    backgroundColor: 'var(--bg1)',
    color: 'var(--fg1)',
  },
  spacer: {
    flexGrow: 1,
  },
  error: {
    backgroundColor: 'red',
    color: 'white',
    padding: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    maxHeight: 'min(160px, 20vh)',
    overflow: 'auto',
  },
});

const encodeObjKeys = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, encodeURIComponent(value)]),
  );
};

const decodeObjKeys = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, decodeURIComponent(value)]),
  );
};

export default function PlaygroundNew() {
  const [_inputFiles, _setInputFiles] = useQueryParam(
    'inputFiles',
    withDefault(ObjectParam, encodeObjKeys(INITIAL_INPUT_FILES)),
  );
  const [activeInputFile, setActiveInputFile] = useQueryParam(
    'activeInputFile',
    withDefault(StringParam, 'App.js'),
  );
  const [transformedFiles, setTransformedFiles] = useState([]);
  const [cssOutput, setCssOutput] = useState('');
  const [sandpackInitialized, setSandpackInitialized] = useState(false);
  const iframeRef = useRef(null);
  const sandpackClientRef = useRef(null);
  const [error, setError] = useState(null);

  const addMenuRef = useRef(null);
  const tabMenuRef = useRef(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [tabMenuState, setTabMenuState] = useState({
    open: false,
    x: 0,
    y: 0,
    filename: null,
  });

  const setInputFiles = useCallback((updatedInputFiles, replace = true) => {
    _setInputFiles(
      encodeObjKeys(updatedInputFiles),
      replace ? 'replaceIn' : 'push',
    );
  }, []);

  const inputFiles = useMemo(() => decodeObjKeys(_inputFiles), [_inputFiles]);

  const { colorMode } = useColorMode();

  const closeTabMenu = useCallback(() => {
    setTabMenuState({ open: false, x: 0, y: 0, filename: null });
  }, []);

  const openTabMenu = useCallback((event, filename) => {
    event.preventDefault();
    event.stopPropagation();
    const x =
      event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
    const y =
      event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
    setTabMenuState({ open: true, x, y, filename });
    setShowAddMenu(false);
  }, []);

  const getUniqueFilename = useCallback(
    (baseName) => {
      if (!inputFiles[baseName]) {
        return baseName;
      }
      const parts = baseName.split('.');
      const ext = parts.length > 1 ? `.${parts.pop()}` : '';
      const base = parts.join('.') || 'file';
      let counter = 2;
      let candidate = `${base}-${counter}${ext}`;
      while (inputFiles[candidate]) {
        counter += 1;
        candidate = `${base}-${counter}${ext}`;
      }
      return candidate;
    },
    [inputFiles],
  );

  const toComponentName = useCallback((filename) => {
    return (
      filename
        .replace(/\.[^/.]+$/, '')
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
        .join('') || 'Component'
    );
  }, []);

  const createComponentTemplate = useCallback(
    (filename) => {
      const componentName = toComponentName(filename);
      return `import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
   
  },
});

export default function ${componentName}() {
  return <div {...stylex.props(styles.root)}>${componentName} component</div>;
}
`;
    },
    [toComponentName],
  );

  const createStylexVarsTemplate = useCallback(() => {
    return `import * as stylex from '@stylexjs/stylex';

export const vars = stylex.defineVars({
  
});
`;
  }, []);

  function updateSandpack(updatedInputFiles) {
    try {
      const { transformedFiles, generatedCSS } =
        transformSourceFiles(updatedInputFiles);

      setTransformedFiles(transformedFiles);
      setCssOutput(generatedCSS);
      setError(null);

      if (sandpackClientRef.current) {
        const dynamicFiles = Object.keys(transformedFiles).reduce(
          (acc, filename) => ({
            ...acc,
            [`/${filename}`]: { code: transformedFiles[filename] },
          }),
          {},
        );
        sandpackClientRef.current.updateSandbox({
          files: {
            ...INITIAL_BUNDLER_FILES,
            ...dynamicFiles,
            '/styles.css': {
              code: CSS_PRELUDE + generatedCSS,
            },
          },
        });
      }
      return true;
    } catch (error) {
      setError(error);
      return false;
    }
  }

  function handleEditorChange(value) {
    const updatedInputFiles = {
      ...inputFiles,
      [activeInputFile]: value || '',
    };

    if (updateSandpack(updatedInputFiles)) {
      setInputFiles(updatedInputFiles, true);
    } else {
      setInputFiles(updatedInputFiles, false);
    }
  }

  const handleCreateFile = (type) => {
    const defaultName =
      type === 'component'
        ? getUniqueFilename('Component.js')
        : getUniqueFilename('tokens.stylex.js');
    const name =
      window.prompt(
        `Enter a filename for the new ${type === 'component' ? 'component' : 'StyleX vars'} file`,
        defaultName,
      ) || '';
    const trimmedName = name.trim();
    if (!trimmedName) {
      setShowAddMenu(false);
      return;
    }
    if (inputFiles[trimmedName]) {
      window.alert('A file with that name already exists.');
      setShowAddMenu(false);
      return;
    }
    const template =
      type === 'component'
        ? createComponentTemplate(trimmedName)
        : createStylexVarsTemplate(trimmedName);
    const updatedInputFiles = {
      ...inputFiles,
      [trimmedName]: template,
    };
    setInputFiles(updatedInputFiles, false);
    setActiveInputFile(trimmedName);
    updateSandpack(updatedInputFiles);
    setShowAddMenu(false);
  };

  const handleRenameFile = (filename) => {
    const name = window.prompt('Rename file', filename) || '';
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === filename) {
      return;
    }
    if (inputFiles[trimmedName]) {
      window.alert('A file with that name already exists.');
      return;
    }
    const updatedInputFiles = Object.fromEntries(
      Object.entries(inputFiles).map(([key, value]) =>
        key === filename ? [trimmedName, value] : [key, value],
      ),
    );
    setInputFiles(updatedInputFiles, false);
    if (activeInputFile === filename) {
      setActiveInputFile(trimmedName);
    }
    updateSandpack(updatedInputFiles);
  };

  const handleDeleteFile = (filename) => {
    if (Object.keys(inputFiles).length <= 1) {
      window.alert('At least one file must remain.');
      return;
    }
    const confirmed = window.confirm(`Delete ${filename}?`);
    if (!confirmed) {
      return;
    }
    const updatedInputFiles = { ...inputFiles };
    delete updatedInputFiles[filename];
    setInputFiles(updatedInputFiles, false, false);
    if (activeInputFile === filename) {
      const nextActive = Object.keys(updatedInputFiles)[0];
      if (nextActive) {
        setActiveInputFile(nextActive);
      }
    }
    updateSandpack(updatedInputFiles);
  };

  useEffect(() => {
    if (inputFiles[activeInputFile]) {
      return;
    }
    const nextActive = Object.keys(inputFiles)[0];
    if (nextActive) {
      setActiveInputFile(nextActive);
    }
  }, [activeInputFile, inputFiles, setActiveInputFile]);

  useEffect(() => {
    if (!showAddMenu) {
      return;
    }
    const handler = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAddMenu]);

  useEffect(() => {
    if (!tabMenuState.open) {
      return;
    }
    const handleClose = (event) => {
      if (tabMenuRef.current && tabMenuRef.current.contains(event.target)) {
        return;
      }
      if (event.type === 'keydown' && event.key !== 'Escape') {
        return;
      }
      closeTabMenu();
    };
    document.addEventListener('mousedown', handleClose);
    document.addEventListener('keydown', handleClose);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('keydown', handleClose);
    };
  }, [closeTabMenu, tabMenuState.open]);

  useEffect(() => {
    let mounted = true;

    const { transformedFiles, generatedCSS } = transformSourceFiles(inputFiles);
    setTransformedFiles(transformedFiles);
    setCssOutput(generatedCSS);
    loadSandpackClient(
      iframeRef.current,
      {
        files: {
          ...INITIAL_BUNDLER_FILES,
          ...Object.keys(transformedFiles).reduce(
            (acc, filename) => ({
              ...acc,
              [`/${filename}`]: { code: transformedFiles[filename] },
            }),
            {},
          ),
          '/styles.css': {
            code: CSS_PRELUDE + generatedCSS,
          },
        },
        template: 'react',
      },
      {
        showOpenInCodeSandbox: false,
      },
    ).then((sandpackClient) => {
      if (!mounted) {
        sandpackClient.destroy();
        return;
      }
      sandpackClientRef.current = sandpackClient;
      setSandpackInitialized(true);
    });

    return () => {
      mounted = false;
      if (sandpackClientRef.current) {
        sandpackClientRef.current.destroy();
      }
    };
  }, []);

  const handleFormat = useCallback(async () => {
    const formatted = await prettier.format(inputFiles[activeInputFile], {
      parser: 'babel',
      plugins: [estreePlugin, babelPlugin],
    });
    setInputFiles({ ...inputFiles, [activeInputFile]: formatted }, false);
  }, [inputFiles, activeInputFile]);

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.column, styles.resizeH)}>
        <Panel header="Source JS">
          <Tabs
            addMenuRef={addMenuRef}
            handleFormat={handleFormat}
            onAddComponentFile={() => handleCreateFile('component')}
            onAddStylexFile={() => handleCreateFile('stylex')}
            onToggleAddMenu={() => setShowAddMenu((v) => !v)}
            showAddMenu={showAddMenu}
          >
            {Object.keys(inputFiles).map((filename) => (
              <Tab
                isActive={activeInputFile === filename}
                key={filename}
                label={filename}
                onClick={() => setActiveInputFile(filename)}
                onContextMenu={(event) => openTabMenu(event, filename)}
              />
            ))}
          </Tabs>
          {tabMenuState.open ? (
            <div
              ref={tabMenuRef}
              {...stylex.props(styles.tabMenu)}
              style={{ top: tabMenuState.y, left: tabMenuState.x }}
            >
              <button
                {...stylex.props(styles.tabMenuItem)}
                onClick={() => {
                  handleRenameFile(tabMenuState.filename);
                  closeTabMenu();
                }}
                type="button"
              >
                Rename
              </button>
              <button
                {...stylex.props(
                  styles.tabMenuItem,
                  Object.keys(inputFiles).length <= 1 &&
                    styles.tabMenuItemDisabled,
                )}
                disabled={Object.keys(inputFiles).length <= 1}
                onClick={() => {
                  handleDeleteFile(tabMenuState.filename);
                  closeTabMenu();
                }}
                type="button"
              >
                Delete
              </button>
            </div>
          ) : null}
          <Editor
            defaultLanguage="javascript"
            key={activeInputFile}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editor.getDomNode()?.addEventListener('keydown', (e) => {
                if (e.key === '/') {
                  // prevent docusaurus's search from opening
                  e.stopPropagation();
                }
              });
            }}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: true,
              contextmenu: false,
              readOnly: !sandpackInitialized,
            }}
            theme={colorMode === 'dark' ? 'vs-dark' : 'light'}
            value={inputFiles[activeInputFile]}
          />
          {error != null && (
            <div {...stylex.props(styles.error)}>{error.message}</div>
          )}
        </Panel>
      </div>
      <div {...stylex.props(styles.column)}>
        <Panel header="Transformed JS" style={styles.resizeV}>
          <Editor
            defaultLanguage="javascript"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: true,
              contextmenu: false,
              readOnly: true,
            }}
            theme={colorMode === 'dark' ? 'vs-dark' : 'light'}
            value={transformedFiles[activeInputFile] || ''}
          />
        </Panel>
        <Panel header="CSS" style={styles.resizeV}>
          <Editor
            defaultLanguage="css"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: true,
              contextmenu: false,
              readOnly: true,
            }}
            theme={colorMode === 'dark' ? 'vs-dark' : 'light'}
            value={cssOutput}
          />
        </Panel>
        <Panel header="Preview">
          <iframe
            ref={iframeRef}
            title="StyleX Playground Preview"
            {...stylex.props(styles.iframe)}
          />
        </Panel>
      </div>
    </div>
  );
}

function Tab({ label, isActive, onClick, onContextMenu }) {
  const longPressRef = React.useRef(null);

  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') {
      return;
    }
    clearLongPress();
    const nativeEvent = event.nativeEvent;
    const x = nativeEvent.clientX;
    const y = nativeEvent.clientY;
    longPressRef.current = setTimeout(() => {
      onContextMenu({
        preventDefault: () => {},
        stopPropagation: () => {},
        clientX: x,
        clientY: y,
      });
    }, 550);
  };

  const handlePointerUp = () => {
    clearLongPress();
  };

  return (
    <div
      aria-selected={isActive}
      onContextMenu={onContextMenu}
      onPointerDown={handlePointerDown}
      onPointerLeave={clearLongPress}
      onPointerUp={handlePointerUp}
      role="tab"
      {...stylex.props(styles.tab, isActive && styles.tabActive)}
    >
      <button
        {...stylex.props(styles.tabLabelButton)}
        onClick={onClick}
        title={label}
        type="button"
      >
        {label}
      </button>
    </div>
  );
}

function Tabs({
  children,
  onToggleAddMenu,
  onAddComponentFile,
  onAddStylexFile,
  showAddMenu,
  addMenuRef,
  handleFormat,
}) {
  return (
    <div role="tablist" {...stylex.props(styles.tabs)}>
      {children}
      <div ref={addMenuRef} {...stylex.props(styles.addWrapper)}>
        <button
          {...stylex.props(styles.tabIconButton)}
          onClick={onToggleAddMenu}
          title="Add file"
          type="button"
        >
          +
        </button>
        {showAddMenu ? (
          <div {...stylex.props(styles.addMenu)}>
            <button
              {...stylex.props(styles.addMenuItem)}
              onClick={() => onAddComponentFile()}
              type="button"
            >
              Component file
            </button>
            <button
              {...stylex.props(styles.addMenuItem)}
              onClick={() => onAddStylexFile()}
              type="button"
            >
              StyleX vars file
            </button>
          </div>
        ) : null}
      </div>
      <div {...stylex.props(styles.spacer)} />
      <button
        {...stylex.props(styles.tabIconButton)}
        onClick={handleFormat}
        title="Format"
        type="button"
      >
        ✨
      </button>
    </div>
  );
}

function Panel({ header, children, style }) {
  return (
    <div {...stylex.props(styles.panel, style)}>
      <div {...stylex.props(styles.panelHeader)}>
        <span>{header}</span>
      </div>
      {children}
    </div>
  );
}
