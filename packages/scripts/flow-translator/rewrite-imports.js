#!/usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs').promises;
const path = require('path');
const yargs = require('yargs/yargs');
const { translateFlowImportsTo } = require('flow-api-translator');

const args = yargs(process.argv)
  .option('inputDir', {
    alias: 'i',
    type: 'string',
  })
  .option('outputDir', {
    alias: 'o',
    type: 'string',
  }).argv;

rewriteImportsInFolder(args.inputDir, args.outputDir)
  .then(() => {
    console.log('Successfully rewrote imports');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function rewriteImportsInFolder(
  inputDir /*: string*/,
  outputDir /*: string*/,
) {
  const inputAbsoluteDir = path.join(process.cwd(), inputDir);

  const dirents = await fs.readdir(inputAbsoluteDir, {
    recursive: true,
    withFileTypes: true,
  });

  for (const dirent of dirents) {
    if (typeof dirent.name !== 'string' || !dirent.name.endsWith('.js')) {
      continue;
    }
    const fileName = dirent.name.toString();
    const inputAbsoluteFilePath = path.join(dirent.path, fileName);
    const inputRelativeDir = dirent.path.split(inputAbsoluteDir)[1];
    const outputRelativePath = path.join(outputDir, inputRelativeDir, fileName);
    const inputFile = await fs.readFile(inputAbsoluteFilePath, 'utf8');
    let outputFile = await translateFlowImportsTo(
      inputFile,
      {},
      {
        sourceMapper: ({ module }) => module.slice(module.lastIndexOf('/') + 1),
      },
    );
    if (fileName === 'stylex.js') {
      outputFile = outputFile.replace(
        'export default _stylex as IStyleX;\n',
        '',
      );
    }
    const dirPath = path.dirname(outputRelativePath);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(outputRelativePath, outputFile);
  }
}
