#!/usr/bin/env node
/**
 * Pre-compile Tailwind classes to StyleX JSS format.
 * Run this before starting Next.js: node prebuild-tw.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function main() {
  console.log('Pre-compiling Tailwind classes...');

  // Import async dependencies
  const { compile } = await import('tailwindcss');
  const { optimizeCss } = require('tailwind-to-stylex/lib/classes-to-css.js');
  const { convertFromCssToJss } = require('tailwind-to-stylex/lib/helpers.js');

  // Load theme
  const themePath = require.resolve('tailwind-to-stylex/theme.css');
  const theme = fs.readFileSync(themePath, 'utf-8');
  const { build } = await compile(`${theme}\n\n@tailwind utilities;`);

  // Find all TSX/JSX files
  const files = glob.sync('**/*.{tsx,jsx}', {
    cwd: path.join(__dirname, 'app'),
    absolute: true,
  });

  console.log(`Found ${files.length} files to scan`);

  // Extract className values
  const classNamePattern = /className\s*=\s*["'`]([^"'`]+)["'`]/g;
  const allClasses = new Set();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    while ((match = classNamePattern.exec(content)) !== null) {
      const classString = match[1];
      // Split by space and add each class
      classString.split(/\s+/).forEach(cls => {
        if (cls.trim()) allClasses.add(cls.trim());
      });
      // Also add the full string for exact matching
      allClasses.add(classString);
    }
  }

  console.log(`Found ${allClasses.size} unique class combinations`);

  // Compile each class combination
  const cache = {};
  let compiled = 0;

  for (const classString of allClasses) {
    try {
      const candidates = classString.split(/\s+/).filter(Boolean);
      if (candidates.length === 0) continue;

      const css = optimizeCss(build(candidates));
      const jss = convertFromCssToJss(classString, css);
      cache[classString] = jss;
      compiled++;
    } catch (e) {
      // Skip invalid classes
      console.warn(`  Skipping: ${classString.slice(0, 50)}...`);
    }
  }

  console.log(`Compiled ${compiled} class combinations`);

  // Write cache file
  const cachePath = path.join(__dirname, '.tw-cache.json');
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  console.log(`Cache written to ${cachePath}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
