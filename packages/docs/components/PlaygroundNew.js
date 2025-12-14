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
import { Tabs } from './playground-components/Tabs';
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

  const setInputFiles = useCallback((updatedInputFiles, replace = true) => {
    _setInputFiles(
      encodeObjKeys(updatedInputFiles),
      replace ? 'replaceIn' : 'push',
    );
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

    if (updateSandpack(updatedInputFiles)) {
      setInputFiles(updatedInputFiles, true);
    } else {
      setInputFiles(updatedInputFiles, false);
    }
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
    setInputFiles(updatedInputFiles, false);
    setActiveInputFile(trimmedName);
    updateSandpack(updatedInputFiles);
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
    setInputFiles(updatedInputFiles, false);
    if (activeInputFile === oldName) {
      setActiveInputFile(trimmedName);
    }
    updateSandpack(updatedInputFiles);
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
    if (inputFiles[activeInputFile]) {
      return;
    }
    const nextActive = Object.keys(inputFiles)[0];
    if (nextActive) {
      setActiveInputFile(nextActive);
    }
  }, [activeInputFile, inputFiles, setActiveInputFile]);

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
    if (updateSandpack(updatedInputFiles)) {
      setInputFiles(updatedInputFiles, true);
    } else {
      setInputFiles(updatedInputFiles, false);
    }
  }, [inputFiles, activeInputFile, setInputFiles]);

  return (
    <>
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.column, styles.resizeH)}>
          <Panel header="Source JS">
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
    </>
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
