/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import BrowserOnly from '@docusaurus/BrowserOnly';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as stylex from '@stylexjs/stylex';
import { WebContainer, reloadPreview } from '@webcontainer/api';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { files } from './playground-utils/files';

library.add(faBars, faRotateRight);

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

export default function Playground() {
  const instance = useRef(null);
  const [url, setUrl] = useState(null);
  const debounceTimeout = useRef(null);
  const [code, setCode] = useState(
    files.src.directory['App.jsx'].file.contents,
  );
  const [error, setError] = useState(null);
  const loadingTimeout = useRef(null);
  const urlRef = useRef(null);

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

  const updateFiles = async () => {
    const containerInstance = instance.current;
    const filePath = './src/App.jsx';
    const updatedCode = code;
    await containerInstance.fs.writeFile(filePath, updatedCode);
  };

  const handleCodeChange = (newCode) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }

    debounceTimeout.current = setTimeout(async () => {
      setCode(newCode);
      if (url) {
        try {
          await updateFiles();
          console.log('Successfully applied changes.');
        } catch (err) {
          console.error(err);
        }
      }
    }, 2000);
  };

  const reloadWebContainer = async () => {
    if (!url) return;
    console.log('Reloading container preview...');
    const iframe = document.querySelector('iframe');
    await reloadPreview(iframe);
  };

  useEffect(() => {
    require('codemirror/mode/javascript/javascript');
    makeWebcontainer().then((i) => {
      instance.current = i;
      build().then(() => {
        loadingTimeout.current = setTimeout(() => {
          console.log('running loading timeout');
          console.log('instance: ', instance.current);
          console.log('url ref: ', urlRef.current);
          if (!urlRef.current) {
            console.log('error due to timeout...');
            setError(
              'WebContainer failed to load. Please try reloading or use a different browser.',
            );
          }
        }, 10000);
      });
    });

    () => {
      instance.current.unmount();
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  return (
    <div {...stylex.props(styles.root)}>
      <header {...stylex.props(styles.header)}>
        <button>
          <FontAwesomeIcon icon="fa-solid fa-bars" />
        </button>
        <button {...stylex.props(styles.reloadButton)}>
          <FontAwesomeIcon
            onClick={reloadWebContainer}
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
                options={{
                  mode: 'javascript',
                  theme: 'material-darker',
                  lineNumbers: true,
                }}
                value={code}
                onChange={(editor, data, newCode) => handleCodeChange(newCode)}
              />
              {error ? (
                <div {...stylex.props(styles.textarea)}>{error}</div>
              ) : url ? (
                <iframe {...stylex.props(styles.textarea)} src={url} />
              ) : (
                <div {...stylex.props(styles.textarea)}>Loading...</div>
              )}
            </>
          )}
        </BrowserOnly>
      </div>
    </div>
  );
}

const styles = stylex.create({
  root: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg1)',
  },
  header: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '20px',
    paddingRight: '20px',
    backgroundColor: 'var(--playground-container-bg)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
  },
  reloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: 'var(--fg1)',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    zIndex: 20,
    padding: '4px',
    transition: 'background-color 200ms, transform 150ms',
    ':hover': {
      backgroundColor: 'var(--ifm-color-primary-light)',
      transform: 'scale(1.05)',
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: stylex.firstThatWorks('calc(100dvh - 60px)', 'calc(100vh - 60px)'),
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
});
