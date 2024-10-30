/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import BrowserOnly from '@docusaurus/BrowserOnly';
import * as stylex from '@stylexjs/stylex';
import { WebContainer } from '@webcontainer/api';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { files as initialFiles } from './playground-utils/files';

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
  await instance.mount(initialFiles);
  console.log('Mounted files!');

  console.log('Installing dependencies...');
  await wcSpawn(instance, 'npm', ['install']);
  console.log('Installed dependencies!');

  return instance;
}

export default function Playground() {
  const instance = useRef(null);
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState('app.jsx');
  const [url, setUrl] = useState(null);

  const build = async () => {
    const containerInstance = instance.current;
    if (!containerInstance) return;

    console.log('Trying to run `npm start`...');
    const process = await containerInstance.spawn('npm', ['start']);
    console.log('Spawned `npm start`...');
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
      // TODO: Figure out hot reloading
      // TODO: Figure out how to start server *after* build
      setTimeout(() => {
        setUrl(url);
      }, 5000);
    });
  };

  useEffect(() => {
    require('codemirror/mode/javascript/javascript');
    makeWebcontainer().then((i) => {
      instance.current = i;
      build();
    });
    () => {
      instance.current.unmount();
    };
  }, []);

  const addNewFile = () => {
    const filename = prompt('Enter new file name:');
    if (filename && !files[filename]) {
      setFiles((prev) => ({
        ...prev,
        [filename]: { name: filename, content: '' },
      }));
      setActiveFile(filename);
    } else {
      alert('Invalid or duplicate file name.');
    }
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        {Object.keys(files).map((file) => (
          <button
            key={file}
            {...stylex.props([
              styles.tab,
              activeFile === file && styles.activeTab,
            ])}
            onClick={() => setActiveFile(file)}
          >
            {file}
          </button>
        ))}
        <button {...stylex.props(styles.addButton)} onClick={addNewFile}>
          +
        </button>
      </div>
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
              value={files.src.directory['app.jsx'].file.contents}
            />
            {url ? (
              <iframe {...stylex.props(styles.textarea)} src={url} />
            ) : (
              <div {...stylex.props(styles.textarea)}>Loading...</div>
            )}
          </>
        )}
      </BrowserOnly>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: stylex.firstThatWorks('calc(100dvh - 60px)', 'calc(100vh - 60px)'),
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--cyan)',
    overflow: 'auto',
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
  header: {
    display: 'flex',
    width: '50%',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#282c34',
    borderBottom: '1px solid #444',
  },
  tab: {
    marginRight: '10px',
    padding: '10px 15px',
    backgroundColor: '#333',
    color: '#ddd',
    border: 'none',
    borderRadius: '5px 5px 0 0',
    cursor: 'pointer',
  },
  activeTab: {
    backgroundColor: '#444',
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    marginLeft: 'auto',
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
});
