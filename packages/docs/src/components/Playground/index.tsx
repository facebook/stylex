/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import * as stylex from '@stylexjs/stylex';
// @ts-ignore - CJS module
import { transform } from '@babel/standalone';
import { loadSandpackClient } from '@codesandbox/sandpack-client';
import Editor, { useMonaco } from '@monaco-editor/react';
// @ts-ignore - CJS module
import path from 'path-browserify';
// import { useColorMode } from '@docusaurus/theme-common';
import {
  useQueryParam,
  JsonParam,
  withDefault,
  StringParam,
  // @ts-ignore
} from 'use-query-params';
import { Tabs } from './Tabs';
import prettier from 'prettier';
import * as babelPlugin from 'prettier/plugins/babel.js';
import * as estreePlugin from 'prettier/plugins/estree.js';
import {
  INITIAL_INPUT_FILES,
  INITIAL_BUNDLER_FILES,
  CSS_PRELUDE,
} from './demoConstants';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

// @ts-ignore - CJS module
import * as stylexPluginModule from '@stylexjs/babel-plugin';
import { vars } from '@/theming/vars.stylex';
import { ChevronDown } from 'lucide-react';
const stylexPlugin: typeof import('@stylexjs/babel-plugin').default =
  // @ts-ignore - handle CJS default export
  stylexPluginModule.default ?? stylexPluginModule;

declare const STYLEX_TYPES: Record<string, string>;
declare const REACT_TYPES: string;
declare const REACT_JSX_RUNTIME_TYPES: string;

