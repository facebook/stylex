/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

// Import necessary components and libraries
import BrowserOnly from '@docusaurus/BrowserOnly';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as stylex from '@stylexjs/stylex';
import { WebContainer, reloadPreview } from '@webcontainer/api';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';
import { files } from './playground-utils/files';
import useDebounced from './hooks/useDebounced';
import LoadingSpinner from './LoadingSpinner';

// Add FontAwesome icons to the library
library.add(faBars, faRotateRight);

/**
 * Function to spawn a command in the WebContainer instance.
 * @param {WebContainer} instance - The WebContainer instance.
 * @param {...string} args - Command arguments to be executed.
 * @returns {Promise} - Promise that resolves when the command execution is successful.
 */
async function wcSpawn(instance, ...args) {
  console.log('Running:', args.join(' '));
  const process = await instance.spawn(...args);
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    }),
  );
  const exitCode = await process.exit;
  if (exitCode !== 0) {
    console.log('Command Failed:', args.join(' '), 'with exit code', exitCode);
    throw new Error('Command Failed', args.join(' '));
  }

  console.log('Command Successful:', args.join(' '));
  return process;
}

/**
 * Function to initialize and configure the WebContainer.
 * @returns {Promise} - Promise that resolves with the configured WebContainer instance.
 */
async function makeWebcontainer() {
  // console.log('Booting WebContainer...');
  const instance = await WebContainer.boot();
  // console.log('Boot successful!');

  // console.log('Mounting files...');
  await instance.mount(files);
  // console.log('Mounted files!');

  // console.log('Installing dependencies...');
  await wcSpawn(instance, 'npm', ['install']);
  // console.log('Installed dependencies!');

  return instance;
}

/**
 * Main component for the Playground.
 * @returns {JSX.Element} - The rendered JSX element.
 */
export default function Playground() {
  const instance = useRef(null);
  const [url, setUrl] = useState(null);
  const [code, _setCode] = useState(
    files.src.directory['App.jsx'].file.contents,
  );
  const [error, setError] = useState(null);
  const urlRef = useRef(null);

  const [activePanel, setActivePanel] = useState('code');

  /**
   * Function to update files in the WebContainer.
   */
  const updateFiles = async (updatedCode) => {
    const containerInstance = instance.current;
    const filePath = './src/App.jsx';
    await containerInstance.fs.writeFile(filePath, updatedCode);
  };

  const debouncedUpdateFiles = useDebounced(async (newCode) => {
    await updateFiles(newCode);
  }, 1000);

  /**
   * Function to handle code changes in the CodeMirror editor.
   * @param {string} newCode - The new code content from the editor.
   */
  const handleCodeChange = (newCode) => {
    // setCode(newCode);
    debouncedUpdateFiles(newCode);
  };

  /**
   * Function to reload the WebContainer preview.
   */
  const reloadWebContainer = async () => {
    if (!url) return;
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    try {
      if (error) {
        setError(null);
      }
      await reloadPreview(iframe);
    } catch (err) {
      console.error(`Error reloading preview: ${err.message}`);
      setError(
        'WebContainer failed to load. Please try reloading or use a different browser.',
      );
    }
  };

  // useEffect to initialize the WebContainer and build it
  useEffect(() => {
    let loadingTimeout;

    /**
     * Function to build the WebContainer and start the development server.
     */
    async function build() {
      const containerInstance = await makeWebcontainer();

      if (!containerInstance) {
        console.log('error due to failed instance');
        setError(
          'WebContainer failed to load. Please try reloading or use a different browser.',
        );
        return;
      }
      instance.current = containerInstance;

      // console.log('Trying to run `npm run dev`...');
      const process = await containerInstance.spawn('npm', ['run', 'dev']);
      // console.log('Spawned `npm run dev`...');
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        }),
      );
      // console.log('Waiting for server-ready event...');
      containerInstance.on('server-ready', (port, url) => {
        console.log('server-ready', port, url);
        setUrl(url);
        urlRef.current = url;
      });
    }

    build();

    // Cleanup function to unmount the WebContainer and clear timeouts
    return () => {
      instance.current.unmount();
      if (loadingTimeout != null) {
        clearTimeout(loadingTimeout);
      }
    };
  }, []);

  // Render the Playground component
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.headerContainer)}>
        <div {...stylex.props(styles.headerContent)}>
          <div {...stylex.props(styles.desktopHeader)}>
            <span {...stylex.props(styles.headerNote)}>
              Experimental playground - Try a{' '}
              <a
                {...stylex.props(styles.link)}
                href="https://stackblitz.com/edit/vitejs-vite-3vkyxg?file=package.json"
              >
                full example app
              </a>
            </span>
          </div>
          <div {...stylex.props(styles.mobileNav)}>
            <button
              {...stylex.props(
                styles.tabButton,
                activePanel === 'code' && styles.tabButtonActive,
              )}
              onClick={() => setActivePanel('code')}
            >
              Code
            </button>
            <button
              {...stylex.props(
                styles.tabButton,
                activePanel === 'preview' && styles.tabButtonActive,
              )}
              onClick={() => setActivePanel('preview')}
            >
              Preview
              {url && activePanel === 'preview' && (
                <span {...stylex.props(styles.mobileReloadContainer)}>
                  <button
                    {...stylex.props(
                      styles.reloadButton,
                      styles.mobileReloadButton,
                    )}
                    aria-label="Reload preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      reloadWebContainer();
                    }}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-rotate-right" />
                  </button>
                </span>
              )}
            </button>
          </div>
          <div {...stylex.props(styles.desktopReloadContainer)}>
            <button
              {...stylex.props(styles.reloadButton)}
              aria-label="Reload preview"
              onClick={reloadWebContainer}
            >
              <FontAwesomeIcon icon="fa-solid fa-rotate-right" />
            </button>
          </div>
        </div>
      </div>
      <div {...stylex.props(styles.container)}>
        <BrowserOnly>
          {() => (
            <>
              <CodeMirror
                {...stylex.props(
                  styles.panel,
                  activePanel === 'code' && styles.panelActive,
                )}
                onChange={(editor, data, newCode) => handleCodeChange(newCode)}
                options={{
                  mode: 'javascript',
                  theme: 'material-darker',
                  lineNumbers: true,
                }}
                value={code}
              />
              {error ? (
                <div
                  {...stylex.props(
                    styles.panel,
                    activePanel === 'preview' && styles.panelActive,
                    styles.centered,
                  )}
                >
                  {error}
                </div>
              ) : url ? (
                <iframe
                  {...stylex.props(
                    styles.panel,
                    activePanel === 'preview' && styles.panelActive,
                  )}
                  src={url}
                />
              ) : (
                <div
                  {...stylex.props(
                    styles.panel,
                    activePanel === 'preview' && styles.panelActive,
                    styles.centered,
                  )}
                >
                  <LoadingSpinner />
                </div>
              )}
            </>
          )}
        </BrowserOnly>
      </div>
    </div>
  );
}

