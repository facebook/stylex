#!/usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

const brotliSizePkg = require('brotli-size');
const CleanCSS = require('clean-css');
const fs = require('fs');
const path = require('path');
const { minify_sync } = require('terser');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const minifyCSS = new CleanCSS();

function getSizes(files) {
  const sizes = files.map((file) => {
    const code = fs.readFileSync(file, 'utf8');
    let result = '';
    if (file.endsWith('.css')) {
      result = minifyCSS.minify(code).styles;
    }
    if (file.endsWith('.js')) {
      result = minify_sync(code).code;
    }
    const minified = Buffer.byteLength(result, 'utf8');
    const compressed = brotliSizePkg.sync(result);
    return { file, compressed, minified };
  });
  return sizes;
}

// run.js --outfile filename.js
const argv = yargs(hideBin(process.argv)).option('outfile', {
  alias: 'o',
  type: 'string',
  description: 'Output file',
  demandOption: false,
}).argv;
const outfile = argv.outfile;

const files = [
  path.join(__dirname, '../stylex/lib/stylex.js'),
  path.join(__dirname, '../stylex/lib/StyleXSheet.js'),
  path.join(__dirname, '../../apps/rollup-example/.build/bundle.js'),
  path.join(__dirname, '../../apps/rollup-example/.build/stylex.css'),
];

console.log('Running "size" benchmark, please wait...');

const sizes = getSizes(files);

const aggregatedResults = {};
sizes.forEach((entry) => {
  const { file, minified, compressed } = entry;
  const filename = file.split('apps/')[1] || file.split('packages/')[1];
  aggregatedResults[filename] = {
    compressed,
    minified,
  };
});

const aggregatedResultsString = JSON.stringify(aggregatedResults, null, 2);

// Print / Write results
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const timestamp = `${year}${month}${day}-${hours}${minutes}`;

const dirpath = `${process.cwd()}/.logs`;
const filepath = `${dirpath}/size-${timestamp}.json`;
if (!fs.existsSync(dirpath)) {
  fs.mkdirSync(dirpath);
}
const outpath = outfile || filepath;
fs.writeFileSync(outpath, `${aggregatedResultsString}\n`);

console.log(aggregatedResultsString);
console.log('Results written to', outpath);
