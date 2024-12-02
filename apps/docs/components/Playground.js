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
import { files } from './playground-utils/files';

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
  const [isUpdating, setIsUpdating] = useState(null);
  const [code, setCode] = useState(
    files.src.directory['App.jsx'].file.contents,
  );

  const build = async () => {
    const containerInstance = instance.current;
    if (!containerInstance) return;

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

  useEffect(() => {
    require('codemirror/mode/javascript/javascript');
    makeWebcontainer().then((i) => {
      instance.current = i;
      build();
    });
    () => {
      instance.current.unmount();
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
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
            {url && !isUpdating ? (
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
