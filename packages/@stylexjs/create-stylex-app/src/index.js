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
const prompts = require('prompts');
const fs = require('fs-extra');
const path = require('path');
const ansis = require('ansis');
const { TEMPLATES } = require('./templates');
const { copyDirectory } = require('./utils/files');
const {
  detectPackageManager,
  installDependencies,
} = require('./utils/packages');
const { logger } = require('./utils/logger');
const { showSuccessScreen } = require('./utils/success');
const { StylexSpinner } = require('./utils/spinner');
const { errors } = require('./utils/errors');

const primary = '#5B45DE';
const secondary = '#D573DD';

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function showWelcomeBanner() {
  console.log(
    ansis.hex(primary).bold(`
███████╗████████╗██╗   ██╗██╗     ███████╗${ansis.hex(secondary).bold('██╗  ██╗')}
██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝${ansis.hex(secondary).bold('╚██╗██╔╝')}
███████╗   ██║    ╚████╔╝ ██║     █████╗  ${ansis.hex(secondary).bold(' ╚███╔╝ ')}
╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝  ${ansis.hex(secondary).bold(' ██╔██╗ ')}
███████║   ██║      ██║   ███████╗███████╗${ansis.hex(secondary).bold('██╔╝ ██╗')}
╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝${ansis.hex(secondary).bold('╚═╝  ╚═╝')}
`),
  );
  console.log(ansis.hex(secondary).bold('  Create StyleX App\n'));
}

async function main() {
  try {
    // Show welcome banner
    showWelcomeBanner();
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

    // Step tracking
    const totalSteps = argv.install ? 6 : 5;
    let currentStep = 0;

    // Helper function for step tracking
    const nextStep = (msg) => {
      currentStep++;
      logger.step(currentStep, totalSteps, msg);
    };

    // Step 1: Validate project name
    nextStep('Validating project name...');

    if (!projectName) {
      errors.invalidProjectName('').display();
      process.exit(1);
    }

    // Validate project name (npm package name rules)
    const validNameRegex = /^[a-z0-9-_]+$/;
    if (!validNameRegex.test(projectName)) {
      errors.invalidProjectName(projectName).display();
      process.exit(1);
    }

    logger.success(`Valid project name: ${logger.code(projectName)}`);

    // Step 2: Check directory availability
    nextStep('Checking directory availability...');
    const targetDir = path.resolve(process.cwd(), projectName);

    if (await fs.pathExists(targetDir)) {
      errors.directoryExists(projectName).display();
      process.exit(1);
    }

    logger.success('Directory available');

    // Step 3: Create directory and select template
    nextStep('Creating project directory...');
    await fs.ensureDir(targetDir);
    logger.success('Created directory');

    // Select template
    let templateId = argv.framework;

    if (!templateId) {
      const response = await prompts({
        type: 'select',
        name: 'framework',
        message: 'Select a framework',
        choices: TEMPLATES.map((t) => {
          const badges = t.features
            .map((f) => ansis.dim.hex(secondary)(`[${f}]`))
            .join(' ');

          return {
            title: t.name + (t.recommended ? ansis.hex(secondary)(' ⭐') : ''),
            description: `${ansis.dim(t.description)}\n    ${badges}`,
            value: t.id,
          };
        }),
        hint: 'Use arrow keys to navigate',
      });

      templateId = response.framework;

      if (!templateId) {
        logger.error('Framework selection required');
        process.exit(1);
      }
    }

    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      errors.templateNotFound(templateId).display();
      process.exit(1);
    }

    logger.success(`Using template: ${template.name}`);

    // Step 4: Copy template files
    nextStep('Copying template files...');

    // Resolve example source directory
    const exampleDir = path.resolve(
      __dirname,
      '../../../../examples',
      template.exampleSource,
    );

    logger.info(`Example directory: ${logger.path(exampleDir)}`);

    // Verify it exists
    if (!(await fs.pathExists(exampleDir))) {
      logger.error(`Example directory not found: ${exampleDir}`);
      process.exit(1);
    }

    // Copy files from example
    const spinner = new StylexSpinner();
    spinner.start('Copying template files...');

    const filesToExclude = [
      ...template.excludeFiles,
      'package.json', // We'll generate this separately
      'README.md', // We'll generate this separately
    ];

    await copyDirectory(exampleDir, targetDir, filesToExclude);
    spinner.succeed('Template files copied');

    // Step 5: Generate configuration files
    nextStep('Generating configuration files...');

    // Read example package.json
    const examplePkgPath = path.join(exampleDir, 'package.json');
    const examplePkg = await fs.readJson(examplePkgPath);

    logger.success('Read example package.json');

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

    logger.success('Generated package.json');

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
    logger.success('Generated README.md');

    // Step 6: Install dependencies (if enabled)
    if (argv.install) {
      nextStep('Installing dependencies...');
      const pm = await detectPackageManager();
      const installSpinner = new StylexSpinner();
      installSpinner.start(`Installing dependencies with ${pm}...`);
      const startTime = Date.now();
      await installDependencies(targetDir, pm);
      const duration = Date.now() - startTime;
      installSpinner.succeed(
        `Dependencies installed ${ansis.dim(`(${formatDuration(duration)})`)}`,
      );
    } else {
      logger.info('Skipped dependency installation');
    }

    // Print success screen
    const pm = argv.install ? await detectPackageManager() : 'npm';
    showSuccessScreen(projectName, targetDir, template, pm, argv.install);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

main();
