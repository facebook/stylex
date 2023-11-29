/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {WebContainer} from '@webcontainer/api';
import {files} from './playground-utils/files';

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
  const [output, setOutput] = useState('');

  const build = async () => {
    const containerInstance = instance.current;
    if (!containerInstance) return;

    await wcSpawn(containerInstance, 'npm', ['run', 'build']);
    const output = await containerInstance.fs.readFile('output.js', 'utf-8');
    setOutput(output);
  };

  useEffect(() => {
    makeWebcontainer().then((i) => {
      instance.current = i;
      build();
    });
    () => {
      instance.current.unmount();
    };
  }, []);

  return (
    <div {...stylex.props(styles.container)}>
      <pre {...stylex.props(styles.textarea)}>
        {files['input.js'].file.contents}
      </pre>
      <pre {...stylex.props(styles.textarea)}>{output}</pre>
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
    width: '50%',
    height: '100%',
    borderWidth: 0,
    borderStyle: 'none',
  },
});
