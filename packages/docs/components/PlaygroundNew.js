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
  JsonParam,
  withDefault,
  StringParam,
} from 'use-query-params';
import { Tabs } from './playground-components/Tabs';
import prettier from 'prettier';
import * as babelPlugin from 'prettier/plugins/babel.js';
import * as estreePlugin from 'prettier/plugins/estree.js';
import {
  INITIAL_INPUT_FILES,
  INITIAL_BUNDLER_FILES,
  CSS_PRELUDE,
} from './playground-components/demoConstants';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

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

const decodeObjKeysOld = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, decodeURIComponent(value)]),
  );
};

const encodeObjKeys = (obj) => {
  return compressToEncodedURIComponent(JSON.stringify(obj));
};

const decodeObjKeys = (string) => {
  return JSON.parse(decompressFromEncodedURIComponent(string));
};

export default function PlaygroundNew() {
  const [_inputFilesOld, _setInputFilesOld] = useQueryParam(
    'inputFiles',
    JsonParam,
  );

  let initialValue = INITIAL_INPUT_FILES;
  if (_inputFilesOld != null && Object.keys(_inputFilesOld).length > 0) {
    initialValue = decodeObjKeysOld(_inputFilesOld);
  }

  const [_inputFiles, _setInputFiles] = useQueryParam(
    'input',
    withDefault(StringParam, encodeObjKeys(initialValue)),
  );
  const [activeInputFile, setActiveInputFile] = useState('App.js');
  const [transformedFiles, setTransformedFiles] = useState([]);
  const [cssOutput, setCssOutput] = useState('');
  const [sandpackInitialized, setSandpackInitialized] = useState(false);
  const iframeRef = useRef(null);
  const sandpackClientRef = useRef(null);
  const [error, setError] = useState(null);

  const setInputFiles = useCallback((updatedInputFiles, replace = true) => {
    _setInputFiles(
      encodeObjKeys(updatedInputFiles),
      replace ? 'replaceIn' : 'push',
    );
  }, []);

  useEffect(() => {
    if (_inputFilesOld == null || Object.keys(_inputFilesOld).length === 0) {
      return;
    }
    _setInputFilesOld(null);
    setInputFiles(initialValue);
  }, []);

  const inputFiles = useMemo(() => decodeObjKeys(_inputFiles), [_inputFiles]);

  const { colorMode } = useColorMode();

  const getUniqueFilename = useCallback(
    (baseName) => {
      if (!inputFiles[baseName]) {
        return baseName;
      }
      const [base, ...rest] = baseName.split('.');
      let counter = 2;
      let candidate = [`${base}-${counter}`, ...rest].join('.');
      while (inputFiles[candidate]) {
        counter += 1;
        candidate = [`${base}-${counter}`, ...rest].join('.');
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
  primary: '#ff6b6b',
  secondary: '#1e90ff',
  accent: '#fbbf24',
});
`;
  }, []);

  const getDefaultFilename = useCallback(
    (fileKind) =>
      fileKind === 'component'
        ? getUniqueFilename('Component.js')
        : getUniqueFilename('tokens.stylex.js'),
    [getUniqueFilename],
  );

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

    const success = updateSandpack(updatedInputFiles);
    setInputFiles(updatedInputFiles, success);
  }

  const createFile = (fileKind, name) => {
    const trimmedName = name.trim();
    if (!trimmedName || inputFiles[trimmedName]) {
      return false;
    }
    const template =
      fileKind === 'component'
        ? createComponentTemplate(trimmedName)
        : createStylexVarsTemplate(trimmedName);
    const updatedInputFiles = {
      ...inputFiles,
      [trimmedName]: template,
    };

    const success = updateSandpack(updatedInputFiles);
    setInputFiles(updatedInputFiles, success);

    return true;
  };

  const renameFile = (oldName, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === oldName || inputFiles[trimmedName]) {
      return false;
    }
    const updatedInputFiles = Object.fromEntries(
      Object.entries(inputFiles).map(([key, value]) =>
        key === oldName ? [trimmedName, value] : [key, value],
      ),
    );
    const success = updateSandpack(updatedInputFiles);
    setInputFiles(updatedInputFiles, success);

    return true;
  };

  const deleteFile = (filename) => {
    if (Object.keys(inputFiles).length <= 1) {
      return false;
    }
    const updatedInputFiles = { ...inputFiles };
    delete updatedInputFiles[filename];
    setInputFiles(updatedInputFiles, false);
    if (activeInputFile === filename) {
      const nextActive = Object.keys(updatedInputFiles)[0];
      if (nextActive) {
        setActiveInputFile(nextActive);
      }
    }
    updateSandpack(updatedInputFiles);
    return true;
  };

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
    const updatedInputFiles = {
      ...inputFiles,
      [activeInputFile]: formatted,
    };
    setInputFiles(updatedInputFiles, updateSandpack(updatedInputFiles));
  }, [inputFiles, activeInputFile, setInputFiles]);

  return (
    <>
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.row)}>
          <div {...stylex.props(styles.column)}>
            <Panel header="Source">
              <Tabs
                activeFile={activeInputFile}
                disableDelete={Object.keys(inputFiles).length <= 1}
                files={Object.keys(inputFiles)}
                getDefaultFilename={getDefaultFilename}
                onCreateFile={createFile}
                onDeleteFile={deleteFile}
                onFormat={handleFormat}
                onRenameFile={renameFile}
                onSelectFile={(filename) => setActiveInputFile(filename)}
              />
              <Editor
                defaultLanguage="javascript"
                key={activeInputFile}
                onChange={handleEditorChange}
                onMount={(editor) => {
                  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
                    {
                      ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
                      paths: {
                        '@stylexjs/stylex': [
                          'file:///node_modules/@stylexjs/stylex/stylex.d.ts',
                        ],
                      },
                    },
                  );

                  for (const [file, content] of Object.entries(STYLEX_TYPES)) {
                    monaco.languages.typescript.javascriptDefaults.addExtraLib(
                      content,
                      file,
                    );
                  }

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
            <CollapsiblePanel header="Generated JS">
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
            </CollapsiblePanel>
            <CollapsiblePanel header="Generated CSS">
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
            </CollapsiblePanel>
          </div>
          <div {...stylex.props(styles.column)}>
            <CollapsiblePanel alwaysOpen={true} header="Preview">
              <iframe
                ref={iframeRef}
                title="StyleX Playground Preview"
                {...stylex.props(styles.iframe)}
              />
            </CollapsiblePanel>
          </div>
        </div>
      </div>
    </>
  );
}

function Panel({ header, children, style }) {
  return (
    <div {...stylex.props(styles.panel, style)}>
      {header && (
        <div {...stylex.props(styles.panelHeader)}>
          <span>{header}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function CollapsiblePanel({ header, children, style, alwaysOpen = false }) {
  const [open, setOpen] = useState(alwaysOpen);

  return (
    <div
      {...stylex.props(
        styles.panel,
        !open && styles.panelClosed,
        alwaysOpen && !open && styles.panelClosedAlwaysOpen,
        style,
      )}
    >
      <button
        {...stylex.props(
          styles.panelHeader,
          styles.panelHeaderButton,
          open && styles.panelHeaderButtonOpen,
          alwaysOpen && styles.panelHeaderButtonAlwaysOpen,
        )}
        onClick={() => setOpen((open) => !open)}
      >
        {header}
      </button>
      <div
        {...stylex.props(
          styles.panelContent,
          !open && styles.hidden,
          alwaysOpen && !open && styles.panelContentAlwaysOpen,
        )}
      >
        {children}
      </div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    width: '100%',
    height: 'calc(100dvh - 60px)',
    padding: 8,
    containerType: 'inline-size',
  },
  row: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: { default: 'row', '@container (width < 768px)': 'column' },
    gap: 8,
  },
  column: {
    flexGrow: 1,
    flexShrink: 1,
    width: '50%',
    display: { default: 'flex', '@container (width < 768px)': 'contents' },
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
  },
  panel: {
    position: 'relative',
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 32,
    backgroundColor: 'var(--bg1)',
    borderRadius: 8,
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  panelClosed: {
    flexGrow: 0,
  },
  panelClosedAlwaysOpen: {
    flexGrow: {
      default: 1,
      '@container (width < 768px)': 0,
    },
  },
  panelHeader: {
    position: 'relative',
    appearance: 'none',
    borderStyle: 'none',
    textAlign: 'start',
    display: 'block',
    width: '100%',
    backgroundColor: 'var(--bg2)',
    paddingBlock: 8,
    paddingInline: 16,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--fg1)',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--fg3)',
  },
  panelHeaderButtonAlwaysOpen: {
    display: {
      default: 'none',
      '@container (width < 768px)': 'block',
    },
  },
  panelHeaderButton: {
    '::after': {
      content: '›',
      boxSizing: 'border-box',
      position: 'absolute',
      insetInlineEnd: 0,
      top: 0,
      height: '100%',
      aspectRatio: 1,
      paddingBottom: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5em',
      transitionProperty: 'transform',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-in-out',
    },
  },
  panelHeaderButtonOpen: {
    '::after': {
      transform: 'rotate(90deg)',
    },
  },
  panelContent: {
    height: '100%',
  },
  panelContentAlwaysOpen: {
    display: {
      default: 'block',
      '@container (width < 768px)': 'none',
    },
  },
  hidden: {
    display: 'none',
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
