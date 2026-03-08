/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('node:path');
const fs = require('node:fs');
const { createRequire } = require('node:module');

const DEFAULT_IMPORT_SOURCES = ['@stylexjs/stylex', 'stylex'];
const DEFAULT_IMPORT_SOURCE_PACKAGES = new Set(
  DEFAULT_IMPORT_SOURCES.map((source) => {
    if (source.startsWith('@')) {
      const [scope, name] = source.split('/');
      return scope != null && name != null ? `${scope}/${name}` : null;
    }
    const [packageName] = source.split('/');
    return packageName ?? null;
  }).filter(Boolean),
);
const DEFAULT_INCLUDE_GLOB = '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';

// Keep auto-discovery focused on source files.
// Explicit include values from users are always respected.
const AUTO_DISCOVERY_EXCLUDES = [
  'node_modules/**',
  '**/node_modules/**',
  '.git/**',
  '.next/**',
  '.nuxt/**',
  '.svelte-kit/**',
  '.turbo/**',
  '.cache/**',
  'dist/**',
  'build/**',
  'coverage/**',
  'tmp/**',
  'temp/**',
];

const BABEL_PLUGIN_STRING_NAME = '@stylexjs/babel-plugin';

function toArray(value) {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function dedupe(items) {
  return Array.from(new Set(items));
}

function readJSON(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function toPackageName(importSource) {
  const source =
    typeof importSource === 'string' ? importSource : importSource?.from;

  if (source == null || source.startsWith('.') || source.startsWith('/')) {
    return null;
  }

  if (source.startsWith('@')) {
    const [scope, name] = source.split('/');
    if (scope != null && name != null) {
      return `${scope}/${name}`;
    }
    return null;
  }

  const [packageName] = source.split('/');
  return packageName ?? null;
}

function hasStylexDependency(manifest, targetPackages) {
  if (manifest == null || typeof manifest !== 'object') {
    return false;
  }

  const dependencyFields = [
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
  ];

  return dependencyFields.some((field) => {
    const deps = manifest[field];
    if (deps == null || typeof deps !== 'object') {
      return false;
    }
    return Object.keys(deps).some((depName) => targetPackages.has(depName));
  });
}

function findDependencyManifestPathFromEntry(entryPath, dependencyName) {
  let dir = path.dirname(entryPath);

  for (;;) {
    const candidate = path.join(dir, 'package.json');
    const manifest = readJSON(candidate);
    if (manifest != null && manifest.name === dependencyName) {
      return candidate;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

function resolveDependencyManifestPath(requireFromRoot, dependencyName) {
  try {
    return requireFromRoot.resolve(`${dependencyName}/package.json`);
  } catch {}

  try {
    const entryPath = requireFromRoot.resolve(dependencyName);
    return findDependencyManifestPathFromEntry(entryPath, dependencyName);
  } catch {}

  return null;
}

function includePackageFromImportSource({
  importSource,
  cwd,
  requireFromRoot,
  discoveredDirectories,
}) {
  const source =
    typeof importSource === 'string' ? importSource : importSource?.from;
  if (typeof source !== 'string') {
    return;
  }
  if (source.startsWith('.') || source.startsWith('/')) {
    return;
  }

  const packageName = toPackageName(source);
  if (packageName == null) {
    return;
  }
  if (DEFAULT_IMPORT_SOURCE_PACKAGES.has(packageName)) {
    return;
  }

  const manifestPath = resolveDependencyManifestPath(
    requireFromRoot,
    packageName,
  );
  if (manifestPath == null) {
    return;
  }

  const directory = path.dirname(manifestPath);
  if (directory !== path.resolve(cwd)) {
    discoveredDirectories.add(directory);
  }
}

function getDirectDependencies(manifest) {
  if (manifest == null || typeof manifest !== 'object') {
    return [];
  }

  const dependencyFields = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ];

  const dependencies = new Set();
  for (const field of dependencyFields) {
    const deps = manifest[field];
    if (deps == null || typeof deps !== 'object') {
      continue;
    }
    for (const name of Object.keys(deps)) {
      dependencies.add(name);
    }
  }

  return Array.from(dependencies);
}

function toAbsoluteGlob(directory, globPattern) {
  const normalizedDir = path.resolve(directory).split(path.sep).join('/');
  return `${normalizedDir}/${globPattern}`;
}

function discoverStylexPackageDirectories({ cwd, importSources }) {
  const rootPackageJsonPath = path.join(path.resolve(cwd), 'package.json');
  if (!fs.existsSync(rootPackageJsonPath)) {
    return [];
  }

  const rootPackageDir = path.dirname(rootPackageJsonPath);
  const requireFromRoot = createRequire(rootPackageJsonPath);
  const rootManifest = readJSON(rootPackageJsonPath);
  const dependencyNames = getDirectDependencies(rootManifest);

  const targetPackages = new Set(
    importSources
      .map(toPackageName)
      .filter(Boolean)
      .concat(DEFAULT_IMPORT_SOURCES),
  );

  const discoveredDirectories = new Set();

  for (const dependencyName of dependencyNames) {
    const manifestPath = resolveDependencyManifestPath(
      requireFromRoot,
      dependencyName,
    );
    if (manifestPath == null) {
      continue;
    }

    const manifest = readJSON(manifestPath);
    if (!hasStylexDependency(manifest, targetPackages)) {
      continue;
    }

    const dependencyDir = path.dirname(manifestPath);
    // Avoid accidentally re-scanning the project root in monorepo edge cases.
    if (dependencyDir !== rootPackageDir) {
      discoveredDirectories.add(dependencyDir);
    }
  }

  for (const importSource of importSources) {
    includePackageFromImportSource({
      importSource,
      cwd,
      requireFromRoot,
      discoveredDirectories,
    });
  }

  return Array.from(discoveredDirectories);
}

function isStylexBabelPluginName(pluginRef) {
  if (typeof pluginRef === 'string') {
    if (pluginRef === BABEL_PLUGIN_STRING_NAME) {
      return true;
    }

    return /(^|[/\\])@stylexjs[/\\]babel-plugin([/\\]|$)/.test(pluginRef);
  }
  if (typeof pluginRef === 'function') {
    if (pluginRef.name === 'styleXTransform') {
      return true;
    }
    if (pluginRef.name === 'stylexPluginWithOptions') {
      return true;
    }
    if (typeof pluginRef.withOptions === 'function') {
      return pluginRef.withOptions.name === 'stylexPluginWithOptions';
    }
  }
  return false;
}

function inferImportSourcesFromBabelConfig(babelConfig) {
  const plugins = toArray(babelConfig?.plugins);

  for (const pluginEntry of plugins) {
    if (pluginEntry == null) {
      continue;
    }

    const pluginRef = Array.isArray(pluginEntry) ? pluginEntry[0] : pluginEntry;
    const pluginOptions = Array.isArray(pluginEntry) ? pluginEntry[1] : null;

    if (!isStylexBabelPluginName(pluginRef)) {
      continue;
    }

    const importSources = pluginOptions?.importSources;
    if (Array.isArray(importSources) && importSources.length > 0) {
      return importSources;
    }
  }

  return null;
}

function resolveImportSources({ importSources, babelConfig }) {
  if (Array.isArray(importSources)) {
    return importSources;
  }

  const inferredFromBabel = inferImportSourcesFromBabelConfig(babelConfig);
  if (Array.isArray(inferredFromBabel) && inferredFromBabel.length > 0) {
    return dedupe([...DEFAULT_IMPORT_SOURCES, ...inferredFromBabel]);
  }

  return DEFAULT_IMPORT_SOURCES;
}

function resolveInclude({ cwd, include, importSources }) {
  const normalizedInclude = toArray(include);
  const hasExplicitInclude = normalizedInclude.length > 0;

  if (hasExplicitInclude) {
    return dedupe(normalizedInclude);
  }

  const discoveredDependencyGlobs = discoverStylexPackageDirectories({
    cwd,
    importSources,
  }).map((dir) => toAbsoluteGlob(dir, DEFAULT_INCLUDE_GLOB));

  return dedupe([DEFAULT_INCLUDE_GLOB, ...discoveredDependencyGlobs]);
}

function resolveExclude({ include, exclude }) {
  const normalizedExclude = toArray(exclude);
  const hasExplicitInclude = toArray(include).length > 0;

  if (hasExplicitInclude) {
    return normalizedExclude;
  }

  return dedupe([...AUTO_DISCOVERY_EXCLUDES, ...normalizedExclude]);
}

module.exports = {
  AUTO_DISCOVERY_EXCLUDES,
  DEFAULT_IMPORT_SOURCES,
  DEFAULT_INCLUDE_GLOB,
  discoverStylexPackageDirectories,
  inferImportSourcesFromBabelConfig,
  resolveExclude,
  resolveImportSources,
  resolveInclude,
};
