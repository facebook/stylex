/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import fs from 'fs';
import path from 'path';
import errors from './errors';

// $FlowFixMe
import { mkdirp } from 'mkdirp';
import type { Config } from './config';

// gets the directory for compiled styles (creates it if it doesn't exist)
export function makeCompiledDir(config: Config): void {
  if (!fs.existsSync(config.output)) {
    mkdirp.sync(config.output);
  }
}

export function getInputDirectoryFiles(inputDir: string): Array<string> {
  if (!fs.existsSync(inputDir)) {
    throw errors.dirNotFound;
  } else {
    const files = fs.readdirSync(inputDir, { recursive: true });
    return files.filter((file) => {
      const maybeDir = path.join(inputDir, file);
      return !isDir(maybeDir);
    });
  }
}

export function writeCompiledCSS(filePath: string, compiledCSS: string): void {
  mkdirp.sync(path.parse(filePath).dir);
  fs.writeFileSync(filePath, compiledCSS);
}

export function writeCompiledJS(filePath: string, code: string): void {
  const parsedFile = path.parse(filePath);
  mkdirp.sync(parsedFile.dir);
  if (parsedFile.ext !== '.js') {
    parsedFile.ext = '.js';
  }
  const newPath = path.join(
    parsedFile.dir,
    `${parsedFile.name}${parsedFile.ext}`,
  );
  console.log(newPath);
  fs.writeFileSync(newPath, code, {});
}

export function copyFile(filePath: string, config: Config) {
  const src = path.join(config.input, filePath);
  const dst = path.join(config.output, filePath);
  mkdirp.sync(path.parse(dst).dir);
  fs.copyFileSync(src, dst);
}

export function isDir(filePath: string): boolean {
  return fs.lstatSync(filePath).isDirectory();
}

export function isJSFile(filePath: string): boolean {
  const parsed = path.parse(filePath);
  return (
    parsed.ext === '.js' ||
    parsed.ext === '.ts' ||
    parsed.ext === '.jsx' ||
    parsed.ext === '.tsx' ||
    parsed.ext === '.cjs' ||
    parsed.ext === '.mjs'
  );
}

// e.g. ./pages/home/index.js -> ../../stylex_bundle.css
export function getCssPathFromFilePath(
  filePath: string,
  config: Config,
): string {
  const relativePath = path.relative(path.dirname(filePath), config.input);
  return formatRelativePath(path.join(relativePath, config.cssBundleName));
}

export function removeCompiledDir(config: Config): void {
  fs.rmSync(config.output, { recursive: true, force: true });
}

function formatRelativePath(filePath: string) {
  return filePath.startsWith('.') ? filePath : './' + filePath;
}
