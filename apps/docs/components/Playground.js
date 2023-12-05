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
  console.log('Booting WebContainer...');
  const instance = await WebContainer.boot();
  console.log('Boot successful!');

  console.log('Mounting files...');
  await instance.mount(files);
  console.log('Mounted files!');

  console.log('Installing dependencies...');
  await wcSpawn(instance, 'npm', ['install']);
  console.log('Installed dependencies!');

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

  /**
   * Function to build the WebContainer and start the development server.
   */
  const build = async () => {
    const containerInstance = instance.current;
    if (!containerInstance) {
      console.log('error due to failed instance');
      setError(
        'WebContainer failed to load. Please try reloading or use a different browser.',
      );
      return;
    }

    console.log('Trying to run `npm run dev`...');
    const process = await containerInstance.spawn('npm', ['run', 'dev']);
    console.log('Spawned `npm run dev`...');
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      }),
    );
    console.log('Waiting for server-ready event...');
    containerInstance.on('server-ready', (port, url) => {
      console.log('server-ready', port, url);
      setUrl(url);
      urlRef.current = url;
    });
  };

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
    makeWebcontainer().then((i) => {
      instance.current = i;
      build().then(() => {
        loadingTimeout = setTimeout(() => {
          if (!urlRef.current) {
            console.log('error due to timeout...');
            setError(
              'WebContainer failed to load. Please try reloading or use a different browser.',
            );
          }
          loadingTimeout = null;
        }, 10000);
      });
    });

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
      <header {...stylex.props(styles.header)}>
        {/* <button>
          <FontAwesomeIcon icon="fa-solid fa-bars" />
        </button> */}
        <button
          {...stylex.props(styles.reloadButton)}
          onClick={reloadWebContainer}
        >
          <FontAwesomeIcon
            aria-label="reload"
            icon="fa-solid fa-rotate-right"
          />
        </button>
      </header>
      <div {...stylex.props(styles.container)}>
        <BrowserOnly>
          {() => (
            <>
              <CodeMirror
                {...stylex.props(styles.textarea)}
                onChange={(editor, data, newCode) => handleCodeChange(newCode)}
                options={{
                  mode: 'javascript',
                  theme: 'material-darker',
                  lineNumbers: true,
                }}
                value={code}
              />
              {error ? (
                <div {...stylex.props(styles.textarea, styles.centered)}>
                  {error}
                </div>
              ) : url ? (
                <iframe {...stylex.props(styles.textarea)} src={url} />
              ) : (
                <div {...stylex.props(styles.textarea, styles.centered)}>
                  Loading...
                </div>
              )}
            </>
          )}
        </BrowserOnly>
      </div>
    </div>
  );
}

// Style definitions for the Playground component
const styles = stylex.create({
  root: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg1)',
  },
  header: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingInline: 4,
    backgroundColor: 'var(--playground-container-bg)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
  },
  reloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--ifm-color-primary-light)',
    },
    color: 'var(--fg1)',
    width: 32,
    height: 32,
    borderRadius: 4,
    borderStyle: 'none',
    cursor: 'pointer',
    zIndex: 20,
    padding: 4,
    transitionProperty: 'background-color, transform',
    transitionDuration: '200ms, 150ms',
    transform: {
      default: null,
      ':hover': 'scale(1.05)',
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: stylex.firstThatWorks(
      'calc(100dvh - 100px)',
      'calc(100vh - 100px)',
    ),
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--cyan)',
  },
  textarea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    width: '50%',
    height: '100%',
    borderWidth: 0,
    borderStyle: 'none',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