function transformSourceFiles(sourceFiles: Record<string, string>) {
  const stylexRules = [];
  const transformedFiles: Record<string, string> = {};

  const sourceFilePaths = Object.keys(sourceFiles).map(
    (filename) => `/${filename}`,
  );

  for (const [filename, code] of Object.entries(sourceFiles)) {
    const isTSX = filename.endsWith('.tsx');
    const isTS = isTSX || filename.endsWith('.ts');
    const result = transform(code, {
      filename,
      plugins: [
        isTS && ['transform-typescript', { isTSX }],
        'syntax-jsx',
        [
          stylexPlugin,
          {
            dev: false,
            unstable_moduleResolution: {
              type: 'custom',
              filePathResolver(importPath: string, sourceFilePath: string) {
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
              getCanonicalFilePath(filePath: string) {
                return filePath;
              },
            },
          },
        ],
      ].filter(Boolean),
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

const decodeObjKeysOld = (obj: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, decodeURIComponent(value)]),
  );
};

const encodeObjKeys = (obj: Record<string, string>) => {
  return compressToEncodedURIComponent(JSON.stringify(obj));
};

const decodeObjKeys = (string: string) => {
  return JSON.parse(decompressFromEncodedURIComponent(string));
};

export default function PlaygroundNew() {
  const [_inputFilesOld, _setInputFilesOld] = useQueryParam(
    'inputFiles',
    JsonParam,
  );

  let initialValue: Record<string, string> = INITIAL_INPUT_FILES;
  if (_inputFilesOld != null && Object.keys(_inputFilesOld).length > 0) {
    initialValue = decodeObjKeysOld(_inputFilesOld);
  }

  const [_inputFiles, _setInputFiles] = useQueryParam(
    'input',
    withDefault(StringParam, encodeObjKeys(initialValue)),
  );
  const inputFiles: Record<string, string> = useMemo(
    () => decodeObjKeys(_inputFiles),
    [_inputFiles],
  );

  const [activeInputFile, setActiveInputFile] = useState<string>((): string => {
    const keys: string[] = Object.keys(inputFiles);
    return keys.includes('App.tsx') ? 'App.tsx' : keys[0]!;
  });
  const [transformedFiles, setTransformedFiles] = useState<
    Record<string, string>
  >({});
  const [cssOutput, setCssOutput] = useState('');
  const [sandpackInitialized, setSandpackInitialized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sandpackClientRef = useRef<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const monaco = useMonaco();

  const setInputFiles = useCallback(
    (updatedInputFiles: Record<string, string>, replace: boolean = true) => {
      _setInputFiles(
        encodeObjKeys(updatedInputFiles),
        replace ? 'replaceIn' : 'push',
      );
    },
    [],
  );

  useEffect(() => {
    if (_inputFilesOld == null || Object.keys(_inputFilesOld).length === 0) {
      return;
    }
    _setInputFilesOld(null);
    setInputFiles(initialValue);
  }, []);

  // const { colorMode } = useColorMode();
  const colorMode = 'dark';

  const getUniqueFilename = useCallback(
    (baseName: string) => {
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

  const toComponentName = useCallback((filename: string) => {
    return (
      filename
        .replace(/\.[^/.]+$/, '')
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((chunk: string) => chunk?.[0]?.toUpperCase() + chunk?.slice(1))
        .join('') || 'Component'
    );
  }, []);

  const createComponentTemplate = useCallback(
    (filename: string) => {
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
    (fileKind: string) =>
      fileKind === 'component'
        ? getUniqueFilename('Component.tsx')
        : getUniqueFilename('tokens.stylex.ts'),
    [getUniqueFilename],
  );

  const ensureMonacoModel = useCallback(
    (monacoInstance: any, filename: string, content: string) => {
      const uri = monacoInstance.Uri.file(`/${filename}`);
      const existingModel = monacoInstance.editor.getModel(uri);
      if (existingModel) {
        if (existingModel.getValue() !== content) {
          existingModel.setValue(content);
        }
        return existingModel;
      }
      return monacoInstance.editor.createModel(content, 'typescript', uri);
    },
    [],
  );

  function updateSandpack(updatedInputFiles: Record<string, string>) {
    try {
      const { transformedFiles, generatedCSS } =
        transformSourceFiles(updatedInputFiles);

      setTransformedFiles(transformedFiles as Record<string, string>);
      setCssOutput(generatedCSS);
      setError(null);

      if (sandpackClientRef.current) {
        const dynamicFiles = Object.keys(transformedFiles).reduce(
          (acc, filename) => ({
            ...acc,
            [`/${filename.replace(/\.tsx?$/, '.js')}`]: {
              code: transformedFiles[filename],
            },
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error(String(error)));
      }
      return false;
    }
  }

  function handleEditorChange(value: string | undefined) {
    const updatedInputFiles = {
      ...inputFiles,
      [activeInputFile as string]: value || '',
    };

    const success = updateSandpack(updatedInputFiles);
    setInputFiles(updatedInputFiles, success);
  }

  const createFile = (fileKind: 'component' | 'stylex', name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || inputFiles[trimmedName]) {
      return;
    }
    const template =
      fileKind === 'component'
        ? createComponentTemplate(trimmedName)
        : createStylexVarsTemplate();
    const updatedInputFiles = {
      ...inputFiles,
      [trimmedName]: template,
    };

    const success = updateSandpack(updatedInputFiles);
    setInputFiles(updatedInputFiles, success);

    ensureMonacoModel(monaco, trimmedName, template);
  };

  const renameFile = (oldName: string, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === oldName || inputFiles[trimmedName]) {
      return false;
    }
    const updatedInputFiles = Object.fromEntries(
      Object.entries(inputFiles as Record<string, string>).map(
        ([key, value]) =>
          key === oldName ? [trimmedName, value] : [key, value],
      ),
    );
    const success = updateSandpack(updatedInputFiles);
    setInputFiles(updatedInputFiles, success);

    ensureMonacoModel(
      monaco,
      trimmedName,
      updatedInputFiles[trimmedName] ?? '',
    );

    if (activeInputFile === oldName) {
      setActiveInputFile(trimmedName);
    }

    const oldModel = monaco.editor.getModel(monaco.Uri.file(`/${oldName}`));
    if (oldModel) {
      oldModel.dispose();
    }

    return true;
  };

  const deleteFile = (filename: string) => {
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

    const oldModel = monaco.editor.getModel(monaco.Uri.file(`/${filename}`));
    if (oldModel) {
      oldModel.dispose();
    }

    return true;
  };

  useEffect(() => {
    let mounted = true;

    const { transformedFiles, generatedCSS } = transformSourceFiles(inputFiles);
    setTransformedFiles(transformedFiles);
    setCssOutput(generatedCSS);
    loadSandpackClient(
      iframeRef.current!,
      {
        files: {
          ...INITIAL_BUNDLER_FILES,
          ...Object.keys(transformedFiles).reduce(
            (acc, filename) => ({
              ...acc,
              [`/${filename.replace(/\.tsx?$/, '.js')}`]: {
                code: transformedFiles[filename],
              },
            }),
            {},
          ),
          '/styles.css': {
            code: CSS_PRELUDE + generatedCSS,
          },
        },
        template: 'react' as any,
      },
      {
        showOpenInCodeSandbox: false,
      },
    ).then((sandpackClient: any) => {
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
    const formatted = await prettier.format(inputFiles[activeInputFile]!, {
      parser: 'babel',
      plugins: [estreePlugin as any, babelPlugin],
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
                activeFile={activeInputFile as string}
                files={Object.keys(inputFiles)}
                getDefaultFilename={getDefaultFilename}
                onCreateFile={createFile}
                onDeleteFile={deleteFile}
                onFormat={handleFormat}
                onRenameFile={renameFile}
                onSelectFile={(filename) => setActiveInputFile(filename)}
              />
              <Editor
                beforeMount={(monaco: any) => {
                  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
                    true,
                  );

                  for (const [filename, content] of Object.entries(
                    inputFiles,
                  )) {
                    ensureMonacoModel(monaco, filename, content);
                  }

                  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                    {
                      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
                      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                      moduleResolution:
                        monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                      paths: {
                        '@stylexjs/stylex': [
                          'file:///node_modules/@stylexjs/stylex/stylex.d.ts',
                        ],
                      },
                    },
                  );

                  for (const [file, content] of Object.entries(STYLEX_TYPES)) {
                    monaco.languages.typescript.typescriptDefaults.addExtraLib(
                      content,
                      file,
                    );
                  }
                  monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    REACT_TYPES,
                    'file:///node_modules/@types/react/index.d.ts',
                  );
                  monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    REACT_JSX_RUNTIME_TYPES,
                    'file:///node_modules/@types/react/jsx-runtime.d.ts',
                  );
                }}
                defaultLanguage="typescript"
                onChange={handleEditorChange}
                onMount={(editor: any) => {
                  editor.onKeyDown((e: any) => {
                    if (e.browserEvent.key === '/') {
                      e.browserEvent.stopPropagation();
                    }
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: true,
                  contextmenu: false,
                  readOnly: !sandpackInitialized,
                }}
                path={`/${activeInputFile}`}
                theme={colorMode === 'dark' ? 'vs-dark' : 'light'}
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

function Panel({
  header,
  children,
  style,
}: {
  header: string;
  children: React.ReactNode;
  style?: stylex.StyleXStyles;
}) {
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

function CollapsiblePanel({
  header,
  children,
  style,
  alwaysOpen = false,
}: {
  header: string;
  children: React.ReactNode;
  style?: stylex.StyleXStyles;
  alwaysOpen?: boolean;
}) {
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
          alwaysOpen && styles.panelHeaderButtonAlwaysOpen,
        )}
        onClick={() => setOpen((open) => !open)}
      >
        {header}
        <ChevronDown
          {...stylex.props(
            styles.panelChevron,
            open && styles.panelChevronOpen,
          )}
        />
      </button>
      <div
        {...stylex.props(
          styles.panelContent,
          !open && styles.hidden,
          alwaysOpen && !open && styles.panelContentAlwaysOpen,
        )}
      >
        <div {...stylex.props(styles.panelContentInner)}>{children}</div>
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
    flexBasis: 38,
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
    backgroundColor: vars['--color-fd-card'],
    paddingBlock: 8,
    paddingInline: 16,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--fg1)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: vars['--color-fd-border'],
  },
  panelHeaderButtonAlwaysOpen: {
    display: {
      default: 'none',
      '@container (width < 768px)': 'block',
    },
  },
  panelChevron: {
    position: 'absolute',
    insetInlineEnd: 4,
    top: 0,
    height: '100%',
    aspectRatio: 1,
    paddingBottom: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: 'center',
    rotate: '-90deg',
    transitionProperty: 'rotate',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease-in-out',
  },
  panelChevronOpen: {
    rotate: '0deg',
  },
  // panelHeaderButton: {
  //   '::after': {
  //     content: '›',
  //     boxSizing: 'border-box',
  //     position: 'absolute',
  //     insetInlineEnd: 0,
  //     top: 0,
  //     height: '100%',
  //     aspectRatio: 1,
  //     paddingBottom: 4,
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     fontSize: '1.5em',
  //     transitionProperty: 'transform',
  //     transitionDuration: '200ms',
  //     transitionTimingFunction: 'ease-in-out',
  //   },
  // },
  // panelHeaderButtonOpen: {
  //   '::after': {
  //     transform: 'rotate(90deg)',
  //   },
  // },
  panelContent: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: '1fr',
  },
  panelContentInner: {
    height: '100%',
    overflow: 'hidden',
  },
  panelContentAlwaysOpen: {
    display: {
      default: 'block',
      '@container (width < 768px)': 'none',
    },
  },
  hidden: {
    gridTemplateRows: '0fr',
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
