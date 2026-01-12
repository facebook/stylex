#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const pc = require('picocolors');
const p = require('@clack/prompts');
const { getTemplates, getBundledTemplates } = require('./templates');

// StyleX brand colors
const PRIMARY = '#5B45DE';
const SECONDARY = '#D573DD';

// Simple hex color support for terminals that support it
const hex = (color) => (text) =>
  `\x1b[38;2;${parseInt(color.slice(1, 3), 16)};${parseInt(color.slice(3, 5), 16)};${parseInt(color.slice(5, 7), 16)}m${text}\x1b[0m`;

function showWelcomeBanner() {
  const primary = hex(PRIMARY);
  const secondary = hex(SECONDARY);
  console.log(
    primary(`
███████╗████████╗██╗   ██╗██╗     ███████╗`) +
      secondary('██╗  ██╗') +
      `
` +
      primary('██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝') +
      secondary('╚██╗██╔╝') +
      `
` +
      primary('███████╗   ██║    ╚████╔╝ ██║     █████╗  ') +
      secondary(' ╚███╔╝ ') +
      `
` +
      primary('╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝  ') +
      secondary(' ██╔██╗ ') +
      `
` +
      primary('███████║   ██║      ██║   ███████╗███████╗') +
      secondary('██╔╝ ██╗') +
      `
` +
      primary('╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝') +
      secondary('╚═╝  ╚═╝'),
  );
  console.log(secondary('  Create StyleX App\n'));
}

const {
  fetchTemplate,
  fetchCustomTemplate,
} = require('./utils/fetch-template');
const {
  detectPackageManager,
  installDependencies,
} = require('./utils/packages');

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const result = {
    projectName: undefined,
    framework: undefined,
    template: undefined,
    install: true,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--no-install') {
      result.install = false;
    } else if (arg === '--framework' || arg === '-f') {
      result.framework = args[++i];
    } else if (arg === '--template' || arg === '-t') {
      result.template = args[++i];
    } else if (!arg.startsWith('-') && !result.projectName) {
      result.projectName = arg;
    }
  }

  return result;
}

function showHelp() {
  const templateIds = getBundledTemplates()
    .map((t) => t.id)
    .join(', ');
  console.log(`
${pc.bold('create-stylex-app')} - Create a new StyleX project

${pc.bold('Usage:')}
  npx create-stylex-app <project-name> [options]

${pc.bold('Options:')}
  -f, --framework <name>   Framework to use
  -t, --template <source>  Custom template (GitHub URL or github:owner/repo/path)
  --no-install             Skip dependency installation
  -h, --help               Show this help message

${pc.bold('Available frameworks:')}
  ${templateIds}

${pc.bold('Examples:')}
  npx create-stylex-app my-app
  npx create-stylex-app my-app --framework nextjs
  npx create-stylex-app my-app --template github:user/repo/template
`);
}

