/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');

function readJsonFile(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

function mergeData(base, patch) {
  const merged = {};
  function addToMerged(data, fileIndex) {
    Object.keys(data).forEach((key) => {
      if (merged[key] == null) {
        merged[key] = {};
      }
      Object.keys(data[key]).forEach((subKey) => {
        if (merged[key][subKey] == null) {
          merged[key][subKey] = {};
        }
        merged[key][subKey][fileIndex] = data[key][subKey];
      });
    });
  }
  if (base != null) {
    addToMerged(base, 1);
  }
  if (patch != null) {
    addToMerged(patch, 2);
  }
  return merged;
}

function generateComparisonData(results) {
  const baseResult = parseInt(results[1], 10);
  const patchResult = parseInt(results[2], 10);
  const isValidBase = !isNaN(baseResult);
  const isValidPatch = !isNaN(patchResult);
  let icon = '',
    ratioFixed = '';

  if (isValidBase && isValidPatch) {
    const ratio = patchResult / baseResult;
    ratioFixed = ratio.toFixed(2);
    if (ratio < 0.95 || ratio > 1.05) {
      icon = '**!!**';
    } else if (ratio < 1) {
      icon = '-';
    } else if (ratio > 1) {
      icon = '+';
    }
  }

  return {
    baseResult: isValidBase ? baseResult.toLocaleString() : '',
    patchResult: isValidPatch ? patchResult.toLocaleString() : '',
    ratio: ratioFixed,
    icon,
  };
}

function generateMarkdownTable(mergedData) {
  const rows = [];
  rows.push('| **Results** | **Base** | **Patch** | **Ratio** |  |');
  rows.push('| :--- | ---: | ---: | ---: | ---: |');
  Object.keys(mergedData).forEach((suiteName) => {
    rows.push('|  |  |  |  |');
    rows.push(`| **${suiteName}** |  |  |  |  |`);
    Object.keys(mergedData[suiteName]).forEach((test) => {
      const results = mergedData[suiteName][test];
      const { baseResult, patchResult, ratio, icon } =
        generateComparisonData(results);
      rows.push(
        `| &middot; ${test} | ${baseResult} | ${patchResult} | ${ratio} | ${icon} |`,
      );
    });
  });
  return rows.join('\n');
}

/**
 * Compare up to 2 different benchmark runs
 */
const args = process.argv.slice(2);
const baseResults = args[0] ? readJsonFile(args[0]) : null;
const patchResults = args[1] ? readJsonFile(args[1]) : null;
const mergedData = mergeData(baseResults, patchResults);
const markdownTable = generateMarkdownTable(mergedData);

console.log(markdownTable);
