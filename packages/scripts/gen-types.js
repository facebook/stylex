#!/usr/bin/env node

const fsPromises = require('fs/promises');
const monorepoPackage = require('../../package.json');
const path = require('path');
const translate = require('flow-api-translator');
const yargs = require('yargs/yargs');

async function generateTypes(inputDir, outputDir) {
  await fsPromises.mkdir(outputDir, { recursive: true });
  const dirents = await fsPromises.readdir(inputDir, { withFileTypes: true });
  for (const dirent of dirents) {
    const inputFullPath = path.join(inputDir, dirent.name);
    const outputFullPath = path.join(outputDir, dirent.name);
    if (dirent.isDirectory()) {
      if (dirent.name !== '__tests__') {
        await generateTypes(inputFullPath, outputFullPath);
      }
    } else {
      // dirent is a file
      if (dirent.name.endsWith('.js')) {
        try {
          const fileContents = await fsPromises.readFile(inputFullPath, 'utf8');
          const outputFlowContents = await translate.translateFlowToFlowDef(
            fileContents,
            monorepoPackage.prettier
          );
          await fsPromises.writeFile(
            `${outputFullPath}.flow`,
            outputFlowContents
          );
          const outputTSContents = await translate.translateFlowToTSDef(
            fileContents,
            monorepoPackage.prettier
          );
          await fsPromises.writeFile(
            outputFullPath.replace(/\.js$/, '.d.ts'),
            outputTSContents
          );
        } catch (err) {
          console.log(`Failed to process file: ${inputFullPath}`);
          throw err;
        }
      }
    }
  }
}

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
generateTypes(inputDir, outputDir)
  .then(() => {
    console.log('Done generating type definition files');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