async function main() {
  const argv = parseArgs(process.argv.slice(2));

  if (argv.help) {
    showHelp();
    process.exit(0);
  }

  // Show welcome banner
  showWelcomeBanner();

  // Show intro
  p.intro(pc.bgMagenta(pc.white(' create-stylex-app ')));

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

  // Handle custom template
  if (argv.template) {
    await handleCustomTemplate(argv, projectName, targetDir);
    return;
  }

  // Get available templates
  const templatesSpinner = p.spinner();
  templatesSpinner.start('Fetching available templates...');
  const templates = await getTemplates();
  templatesSpinner.stop(`Found ${templates.length} templates`);

  // Select template
  let templateId = argv.framework;

  if (!templateId) {
    templateId = await p.select({
      message: 'Select a framework',
      options: templates.map((t) => ({
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

  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    p.cancel(
      `Template "${templateId}" not found.\n` +
        '   Available templates: ' +
        templates.map((t) => t.id).join(', '),
    );
    process.exit(1);
  }

  p.log.success(`Template: ${template.name}`);

  // Create directory
  await fs.ensureDir(targetDir);

  // Download template from GitHub
  const downloadSpinner = p.spinner();
  downloadSpinner.start('Downloading template from GitHub...');

  try {
    await fetchTemplate(template, targetDir);
    downloadSpinner.stop('Template downloaded');
  } catch (error) {
    downloadSpinner.stop('Download failed');
    await fs.remove(targetDir);
    p.cancel(`Failed to download template: ${error.message}`);
    process.exit(1);
  }

  // Read package.json from downloaded template before removing it
  const configSpinner = p.spinner();
  configSpinner.start('Generating configuration files...');

  try {
    const templatePkgPath = path.join(targetDir, 'package.json');
    const examplePkg = await fs.readJson(templatePkgPath);

    // Remove files we'll regenerate
    const filesToRemove = [
      'package.json',
      'README.md',
      ...template.excludeFiles,
    ];
    for (const file of filesToRemove) {
      const filePath = path.join(targetDir, file);
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    }

    // Filter out monorepo-only packages
    const filterPrivateDeps = (deps) => {
      if (!deps) return deps;
      const filtered = { ...deps };
      delete filtered['@stylexjs/shared-ui'];
      return filtered;
    };

    // Normalize script names
    const normalizeScripts = (scripts) => {
      if (!scripts) return scripts;
      const normalized = {};
      for (const [key, value] of Object.entries(scripts)) {
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

    // Determine the run command based on available scripts
    const scripts = newPkg.scripts || {};
    const runCommand = scripts.dev
      ? 'npm run dev'
      : scripts.build
        ? 'npm run build'
        : scripts.start
          ? 'npm run start'
          : 'npm run';

    // Generate minimal README.md
    const readme = `# ${projectName}

A new StyleX project created with create-stylex-app.

## Getting Started

\`\`\`bash
npm install
${runCommand}
\`\`\`

## Template

This project uses the **${template.name}** template.
`;

    await fs.writeFile(path.join(targetDir, 'README.md'), readme);
    configSpinner.stop('Configuration files generated');
  } catch (error) {
    configSpinner.stop('Configuration generation failed');
    await fs.remove(targetDir);
    p.cancel(`Failed to generate configuration: ${error.message}`);
    process.exit(1);
  }

  // Install dependencies
  await finishSetup(argv, projectName, targetDir);
}

/**
 * Handle custom template installation
 */
async function handleCustomTemplate(argv, projectName, targetDir) {
  p.log.info(`Using custom template: ${pc.cyan(argv.template)}`);

  // Create directory
  await fs.ensureDir(targetDir);

  // Download custom template
  const downloadSpinner = p.spinner();
  downloadSpinner.start('Downloading custom template...');

  try {
    await fetchCustomTemplate(argv.template, targetDir);
    downloadSpinner.stop('Template downloaded');
  } catch (error) {
    downloadSpinner.stop('Download failed');
    await fs.remove(targetDir);
    p.cancel(`Failed to download custom template: ${error.message}`);
    process.exit(1);
  }

  // Remove common excludes
  const excludePatterns = [
    'node_modules',
    '.next',
    'dist',
    '.vite',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
  ];
  for (const file of excludePatterns) {
    const filePath = path.join(targetDir, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  // Check if package.json exists
  const pkgPath = path.join(targetDir, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    // Update the name in package.json
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    p.log.success('Updated package.json with project name');
  } else {
    p.log.warn(
      'No package.json found in template. You may need to create one manually.',
    );
  }

  // Install dependencies
  await finishSetup(argv, projectName, targetDir);
}

/**
 * Common setup completion (install deps, show success message)
 */
async function finishSetup(argv, projectName, targetDir) {
  const pm = await detectPackageManager();

  // Read package.json to determine available scripts
  let runScript = 'dev';
  const pkgPath = path.join(targetDir, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    const scripts = pkg.scripts || {};
    if (scripts.dev) {
      runScript = 'dev';
    } else if (scripts.build) {
      runScript = 'build';
    } else if (scripts.start) {
      runScript = 'start';
    }
  }

  if (argv.install) {
    const installSpinner = p.spinner({ indicator: 'timer' });
    installSpinner.start(`Installing dependencies with ${pm}...`);

    try {
      const result = await installDependencies(targetDir, pm);
      const countMsg = result.packageCount
        ? ` (${result.packageCount} packages)`
        : '';
      installSpinner.stop(`Dependencies installed${countMsg}`);
    } catch (error) {
      installSpinner.stop('Installation failed');
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      p.log.error(errorMessage);
      // $FlowFixMe[prop-missing] - stderr is added by installDependencies
      if (error != null && typeof error === 'object' && error.stderr) {
        // $FlowFixMe[incompatible-use]
        p.log.error(error.stderr.trim());
      }
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
    `${pm} run ${runScript}`,
  ].join('\n');

  p.note(nextSteps, 'Next steps');

  p.outro(`${pc.green('Done!')} Happy coding with StyleX`);
}

main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  p.cancel(errorMessage);
  process.exit(1);
});
