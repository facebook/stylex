/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const fs = require('fs/promises');
const { transformAsync } = require('@babel/core');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
const flowSyntaxPlugin = require('@babel/plugin-syntax-flow');
const jsxSyntaxPlugin = require('@babel/plugin-syntax-jsx');
const path = require('path');
const mkdirp = require('mkdirp');

async function transformFile(filePath) {
  const code = await fs.readFile(filePath, 'utf8');
  const result = await transformAsync(code, {
    filename: filePath,
    plugins: [
      flowSyntaxPlugin,
      jsxSyntaxPlugin,
      [
        stylexBabelPlugin,
        {
          dev: false,
          test: false,
          stylexSheetName: '<>',
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: path.join(__dirname, '../../..'),
          },
        },
      ],
    ],
    sourceType: 'unambiguous',
    babelrc: false,
  });
  // console.log(JSON.stringify(result.metadata.stylex, null, 2));
  return result.metadata.stylex;
}

async function getAllFilesOfType(folder, type) {
  const contents = await fs.readdir(folder, { withFileTypes: true });

  const files = await Promise.all(
    contents.map(async (dirent) => {
      const subPath = path.join(folder, dirent.name);
      if (dirent.isDirectory()) {
        return await getAllFilesOfType(subPath, type);
      }
      if (dirent.name.endsWith(type)) {
        return subPath;
      }
      return null;
    }),
  );

  return files.flat().filter(Boolean);
}

async function genSheet() {
  const componentsPromise = getAllFilesOfType(
    path.join(__dirname, '../components'),
    '.js',
  );
  const pagesPromise = getAllFilesOfType(path.join(__dirname, '../src'), '.js');
  const docsPromise = getAllFilesOfType(path.join(__dirname, '../docs'), '.js');
  const components = await componentsPromise;
  const pages = await pagesPromise;
  const docs = await docsPromise;
  const allFiles = [...components, ...pages, ...docs];

  const ruleSets = await Promise.all(allFiles.map(transformFile));

  const generatedCSS = stylexBabelPlugin.processStylexRules(ruleSets.flat(), {
    useLayers: false,
    enableLTRRTLComments: false,
  });

  await mkdirp(path.join(__dirname, '../.stylex/'));

  const generatedCSSPaths = await getAllFilesOfType(
    path.join(__dirname, '../build/assets/css'),
    '.css',
  );

  if (generatedCSSPaths.length !== 1) {
    console.error(
      'Could not find a single CSS file. Instead found',
      generatedCSSPaths,
    );
  }

  const cssPath = generatedCSSPaths[0];
  console.log('appending to', cssPath);

  await fs.appendFile(cssPath, generatedCSS);

  console.log('Success');
}

genSheet();