const MOBILE = '@media (max-width: 768px)';

// Style definitions for the Playground component
const styles = stylex.create({
  root: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg1)',
  },
  headerContainer: {
    backgroundColor: 'var(--playground-container-bg)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    alignItems: 'center',
    display: 'flex',
    height: 40,
    justifyContent: 'space-between',
    paddingInline: 16,
    position: 'relative',
  },
  desktopHeader: {
    display: {
      default: 'block',
      [MOBILE]: 'none',
    },
  },
  headerNote: {
    color: 'var(--fg2)',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  mobileNav: {
    alignItems: 'center',
    display: {
      default: 'none',
      [MOBILE]: 'flex',
    },
    flexGrow: 1,
    gap: 8,
    height: '100%',
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--ifm-color-primary-light)',
    },
    borderColor: 'transparent',
    borderRadius: 4,
    borderStyle: 'none',
    borderWidth: 0,
    color: 'var(--fg1)',
    cursor: 'pointer',
    display: 'flex',
    flexBasis: 0,
    flexGrow: 1,
    fontSize: '0.9rem',
    height: 'calc(100% - 12px)',
    justifyContent: 'center',
    paddingBottom: 0,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 0,
    transitionDuration: '200ms',
    transitionProperty: 'background-color',
  },
  tabButtonActive: {
    color: 'white',
    backgroundColor: {
      default: 'var(--ifm-color-primary)',
      ':hover': 'var(--ifm-color-primary)',
    },
  },
  reloadButton: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--ifm-color-primary-light)',
    },
    borderRadius: 4,
    borderStyle: 'none',
    color: 'var(--fg1)',
    cursor: 'pointer',
    display: 'flex',
    height: 32,
    justifyContent: 'center',
    padding: 4,
    transform: {
      default: null,
      ':hover': 'scale(1.05)',
    },
    transitionDuration: '200ms, 150ms',
    transitionProperty: 'background-color, transform',
    width: 32,
    zIndex: 20,
  },
  container: {
    alignItems: 'center',
    borderBottomColor: 'var(--cyan)',
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    display: 'flex',
    height: stylex.firstThatWorks(
      'calc(100dvh - 100px)',
      'calc(100vh - 100px)',
    ),
    justifyContent: 'center',
    position: 'relative',
  },
  panel: {
    alignItems: 'stretch',
    borderStyle: 'none',
    borderWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'stretch',
    left: 0,
    opacity: {
      default: 1,
      [MOBILE]: 0,
    },
    pointerEvents: {
      default: 'auto',
      [MOBILE]: 'none',
    },
    position: {
      default: 'relative',
      [MOBILE]: 'absolute',
    },
    top: 0,
    transitionDuration: '200ms',
    transitionProperty: 'opacity',
    width: {
      default: '50%',
      [MOBILE]: '100%',
    },
  },
  panelActive: {
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopReloadContainer: {
    display: {
      default: 'block',
      [MOBILE]: 'none',
    },
  },
  mobileReloadContainer: {
    display: {
      default: 'none',
      [MOBILE]: 'inline-flex',
    },
    marginLeft: 8,
  },
  mobileReloadButton: {
    color: 'white',
    height: 24,
    width: 24,
  },
});
