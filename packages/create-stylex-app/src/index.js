#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs-extra');
const path = require('path');
const { TEMPLATES } = require('./templates');
const { copyDirectory } = require('./utils/files');
const {
  detectPackageManager,
  installDependencies,
} = require('./utils/packages');

async function main() {
  try {
    // Parse arguments
    const argv = await yargs(hideBin(process.argv))
      .command('$0 [project-name]', 'Create a new StyleX project')
      .positional('project-name', {
        describe: 'Name of the project',
        type: 'string',
      })
      .option('install', {
        describe: 'Install dependencies automatically',
        type: 'boolean',
        default: true,
      })
      .help()
      .parse();

    const projectName = argv.projectName;

    // Validate project name
    if (!projectName) {
      console.error('Error: Project name is required');
      process.exit(1);
    }

    // Validate project name (npm package name rules)
    const validNameRegex = /^[a-z0-9-_]+$/;
    if (!validNameRegex.test(projectName)) {
      console.error(
        'Error: Project name can only contain lowercase letters, numbers, hyphens, and underscores',
      );
      process.exit(1);
    }

    console.log('✓ Valid project name:', projectName);

    // Check if directory already exists
    const targetDir = path.resolve(process.cwd(), projectName);

    if (await fs.pathExists(targetDir)) {
      console.error(`Error: Directory "${projectName}" already exists`);
      process.exit(1);
    }

    console.log('✓ Directory available:', targetDir);

    // Create the target directory
    await fs.ensureDir(targetDir);
    console.log('✓ Created directory:', targetDir);

    // Use first template for now (vite-react)
    const template = TEMPLATES[0];
    console.log('✓ Using template:', template.name);

    // Resolve example source directory
    const exampleDir = path.resolve(
      __dirname,
      '../../../examples',
      template.exampleSource,
    );

    console.log('✓ Example directory:', exampleDir);

    // Verify it exists
    if (!(await fs.pathExists(exampleDir))) {
      throw new Error(`Example directory not found: ${exampleDir}`);
    }

    // Copy files from example
    console.log('Copying files from example...');

    const filesToExclude = [
      ...template.excludeFiles,
      'package.json', // We'll generate this separately
      'README.md', // We'll generate this separately
    ];

    await copyDirectory(exampleDir, targetDir, filesToExclude);
    console.log('✓ Files copied');

    // Read example package.json
    const examplePkgPath = path.join(exampleDir, 'package.json');
    const examplePkg = await fs.readJson(examplePkgPath);

    console.log('✓ Read example package.json');
    console.log(
      '  StyleX version:',
      examplePkg.dependencies['@stylexjs/stylex'],
    );

    // Generate new package.json
    // Filter out monorepo-only packages (like @stylexjs/shared-ui)
    const filterPrivateDeps = (deps) => {
      if (!deps) return deps;
      const filtered = { ...deps };
      // Remove @stylexjs/shared-ui - it's private to the monorepo
      delete filtered['@stylexjs/shared-ui'];
      return filtered;
    };

    // Normalize script names (remove "example:" prefix used in monorepo)
    const normalizeScripts = (scripts) => {
      if (!scripts) return scripts;
      const normalized = {};
      for (const [key, value] of Object.entries(scripts)) {
        // Remove "example:" prefix if present
        const normalizedKey = key.replace(/^example:/, '');
        normalized[normalizedKey] = value;
      }
      return normalized;
    };

    const newPkg = {
      name: projectName,
      version: '0.1.0',
      private: true,
      type: examplePkg.type,
      scripts: normalizeScripts(examplePkg.scripts),
      dependencies: filterPrivateDeps(examplePkg.dependencies),
      devDependencies: filterPrivateDeps(examplePkg.devDependencies),
    };

    await fs.writeJson(path.join(targetDir, 'package.json'), newPkg, {
      spaces: 2,
    });

    console.log('✓ Generated package.json');

    // Generate minimal README.md
    const readme = `# ${projectName}

A new StyleX project created with create-stylex-app.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Template

This project uses the **${template.name}** template.
`;

    await fs.writeFile(path.join(targetDir, 'README.md'), readme);
    console.log('✓ Generated README.md');

    // Install dependencies unless --no-install flag is set
    if (argv.install) {
      const pm = await detectPackageManager();
      await installDependencies(targetDir, pm);
      console.log('✓ Dependencies installed');
    } else {
      console.log('⊘ Skipped dependency installation');
    }

    // Print success message
    console.log('\n✨ Success! Created', projectName, 'at', targetDir);
    console.log('\nNext steps:');
    console.log('  cd', projectName);

    if (!argv.install) {
      console.log('  npm install');
    }

    console.log('  npm run dev');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
