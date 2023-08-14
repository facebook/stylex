#!/usr/bin/env node

const fsPromises = require('fs/promises');
const monorepoPackage = require('../../package.json');
const path = require('path');
const translate = require('flow-api-translator');
const yargs = require('yargs/yargs');

const {
  findFlowModules,
  patchFlowModulePaths,
} = require('./handle-flow-modules');

async function generateTypes(inputDir, outputDir, rootDir) {
  const rootPath = rootDir ?? path.resolve(inputDir, '../');
  const flowModules = await findFlowModules(inputDir, rootPath);

  await fsPromises.mkdir(outputDir, { recursive: true });
  let dirents = await fsPromises.readdir(inputDir, { withFileTypes: true });

  const jsFlowFiles = dirents
    .filter((dirent) => dirent.name.endsWith('.js.flow'))
    .map((dirent) => dirent.name.replace(/\.js\.flow$/, '.js'));

  const dTsFiles = dirents
    .filter((dirent) => dirent.name.endsWith('.d.ts'))
    .map((dirent) => dirent.name);

  dirents = dirents.filter((dirents) => !jsFlowFiles.includes(dirents.name));

  for (const dirent of dirents) {
    const inputFullPath = path.join(inputDir, dirent.name);
    const outputFullPath = path
      .join(outputDir, dirent.name)
      .replace(/\.js\.flow$/, '.js');
    if (dirent.isDirectory()) {
      if (dirent.name !== '__tests__') {
        await generateTypes(inputFullPath, outputFullPath, rootPath);
      }
    } else {
      // // dirent is a file
      if (dirent.name.endsWith('.d.ts')) {
        const fileContents = await fsPromises.readFile(inputFullPath, 'utf8');
        await fsPromises.writeFile(
          path.join(outputDir, dirent.name),
          fileContents,
        );
      }

      if (dirent.name.endsWith('.js') || dirent.name.endsWith('.js.flow')) {
        try {
          let fileContents = await fsPromises.readFile(inputFullPath, 'utf8');
          fileContents = preprocessFileContents(fileContents);
          let outputFlowContents = await translate.translateFlowToFlowDef(
            fileContents,
            monorepoPackage.prettier,
          );
          outputFlowContents = patchFlowModulePaths(
            outputFullPath,
            outputFlowContents,
            flowModules,
          );

          await fsPromises.writeFile(
            `${outputFullPath}.flow`,
            outputFlowContents,
          );
          const tsOutputName = dirent.name
            .replace(/\.js$/, '.d.ts')
            .replace(/\.js\.flow$/, '.d.ts');
          if (dTsFiles.includes(tsOutputName)) {
            continue;
          }
          const outputTSContents = await translate.translateFlowToTSDef(
            fileContents,
            monorepoPackage.prettier,
          );
          await fsPromises.writeFile(
            outputFullPath.replace(/\.js$/, '.d.ts'),
            // Typescript Prefers `NodePath` unlike `NodePath<>` in Flow
            // `flow-api-translator` doesn't handle this case yet.
            postProcessTSOutput(outputTSContents),
          );
        } catch (err) {
          console.log(`Failed to process file: ${inputFullPath}`);
          throw err;
        }
      }
    }
  }
}

// Changes to files before they are processed by `flow-api-translator`
// to patch the bugs in the translator
function preprocessFileContents(inputCode) {
  // `flow-api-translator` doesn't handle Flow comments correctly
  while (inputCode.includes('/*::')) {
    const startIndex = inputCode.indexOf('/*::');
    const endIndex = inputCode.indexOf('*/', startIndex);

    const comment = inputCode.substring(startIndex, endIndex + 2);
    const replacement = comment.substring(4, comment.length - 2);

    inputCode = inputCode.replace(comment, replacement);
  }
  return inputCode;
}

function postProcessTSOutput(outputCode) {
  const result = outputCode
    .replace(/<>/g, '')
    .replace(/\$ReadOnlyMap/g, 'ReadonlyMap')
    .replace(/\$ReadOnlySet/g, 'ReadonlySet');

  return result;
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
