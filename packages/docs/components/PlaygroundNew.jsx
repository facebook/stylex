/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import stylexPlugin from '@stylexjs/babel-plugin';
import * as stylex from '@stylexjs/stylex';
import { transform } from '@babel/standalone';
import { loadSandpackClient } from '@codesandbox/sandpack-client';
import Editor from '@monaco-editor/react';
import path from 'path-browserify';
import { useColorMode } from '@docusaurus/theme-common';

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
  iframe: {
    flex: '1',
    width: '100%',
    height: '100%',
    borderWidth: '0',
    outline: 'none',
    backgroundColor: 'var(--bg1)',
    color: 'var(--fg1)',
  },
});

export default function PlaygroundNew() {
  const [inputFiles, setInputFiles] = useState(INITIAL_INPUT_FILES);
  const [activeInputFile, setActiveInputFile] = useState('App.js');
  const [transformedFiles, setTransformedFiles] = useState([]);
  const [cssOutput, setCssOutput] = useState('');
  const [sandpackInitialized, setSandpackInitialized] = useState(false);
  const iframeRef = useRef(null);
  const sandpackClientRef = useRef(null);

  const { colorMode } = useColorMode();

  function updateSandpack(updatedInputFiles) {
    try {
      const { transformedFiles, generatedCSS } =
        transformSourceFiles(updatedInputFiles);

      setTransformedFiles(transformedFiles);
      setCssOutput(generatedCSS);

      if (sandpackClientRef.current) {
        sandpackClientRef.current.updateSandbox({
          files: {
            ...INITIAL_BUNDLER_FILES,
            '/App.js': {
              code: transformedFiles['App.js'],
            },
            '/tokens.stylex.js': {
              code: transformedFiles['tokens.stylex.js'],
            },
            '/styles.css': {
              code: CSS_PRELUDE + generatedCSS,
            },
          },
        });
      }
    } catch (error) {
      setTransformedFiles({
        [Object.keys(updatedInputFiles)[0]]: error.stack || '',
      });
      setCssOutput('');
    }
  }

  function handleEditorChange(value) {
    const updatedInputFiles = {
      ...inputFiles,
      [activeInputFile]: value || '',
    };

    setInputFiles(updatedInputFiles);
    updateSandpack(updatedInputFiles);
  }

  useEffect(() => {
    let mounted = true;

    const { transformedFiles, generatedCSS } =
      transformSourceFiles(INITIAL_INPUT_FILES);
    setTransformedFiles(transformedFiles);
    setCssOutput(generatedCSS);
    loadSandpackClient(
      iframeRef.current,
      {
        files: {
          ...INITIAL_BUNDLER_FILES,
          '/App.js': {
            code: transformedFiles['App.js'],
          },
          '/tokens.stylex.js': {
            code: transformedFiles['tokens.stylex.js'],
          },
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

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.column, styles.resizeH)}>
        <Panel header="Source JS">
          <Tabs>
            {Object.keys(inputFiles).map((filename) => (
              <Tab
                isActive={activeInputFile === filename}
                key={filename}
                label={filename}
                onClick={() => setActiveInputFile(filename)}
              />
            ))}
          </Tabs>
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

function Tab({ label, isActive, onClick }) {
  return (
    <button
      aria-selected={isActive}
      onClick={onClick}
      role="tab"
      {...stylex.props(styles.tab, isActive && styles.tabActive)}
    >
      {label}
    </button>
  );
}

function Tabs({ children }) {
  return (
    <div role="tablist" {...stylex.props(styles.tabs)}>
      {children}
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
