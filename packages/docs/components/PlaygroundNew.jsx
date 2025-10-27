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
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import { loadSandpackClient } from '@codesandbox/sandpack-client';
import Editor from '@monaco-editor/react';

const INITIAL_INPUT_FILES = {
  'App.js': `import * as stylex from '@stylexjs/stylex';
import { colors } from './tokens.stylex';

const styles = stylex.create({
  container: {
    padding: '16px',
    backgroundColor: colors.primary,
  },
});

function App() {
  return <div {...stylex.props(styles.container)}>Hello World!</div>;
}

export default App;`,
  'tokens.stylex.js': `import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineConsts({
  primary: 'lightblue',
  secondary: 'coral',
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

function transformSourceFiles(sourceFiles) {
  const stylexRules = [];
  const transformedFiles = {};

  for (const [filename, code] of Object.entries(sourceFiles)) {
    const result = transform(code, {
      filename,
      plugins: [
        jsxSyntaxPlugin,
        [
          stylexPlugin,
          {
            dev: false,
            unstable_moduleResolution: {
              type: 'custom',
              filePathResolver(importPath, sourceFilePath) {
                if (
                  sourceFilePath === '/App.js' &&
                  importPath === './tokens.stylex'
                ) {
                  return '/tokens.stylex.js';
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

  const generatedCSS = stylexPlugin.processStylexRules(stylexRules);

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
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
  },
  panel: {
    flex: '1',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  panelHeader: {
    backgroundColor: '#f5f5f5',
    padding: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#333',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: '#e0e0e0',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    paddingLeft: '2px',
    paddingTop: '4px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '10px',
    paddingRight: '10px',
    fontSize: '12px',
    color: '#666666',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    borderStyle: 'none',
  },
  tabActive: {
    color: '#33333',
    borderBottomColor: '#33333',
  },
  iframe: {
    flex: '1',
    width: '100%',
    height: '100%',
    borderWidth: '0',
    outline: 'none',
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

  function handleEditorChange(value) {
    const updatedInputFiles = {
      ...inputFiles,
      [activeInputFile]: value || '',
    };

    setInputFiles(updatedInputFiles);
    
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
              code: generatedCSS,
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
            code: generatedCSS,
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
      <div {...stylex.props(styles.column)}>
        <Panel header="Source JS">
          <Tabs>
            {Object.keys(inputFiles).map((filename) => (
              <Tab
                icon="📄"
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
              scrollBeyondLastLine: false,
              contextmenu: false,
              readOnly: !sandpackInitialized,
            }}
            value={inputFiles[activeInputFile]}
          />
        </Panel>
      </div>
      <div {...stylex.props(styles.column)}>
        <Panel header="Transformed JS">
          <Editor
            defaultLanguage="javascript"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              contextmenu: false,
              readOnly: true,
            }}
            value={transformedFiles[activeInputFile] || ''}
          />
        </Panel>
        <Panel header="CSS">
          <Editor
            defaultLanguage="css"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              contextmenu: false,
              readOnly: true,
            }}
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

function Tab({ icon, label, isActive, onClick }) {
  return (
    <button
      aria-selected={isActive}
      onClick={onClick}
      role="tab"
      {...stylex.props(styles.tab, isActive && styles.tabActive)}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
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

function Panel({ header, children }) {
  return (
    <div {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.panelHeader)}>
        <span>{header}</span>
      </div>
      {children}
    </div>
  );
}
