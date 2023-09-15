#!/usr/bin/env node
// @flow

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

const inputDir = path.join(process.cwd(), args.inputDir);
const outputDir = path.join(process.cwd(), args.outputDir);
rewriteImportsInFolder(inputDir, outputDir)
  .then(() => {
    console.log('Done generating type definition files');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function rewriteImportsInFolder(
  inputDir /*: string*/,
  outputDir /*: string*/,
) {
  await fs.mkdir(outputDir, { recursive: true });
  const dirents = await fs.readdir(inputDir, { withFileTypes: true });
  for (const dirent of dirents) {
    // We only care about the `stylex` package for now which has
    // a flat file tree.
    if (dirent.isDirectory()) {
      continue;
    }
    if (typeof dirent.name !== 'string' || !dirent.name.endsWith('.js')) {
      continue;
    }
    const fileName = dirent.name;
    const inputFullPath = path.join(inputDir, fileName);
    const outputFullPath = path.join(outputDir, fileName);
    const inputFile = await fs.readFile(inputFullPath, 'utf8');
    let outputFile = await translateFlowImportsTo(
      inputFile,
      {},
      {
        sourceMapper: ({ module }) => module.slice(module.lastIndexOf('/') + 1),
      },
    );
    if (fileName === 'stylex.js') {
      outputFile = outputFile.replace(
        'export default (_stylex: IStyleX);\n',
        '',
      );
    }
    await fs.writeFile(outputFullPath, outputFile);
  }
}
