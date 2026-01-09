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
const pc = require('picocolors');
const p = require('@clack/prompts');
const { TEMPLATES } = require('./templates');
const { copyDirectory } = require('./utils/files');
const {
  detectPackageManager,
  installDependencies,
} = require('./utils/packages');

async function main() {
  // Show intro
  p.intro(pc.bgMagenta(pc.white(' create-stylex-app ')));

  // Parse arguments
  const argv = await yargs(hideBin(process.argv))
    .command('$0 [project-name]', 'Create a new StyleX project')
    .positional('project-name', {
      describe: 'Name of the project',
      type: 'string',
    })
    .option('framework', {
      alias: 'f',
      describe: 'Framework to use',
      type: 'string',
      choices: ['nextjs', 'vite-react', 'vite'],
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
    p.cancel(
      'Project name is required. Usage: npx create-stylex-app <project-name>',
    );
    process.exit(1);
  }

  // Validate project name format (npm package name rules)
  const validNameRegex = /^[a-z0-9-_]+$/;
  if (!validNameRegex.test(projectName)) {
    p.cancel(
      `Invalid project name: "${projectName}"\n` +
        '   Project names can only contain lowercase letters, numbers, hyphens, and underscores.',
    );
    process.exit(1);
  }

  p.log.success(`Project name: ${pc.cyan(projectName)}`);

  // Check directory availability
  const targetDir = path.resolve(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    p.cancel(
      `Directory "${projectName}" already exists.\n` +
        '   Choose a different name or remove the existing directory.',
    );
    process.exit(1);
  }

  p.log.success('Directory available');

  // Select template
  let templateId = argv.framework;

  if (!templateId) {
    templateId = await p.select({
      message: 'Select a framework',
      options: TEMPLATES.map((t) => ({
        value: t.id,
        label: t.name + (t.recommended ? pc.yellow(' (recommended)') : ''),
        hint: t.description,
      })),
    });

    if (p.isCancel(templateId)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    p.cancel(
      `Template "${templateId}" not found.\n` +
        '   Available templates: nextjs, vite-react, vite',
    );
    process.exit(1);
  }

  p.log.success(`Template: ${template.name}`);

  // Create directory
  await fs.ensureDir(targetDir);

  // Resolve example source directory
  const exampleDir = path.resolve(
    __dirname,
    '../../../../examples',
    template.exampleSource,
  );

  // Verify it exists
  if (!(await fs.pathExists(exampleDir))) {
    p.cancel(`Example directory not found: ${exampleDir}`);
    process.exit(1);
  }

  // Copy template files
  const copySpinner = p.spinner();
  copySpinner.start('Copying template files...');

  const filesToExclude = [
    ...template.excludeFiles,
    'package.json', // We'll generate this separately
    'README.md', // We'll generate this separately
  ];

  await copyDirectory(exampleDir, targetDir, filesToExclude);
  copySpinner.stop('Template files copied');

  // Generate configuration files
  const configSpinner = p.spinner();
  configSpinner.start('Generating configuration files...');

  // Read example package.json
  const examplePkgPath = path.join(exampleDir, 'package.json');
  const examplePkg = await fs.readJson(examplePkgPath);

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
  configSpinner.stop('Configuration files generated');

  // Install dependencies (if enabled)
  const pm = await detectPackageManager();

  if (argv.install) {
    const installSpinner = p.spinner({ indicator: 'timer' });
    installSpinner.start(`Installing dependencies with ${pm}...`);

    try {
      await installDependencies(targetDir, pm);
      installSpinner.stop('Dependencies installed');
    } catch (error) {
      installSpinner.stop('Installation failed');
      p.log.error(error.message);
      p.log.warn(
        `You can install dependencies manually: cd ${projectName} && ${pm} install`,
      );
    }
  } else {
    p.log.info('Skipped dependency installation (--no-install)');
  }

  // Success message with next steps
  const nextSteps = [
    `cd ${projectName}`,
    ...(argv.install ? [] : [`${pm} install`]),
    `${pm} run dev`,
  ].join('\n');

  p.note(nextSteps, 'Next steps');

  p.outro(`${pc.green('Done!')} Happy coding with StyleX`);
}

main().catch((error) => {
  p.cancel(error.message);
  process.exit(1);
});
