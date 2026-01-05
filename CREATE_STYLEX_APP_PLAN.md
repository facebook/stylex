# create-stylex-app Implementation Plan

> **Focus**: Core functionality with extensible architecture for future enhancements
>
> **Version**: 0.7.0 | **Last Updated**: 2026-01-05 | **Scope**: MVP = Create-new projects only

---

## 📋 Task Progress Tracker

### Phase 1: Ultra-Minimal MVP (52 Steps)

**Part 1: Package Foundation (Steps 1-7)**
- [ ] Step 1: Create package directory structure
- [ ] Step 2: Create minimal package.json
- [ ] Step 3: Configure package.json for CLI
- [ ] Step 4: Add yargs dependency
- [ ] Step 5: Add ansis dependency
- [ ] Step 6: Add fs-extra dependency
- [ ] Step 7: Add TypeScript as dev dependency

**Part 2: TypeScript Setup (Steps 8-11)**
- [ ] Step 8: Create tsconfig.json
- [ ] Step 9: Add tsup for bundling
- [ ] Step 10: Create tsup.config.ts
- [ ] Step 11: Add build script to package.json

**Part 3: Minimal CLI (Steps 12-18)**
- [ ] Step 12: Create src/index.ts with shebang
- [ ] Step 13: Test the CLI locally
- [ ] Step 14: Add yargs argument parsing for project name
- [ ] Step 15: Add project name validation
- [ ] Step 16: Check if directory already exists
- [ ] Step 17: Create the target directory
- [ ] Step 18: Add basic error handling

**Part 4: Template System - Single Template (Steps 19-28)**
- [ ] Step 19: Create src/templates.ts with one template
- [ ] Step 20: Add hardcoded template selection (no prompts yet)
- [ ] Step 21: Resolve example source directory
- [ ] Step 22: Create src/utils/files.ts with copy utility
- [ ] Step 23: Copy files from example (excluding some)
- [ ] Step 24: Read example package.json
- [ ] Step 25: Generate new package.json
- [ ] Step 26: Generate minimal README.md
- [ ] Step 27: Print success message
- [ ] Step 28: Test end-to-end manually ⭐ **MILESTONE: First working template**

**Part 5: Add Dependency Installation (Steps 29-34)**
- [ ] Step 29: Add cross-spawn dependency
- [ ] Step 30: Create src/utils/packages.ts for package manager detection
- [ ] Step 31: Add install function
- [ ] Step 32: Add --no-install flag to skip installation
- [ ] Step 33: Call install function conditionally
- [ ] Step 34: Update success message based on install status

**Part 6: Add Template Selection (Steps 35-39)**
- [ ] Step 35: Add remaining templates to templates.ts
- [ ] Step 36: Add --template flag
- [ ] Step 37: Add prompts dependency
- [ ] Step 38: Add interactive template selection if not provided
- [ ] Step 39: Test all 3 templates manually ⭐ **MILESTONE: All templates working**

**Part 7: Add Feature Flags (Steps 40-48)**
- [ ] Step 40: Add --with-reset, --with-theme, --strict flags
- [ ] Step 41: Create src/features/reset.ts
- [ ] Step 42: Create src/features/theme.ts
- [ ] Step 43: Create src/features/strict.ts
- [ ] Step 44: Call feature functions based on flags
- [ ] Step 45: Test --with-reset flag
- [ ] Step 46: Test --with-theme flag
- [ ] Step 47: Test --strict flag
- [ ] Step 48: Test all flags together ⭐ **MILESTONE: All features working**

**Part 8: Polish & Documentation (Steps 49-52)**
- [ ] Step 49: Add color output with ansis
- [ ] Step 50: Add better error messages
- [ ] Step 51: Create packages/create-stylex-app/README.md
- [ ] Step 52: Final end-to-end test ⭐ **MILESTONE: Phase 1 Complete!**

---

## 📝 Session Notes & Findings

> **Workflow**: Complete task → Document findings → Proceed to next task
>
> This section tracks discoveries, issues, and decisions made during implementation.
> Each entry should include: Date, Step #, What was done, Findings/Issues, Next steps

### Session Log

**Format for entries:**
```
#### [Date] - Step X: [Step Name]
**Status**: ✅ Complete | ⚠️ In Progress | ❌ Blocked
**Findings**:
- Discovery/issue 1
- Discovery/issue 2
**Decisions Made**:
- Decision 1
- Decision 2
**Next**: Step Y - [Next step name]
---
```

### Active Session

*No sessions started yet. Begin with Step 1 when ready.*

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture Analysis](#architecture-analysis)
3. [Core Implementation](#core-implementation)
4. [Technical Stack](#technical-stack)
5. [Template System](#template-system)
6. [Extensibility Points](#extensibility-points)
7. [Implementation Steps](#implementation-steps)

---

## Overview

### Goal
Create a **lightweight, focused scaffolding CLI** that bootstraps StyleX projects with core features and a clean architecture for future expansion.

### Core Design Principle: Always Current

🎯 **Critical**: Generated projects must **always use the current StyleX version**

**How we achieve this**:
- Templates **reference** existing `/examples` (don't duplicate)
- Read `package.json` from examples at generation time
- Preserve exact versions from examples (which are already current)
- **Zero hardcoded versions** in create-stylex-app

**Result**: When StyleX releases v0.18.0, examples update to v0.18.0, and new projects automatically get v0.18.0. No changes needed to create-stylex-app!

### Command Signature
```bash
npx create-stylex-app [project-name] [options]
```

### Core Features (MVP)
- ✅ Interactive template selection
- ✅ Project scaffolding from existing examples
- ✅ Dependency installation
- ✅ Basic customization flags
- ✅ Clean, extensible architecture

### Scope: Create New Projects Only
**MVP Focus**: Bootstrapping **new** StyleX projects from official templates

**Future Consideration**: Adding StyleX to existing projects (similar to `panda init`) may be explored as a follow-up after the MVP is stable.

### Non-Goals (Deferred to Future)
- ❌ Add-to-existing functionality (`--add` flag)
- ❌ Complex theming system
- ❌ Multiple template variants
- ❌ Component generators

---

## Architecture Analysis

### Libraries Similar to StyleX (Zero-Runtime CSS-in-JS)

**StyleX's Peers** (Compile-time, atomic CSS):

1. **Panda CSS** (Modern, Type-safe)
   - CLI: `panda init` - Interactive setup wizard
   - Adds to existing projects (not create-new)
   - Generates config file + postCSS setup
   - Strategy: **Augment existing projects**

2. **Vanilla Extract** (CSS Modules alternative)
   - No official scaffolding tool
   - Integration guides for Vite, Next.js, etc.
   - Users manually add to existing projects
   - Strategy: **Documentation-driven setup**

3. **Linaria** (Zero-runtime CSS-in-JS)
   - No official create tool
   - Webpack/Vite plugin setup
   - Manual integration only
   - Strategy: **Plugin-based integration**

4. **Compiled** (by Atlassian)
   - No scaffolding tool
   - Integration via babel plugin
   - Used internally at Atlassian
   - Strategy: **Internal tooling**

**Key Insight**: Most zero-runtime CSS-in-JS libraries expect users to **add to existing projects**, not create new ones. StyleX's MVP focuses on **create-new** (filling a gap), with **add-to-existing** potentially explored as a follow-up.

### Comparison of Popular Scaffolding Tools

**create-vite** (Lightweight, Modern):
```json
{
  "dependencies": {
    "@clack/prompts": "^0.11.0",      // Modern interactive prompts
    "cross-spawn": "^7.0.6",           // Cross-platform spawning
    "mri": "^1.2.0",                   // Minimal arg parser (100 LOC)
    "picocolors": "^1.1.1"             // Tiny colors library
  }
}
```

**create-react-app**:
```json
{
  "dependencies": {
    "commander": "^...",               // Arg parsing
    "chalk": "^...",                   // Colors
    "prompts": "^...",                 // Simple prompts library
    "cross-spawn": "^...",             // Process spawning
    "fs-extra": "^..."                 // Enhanced fs
  }
}
```

**@angular/cli**:
```json
{
  "dependencies": {
    "yargs": "^...",                   // Arg parsing
    "@inquirer/prompts": "^...",       // Inquirer prompts
    "listr2": "^..."                   // Task lists
  }
}
```

**Panda CSS** (Most similar to StyleX):
```bash
# Their approach
panda init                # Adds Panda to existing project
panda codegen             # Generates styled-system

# No "create-panda-app"
# Users start with create-next-app, then run panda init
```

**StyleX CLI** (Existing - `/packages/@stylexjs/cli`):
```json
{
  "bin": { "stylex": "./lib/index.js" },
  "dependencies": {
    "yargs": "^18.0.0",                // ✅ Full-featured arg parser
    "ansis": "^3.3.2",                 // ✅ Color library
    "json5": "^2.2.3",                 // ✅ Config parsing
    "mkdirp": "^3.0.1"                 // ✅ Directory creation
  }
}
```

**Decision**: **Align with StyleX's existing architecture** for consistency across the monorepo. Focus MVP on create-new functionality (similar to create-vite, create-react-app).

---

## Core Implementation

### Minimum Viable Product (MVP)

**Core Capabilities**:
1. Template selection (interactive or via flag)
2. File scaffolding with variable substitution
3. Dependency installation
4. Basic feature flags (--with-reset, --with-theme, --strict)

**Starting Templates** (3 total):
- ✅ `nextjs` - Next.js App Router (most popular)
- ✅ `vite-react` - Vite + React + TypeScript
- ✅ `vite` - Vite vanilla (non-React)

---

## Technical Stack

### Dependencies (Aligned with StyleX CLI)

```json
{
  "name": "create-stylex-app",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "create-stylex-app": "dist/index.js"
  },
  "dependencies": {
    "yargs": "^18.0.0",              // ✅ Already in StyleX CLI & monorepo
    "ansis": "^3.3.2",               // ✅ Already in StyleX CLI
    "prompts": "^2.4.2",             // Interactive CLI prompts (simple, battle-tested)
    "cross-spawn": "^7.0.6",         // Cross-platform spawning (industry standard)
    "fs-extra": "^11.2.0"            // Enhanced fs utilities
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/node": "^20.0.0",
    "@types/prompts": "^2.4.9",
    "@types/fs-extra": "^11.0.4",
    "@types/cross-spawn": "^6.0.6",
    "tsup": "^8.0.0"                 // Fast TS bundler
  }
}
```

**Why these choices?**

✅ **Alignment with existing StyleX architecture**:
- **yargs**: Same arg parser as StyleX CLI - already in monorepo
- **ansis**: Same color library as StyleX CLI - already in monorepo
- **TypeScript**: Matches StyleX's TypeScript usage

✅ **Industry standards**:
- **cross-spawn**: Used by create-vite, create-react-app, and virtually all scaffolding tools
- **prompts**: Simple, battle-tested (1M+ weekly downloads), used by create-react-app
- **fs-extra**: Enhanced file system utilities (mkdir -p, copy, etc.)

✅ **Benefits**:
- Consistent developer experience across StyleX tools
- Leverage existing monorepo dependencies (reduces bundle size)
- Familiar patterns for StyleX contributors
- Production-proven libraries

### Alternative Considered: @clack/prompts

While `@clack/prompts` offers a more modern UI (used by create-vite 8.x), we chose `prompts` because:
- StyleX values consistency over bleeding-edge DX
- `prompts` is simpler and more stable
- Can upgrade to @clack later without breaking changes (same API surface)

### Package Structure
```
packages/create-stylex-app/
├── package.json
├── README.md
├── tsconfig.json
├── src/
│   ├── index.ts                 # Main entry point & CLI
│   ├── templates.ts             # Template configs (reference examples)
│   ├── scaffold.ts              # Core scaffolding logic
│   ├── features/
│   │   ├── reset.ts             # CSS reset feature
│   │   ├── theme.ts             # Theme tokens feature
│   │   └── strict.ts            # Strict mode feature
│   └── utils/
│       ├── files.ts             # File operations (copy from examples)
│       ├── packages.ts          # Package manager utils
│       └── validation.ts        # Input validation
└── [NO templates/ directory]   # Read from ../examples at runtime
```

**Key Simplification**: No duplicate template files needed!

---

## How Template Generation Works

### Scaffolding Flow

```typescript
async function scaffold(options: ScaffoldOptions) {
  // 1. Get template config
  const template = getTemplate(options.template); // { exampleSource: 'example-nextjs' }

  // 2. Resolve example directory
  const exampleDir = path.join(__dirname, '../../examples', template.exampleSource);

  // 3. Read example package.json (already has current StyleX versions!)
  const examplePkg = JSON.parse(
    fs.readFileSync(path.join(exampleDir, 'package.json'), 'utf-8')
  );

  // 4. Copy files from example (excluding build artifacts)
  await copyDirectory(exampleDir, targetDir, {
    exclude: template.excludeFiles || [
      'node_modules',
      '.next',
      'dist',
      'package-lock.json',
      'yarn.lock',
      'README.md'  // Generate custom README
    ]
  });

  // 5. Generate custom package.json
  await writePackageJson(targetDir, {
    name: options.projectName,
    version: '0.1.0',
    private: true,
    scripts: examplePkg.scripts,
    dependencies: examplePkg.dependencies,      // ✅ Current StyleX versions!
    devDependencies: examplePkg.devDependencies // ✅ Current StyleX versions!
  });

  // 6. Apply feature flags (--with-reset, --with-theme, --strict)
  if (options.withReset) await addResetCSS(targetDir);
  if (options.withTheme) await addThemeTokens(targetDir);
  if (options.strict) await addStrictConfig(targetDir);

  // 7. Generate custom README
  await generateREADME(targetDir, template, options);
}
```

### Benefits of This Approach

1. ✅ **Zero maintenance** - No hardcoded versions to update
2. ✅ **Always current** - Uses whatever version examples use
3. ✅ **Single source of truth** - Examples are already tested and maintained
4. ✅ **Smaller package** - No duplicate template files in npm package
5. ✅ **Consistency** - Users get exactly what's in examples

---

## Template System

### Template Source Strategy

**Recommendation**: **Read from existing `/examples` at runtime** for true single source of truth

```typescript
// At generation time, read from actual examples
async function generateFromExample(
  templateId: string,
  projectName: string
) {
  const examplePath = path.join(__dirname, '../../examples', `example-${templateId}`);

  // 1. Read package.json from example
  const examplePkg = JSON.parse(
    fs.readFileSync(path.join(examplePath, 'package.json'), 'utf-8')
  );

  // 2. Extract StyleX dependencies (they're already at current version)
  const stylexDeps = extractStyleXDependencies(examplePkg);

  // 3. Copy example files
  const filesToCopy = [
    'app/**/*',
    'components/**/*',
    'public/**/*',
    'next.config.js',
    'tsconfig.json',
    // ... etc
  ];

  await copyTemplateFiles(examplePath, targetPath, filesToCopy);

  // 4. Generate package.json with example's versions
  await generatePackageJson({
    name: projectName,
    dependencies: stylexDeps.dependencies,
    devDependencies: stylexDeps.devDependencies,
    scripts: examplePkg.scripts
  });
}
```

**Why this approach?**
1. ✅ **Single source of truth**: Examples are already maintained
2. ✅ **Auto-sync**: When examples update, scaffolding automatically uses new versions
3. ✅ **Less maintenance**: No duplicate template files to keep in sync
4. ✅ **Trust**: Users get exactly what's tested in examples

**Implementation Strategy**:
- Templates reference which example to use: `{ exampleSource: 'example-nextjs' }`
- At generation time, read from actual example directory
- Apply minimal transformations (project name, remove example-specific files)
- Preserve all configurations, dependencies, and versions from example

### Template Metadata Schema

```typescript
interface TemplateConfig {
  id: string;                      // 'nextjs', 'vite-react', 'vite'
  name: string;                    // Display name
  framework: string;               // 'Next.js', 'Vite'

  // Reference to existing example
  exampleSource: string;           // 'example-nextjs', 'example-vite-react', etc.

  // Files to exclude when copying from example
  excludeFiles?: string[];         // ['.next', 'node_modules', etc.]

  // Additional files to generate (for features like --with-reset)
  additionalFiles?: TemplateFile[];
}

interface TemplateFile {
  path: string;                    // Destination path
  content: string | (() => string); // File content or generator
}

// Example configuration
const templates: TemplateConfig[] = [
  {
    id: 'nextjs',
    name: 'Next.js (App Router + TypeScript)',
    framework: 'Next.js',
    exampleSource: 'example-nextjs',
    excludeFiles: [
      '.next',
      'node_modules',
      'README.md',              // Generate custom README
      'package-lock.json',
      'yarn.lock'
    ]
  },
  {
    id: 'vite-react',
    name: 'Vite + React (TypeScript)',
    framework: 'Vite',
    exampleSource: 'example-vite-react',
    excludeFiles: [
      'dist',
      'node_modules',
      'README.md'
    ]
  }
];
```

**Key Changes**:
1. ✅ Templates now **reference** examples instead of duplicating files
2. ✅ StyleX versions automatically stay current (from examples)
3. ✅ No hardcoded versions in create-stylex-app
4. ✅ Minimal maintenance - examples are the source of truth

### Variable Substitution

Minimal transformations needed when copying from examples:
- `{{projectName}}` - Project directory name (only in generated package.json and README)
- Keep all other files exactly as they are in examples

**Files that need transformation**:
- `package.json` - Generate new one with user's project name
- `README.md` - Generate custom README with setup instructions
- `.gitignore` - Copy from example (rename from `_gitignore` if needed)

**Files copied as-is**:
- All source code (`app/`, `src/`, `components/`, etc.)
- Configuration files (`next.config.js`, `vite.config.ts`, `tsconfig.json`, etc.)
- Public assets

---

## Extensibility Points

**Design Principle**: Build simple, extend easily

### 1. Feature Plugin System

```typescript
interface Feature {
  id: string;
  name: string;
  description: string;
  flag: string;                    // CLI flag name
  apply: (ctx: ScaffoldContext) => Promise<void>;
}

// Example: Reset CSS feature
const resetFeature: Feature = {
  id: 'reset',
  name: 'CSS Reset',
  description: 'Include modern CSS reset',
  flag: 'with-reset',
  apply: async (ctx) => {
    await ctx.addFile('src/reset.css', getResetContent());
    await ctx.updateFile('src/index.css', addImport('reset.css'));
  }
};
```

**Benefits**:
- Easy to add new features
- Can be disabled/enabled per template
- Testable in isolation

### 2. Template Registry

```typescript
// templates.ts
export const templates = new Map<string, TemplateConfig>([
  ['nextjs', nextjsTemplate],
  ['vite-react', viteReactTemplate],
  ['vite', viteTemplate],
]);

// Future: Load from external registry
export async function loadTemplates(): Promise<Map<string, TemplateConfig>> {
  const builtIn = templates;
  // const community = await fetchCommunityTemplates();
  // return new Map([...builtIn, ...community]);
  return builtIn;
}
```

### 3. Hook System (Future)

```typescript
interface Hooks {
  beforeScaffold?: (ctx: ScaffoldContext) => Promise<void>;
  afterScaffold?: (ctx: ScaffoldContext) => Promise<void>;
  beforeInstall?: (ctx: ScaffoldContext) => Promise<void>;
  afterInstall?: (ctx: ScaffoldContext) => Promise<void>;
}

// Example: Custom post-generation step
const hooks: Hooks = {
  afterScaffold: async (ctx) => {
    // Generate additional config files
    // Run code generation
    // Custom setup steps
  }
};
```

---

## Implementation Steps

> **Philosophy**: Each step is small, testable, and builds on the previous step. Every step should be completable in 15-30 minutes.

---

### Phase 1: Ultra-Minimal MVP (Create New Projects Only)

**Goal**: Get a working `npx create-stylex-app my-app` that scaffolds from one template

---

#### Part 1: Package Foundation (Steps 1-7)

**Step 1**: Create package directory structure
```bash
mkdir -p packages/create-stylex-app/src
```
✅ **Done when**: Directory exists at `/packages/create-stylex-app/src`

---

**Step 2**: Create minimal package.json
```bash
cd packages/create-stylex-app
npm init -y
```
✅ **Done when**: `package.json` exists with default fields

---

**Step 3**: Configure package.json for CLI
- Set `"type": "module"` for ESM
- Add `"bin": { "create-stylex-app": "dist/index.js" }`
- Set `"private": true` (will publish later)
- Add `"files": ["dist"]`

✅ **Done when**: package.json has correct bin entry and type

---

**Step 4**: Add yargs dependency (same as StyleX CLI)
```bash
npm install yargs@^18.0.0
```
✅ **Done when**: yargs appears in dependencies

---

**Step 5**: Add ansis dependency (same as StyleX CLI)
```bash
npm install ansis@^3.3.2
```
✅ **Done when**: ansis appears in dependencies

---

**Step 6**: Add fs-extra dependency
```bash
npm install fs-extra@^11.2.0
```
✅ **Done when**: fs-extra appears in dependencies

---

**Step 7**: Add TypeScript as dev dependency
```bash
npm install -D typescript@^5.9.3 @types/node@^20.0.0 @types/fs-extra@^11.0.4
```
✅ **Done when**: All type packages in devDependencies

---

#### Part 2: TypeScript Setup (Steps 8-10)

**Step 8**: Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```
✅ **Done when**: `tsc` runs without errors

---

**Step 9**: Add tsup for bundling
```bash
npm install -D tsup@^8.0.0
```
✅ **Done when**: tsup in devDependencies

---

**Step 10**: Create tsup.config.ts
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  shims: true
});
```
✅ **Done when**: Config file created

---

**Step 11**: Add build script to package.json
```json
{
  "scripts": {
    "build": "tsup"
  }
}
```
✅ **Done when**: `npm run build` runs (will fail until we create index.ts)

---

#### Part 3: Minimal CLI (Steps 12-18)

**Step 12**: Create src/index.ts with shebang
```typescript
#!/usr/bin/env node

console.log('create-stylex-app starting...');
```
✅ **Done when**: File exists and logs message

---

**Step 13**: Test the CLI locally
```bash
npm run build
chmod +x dist/index.js
node dist/index.js
```
✅ **Done when**: Sees "create-stylex-app starting..." message

---

**Step 14**: Add yargs argument parsing for project name
```typescript
#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = await yargs(hideBin(process.argv))
  .command('$0 [project-name]', 'Create a new StyleX project')
  .positional('project-name', {
    describe: 'Name of the project',
    type: 'string'
  })
  .help()
  .parse();

console.log('Project name:', argv.projectName);
```
✅ **Done when**: `node dist/index.js my-app` prints "Project name: my-app"

---

**Step 15**: Add project name validation
```typescript
// After parsing argv

const projectName = argv.projectName;

if (!projectName) {
  console.error('Error: Project name is required');
  process.exit(1);
}

// Validate project name (npm package name rules)
const validNameRegex = /^[a-z0-9-_]+$/;
if (!validNameRegex.test(projectName)) {
  console.error('Error: Project name can only contain lowercase letters, numbers, hyphens, and underscores');
  process.exit(1);
}

console.log('✓ Valid project name:', projectName);
```
✅ **Done when**: Invalid names are rejected, valid names pass

---

**Step 16**: Check if directory already exists
```typescript
import fs from 'fs-extra';
import path from 'path';

const targetDir = path.resolve(process.cwd(), projectName);

if (await fs.pathExists(targetDir)) {
  console.error(`Error: Directory "${projectName}" already exists`);
  process.exit(1);
}

console.log('✓ Directory available:', targetDir);
```
✅ **Done when**: Existing directories are detected and rejected

---

**Step 17**: Create the target directory
```typescript
await fs.ensureDir(targetDir);
console.log('✓ Created directory:', targetDir);
```
✅ **Done when**: Directory is created successfully

---

**Step 18**: Add basic error handling
```typescript
#!/usr/bin/env node

async function main() {
  try {
    // ... all previous code here
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```
✅ **Done when**: Errors are caught and displayed nicely

---

#### Part 4: Template System - Single Template Only (Steps 19-28)

**Step 19**: Create src/templates.ts with one template
```typescript
export interface TemplateConfig {
  id: string;
  name: string;
  exampleSource: string;  // Which example to copy from
  excludeFiles: string[];
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'vite-react',
    name: 'Vite + React (TypeScript)',
    exampleSource: 'example-vite-react',
    excludeFiles: ['node_modules', 'dist', '.vite', 'package-lock.json', 'yarn.lock']
  }
];
```
✅ **Done when**: Template config exports successfully

---

**Step 20**: Add hardcoded template selection (no prompts yet)
```typescript
// In src/index.ts
import { TEMPLATES } from './templates.js';

const template = TEMPLATES[0]; // Use vite-react for now
console.log('✓ Using template:', template.name);
```
✅ **Done when**: Template is selected

---

**Step 21**: Resolve example source directory
```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Go up from dist/ to packages/create-stylex-app, then to examples/
const exampleDir = path.resolve(__dirname, '../../..', 'examples', template.exampleSource);

console.log('✓ Example directory:', exampleDir);

// Verify it exists
if (!await fs.pathExists(exampleDir)) {
  throw new Error(`Example directory not found: ${exampleDir}`);
}
```
✅ **Done when**: Example directory is found and verified

---

**Step 22**: Create src/utils/files.ts with copy utility
```typescript
import fs from 'fs-extra';
import path from 'path';

export async function copyDirectory(
  source: string,
  target: string,
  excludePatterns: string[]
): Promise<void> {
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    // Skip excluded files/directories
    if (excludePatterns.includes(entry.name)) {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyDirectory(sourcePath, targetPath, excludePatterns);
    } else {
      await fs.copy(sourcePath, targetPath);
    }
  }
}
```
✅ **Done when**: Function compiles and exports

---

**Step 23**: Copy files from example (excluding some)
```typescript
// In src/index.ts
import { copyDirectory } from './utils/files.js';

console.log('Copying files from example...');

const filesToExclude = [
  ...template.excludeFiles,
  'package.json',  // We'll generate this separately
  'README.md'      // We'll generate this separately
];

await copyDirectory(exampleDir, targetDir, filesToExclude);

console.log('✓ Files copied');
```
✅ **Done when**: Example files are copied (except package.json and README)

---

**Step 24**: Read example package.json
```typescript
const examplePkgPath = path.join(exampleDir, 'package.json');
const examplePkg = await fs.readJson(examplePkgPath);

console.log('✓ Read example package.json');
console.log('  StyleX version:', examplePkg.dependencies['@stylexjs/stylex']);
```
✅ **Done when**: Example package.json is read and StyleX version is logged

---

**Step 25**: Generate new package.json
```typescript
const newPkg = {
  name: projectName,
  version: '0.1.0',
  private: true,
  type: examplePkg.type,
  scripts: examplePkg.scripts,
  dependencies: examplePkg.dependencies,
  devDependencies: examplePkg.devDependencies
};

await fs.writeJson(
  path.join(targetDir, 'package.json'),
  newPkg,
  { spaces: 2 }
);

console.log('✓ Generated package.json');
```
✅ **Done when**: New package.json is created with current StyleX versions

---

**Step 26**: Generate minimal README.md
```typescript
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
```
✅ **Done when**: README.md is created

---

**Step 27**: Print success message
```typescript
console.log('\n✨ Success! Created', projectName, 'at', targetDir);
console.log('\nNext steps:');
console.log('  cd', projectName);
console.log('  npm install');
console.log('  npm run dev');
```
✅ **Done when**: Success message is displayed

---

**Step 28**: Test end-to-end manually
```bash
npm run build
node dist/index.js test-app
cd test-app
npm install
npm run dev
```
✅ **Done when**:
- Project is created
- Files are copied correctly
- package.json has current StyleX version
- Dev server starts successfully

---

#### Part 5: Add Dependency Installation (Steps 29-34)

**Step 29**: Add cross-spawn dependency
```bash
npm install cross-spawn@^7.0.6
npm install -D @types/cross-spawn@^6.0.6
```
✅ **Done when**: cross-spawn in dependencies

---

**Step 30**: Create src/utils/packages.ts for package manager detection
```typescript
import fs from 'fs-extra';
import path from 'path';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export async function detectPackageManager(): Promise<PackageManager> {
  // Check lock files in current directory
  if (await fs.pathExists('package-lock.json')) return 'npm';
  if (await fs.pathExists('yarn.lock')) return 'yarn';
  if (await fs.pathExists('pnpm-lock.yaml')) return 'pnpm';

  // Default to npm
  return 'npm';
}
```
✅ **Done when**: Function exports and compiles

---

**Step 31**: Add install function
```typescript
import spawn from 'cross-spawn';

export async function installDependencies(
  targetDir: string,
  packageManager: PackageManager
): Promise<void> {
  console.log(`\nInstalling dependencies with ${packageManager}...`);

  const result = spawn.sync(packageManager, ['install'], {
    cwd: targetDir,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(`${packageManager} install failed`);
  }
}
```
✅ **Done when**: Function compiles

---

**Step 32**: Add --no-install flag to skip installation
```typescript
// In src/index.ts with yargs
const argv = await yargs(hideBin(process.argv))
  .command('$0 [project-name]', 'Create a new StyleX project')
  .positional('project-name', {
    describe: 'Name of the project',
    type: 'string'
  })
  .option('no-install', {
    describe: 'Skip dependency installation',
    type: 'boolean',
    default: false
  })
  .help()
  .parse();
```
✅ **Done when**: Flag is parsed correctly

---

**Step 33**: Call install function conditionally
```typescript
import { detectPackageManager, installDependencies } from './utils/packages.js';

// After files are copied and package.json is generated

if (!argv.noInstall) {
  const pm = await detectPackageManager();
  await installDependencies(targetDir, pm);
  console.log('✓ Dependencies installed');
} else {
  console.log('⊘ Skipped dependency installation');
}
```
✅ **Done when**: Dependencies install automatically unless --no-install is passed

---

**Step 34**: Update success message based on install status
```typescript
console.log('\n✨ Success! Created', projectName, 'at', targetDir);
console.log('\nNext steps:');
console.log('  cd', projectName);

if (argv.noInstall) {
  console.log('  npm install');
}

console.log('  npm run dev');
```
✅ **Done when**: Message adapts to whether install ran

---

#### Part 6: Add Template Selection (Steps 35-39)

**Step 35**: Add remaining templates to templates.ts
```typescript
export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'nextjs',
    name: 'Next.js (App Router + TypeScript)',
    exampleSource: 'example-nextjs',
    excludeFiles: ['node_modules', '.next', 'package-lock.json', 'yarn.lock']
  },
  {
    id: 'vite-react',
    name: 'Vite + React (TypeScript)',
    exampleSource: 'example-vite-react',
    excludeFiles: ['node_modules', 'dist', '.vite', 'package-lock.json', 'yarn.lock']
  },
  {
    id: 'vite',
    name: 'Vite (Vanilla TypeScript)',
    exampleSource: 'example-vite',
    excludeFiles: ['node_modules', 'dist', '.vite', 'package-lock.json', 'yarn.lock']
  }
];
```
✅ **Done when**: All 3 templates are defined

---

**Step 36**: Add --template flag
```typescript
const argv = await yargs(hideBin(process.argv))
  .command('$0 [project-name]', 'Create a new StyleX project')
  .positional('project-name', {
    describe: 'Name of the project',
    type: 'string'
  })
  .option('template', {
    alias: 't',
    describe: 'Template to use',
    type: 'string',
    choices: ['nextjs', 'vite-react', 'vite']
  })
  .option('no-install', {
    describe: 'Skip dependency installation',
    type: 'boolean',
    default: false
  })
  .help()
  .parse();
```
✅ **Done when**: --template flag is parsed with validation

---

**Step 37**: Add prompts dependency
```bash
npm install prompts@^2.4.2
npm install -D @types/prompts@^2.4.9
```
✅ **Done when**: prompts in dependencies

---

**Step 38**: Add interactive template selection if not provided
```typescript
import prompts from 'prompts';
import { TEMPLATES } from './templates.js';

let templateId = argv.template;

if (!templateId) {
  const response = await prompts({
    type: 'select',
    name: 'template',
    message: 'Select a template',
    choices: TEMPLATES.map(t => ({
      title: t.name,
      value: t.id
    }))
  });

  templateId = response.template;

  if (!templateId) {
    console.error('Error: Template selection required');
    process.exit(1);
  }
}

const template = TEMPLATES.find(t => t.id === templateId);
if (!template) {
  throw new Error(`Template not found: ${templateId}`);
}

console.log('✓ Using template:', template.name);
```
✅ **Done when**: User can select template interactively or via flag

---

**Step 39**: Test all 3 templates manually
```bash
npm run build

# Test each template
node dist/index.js test-nextjs --template nextjs
node dist/index.js test-vite-react --template vite-react
node dist/index.js test-vite --template vite

# Verify each one works
cd test-nextjs && npm install && npm run dev
```
✅ **Done when**: All 3 templates scaffold and run successfully

---

#### Part 7: Add Feature Flags (Steps 40-48)

**Step 40**: Add --with-reset, --with-theme, --strict flags
```typescript
const argv = await yargs(hideBin(process.argv))
  // ... previous options
  .option('with-reset', {
    describe: 'Include CSS reset file',
    type: 'boolean',
    default: false
  })
  .option('with-theme', {
    describe: 'Include theme tokens',
    type: 'boolean',
    default: false
  })
  .option('strict', {
    describe: 'Enable strict mode (ESLint + TypeScript)',
    type: 'boolean',
    default: false
  })
  .help()
  .parse();
```
✅ **Done when**: All flags are parsed

---

**Step 41**: Create src/features/reset.ts
```typescript
import fs from 'fs-extra';
import path from 'path';

const RESET_CSS = `/* Modern CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
`;

export async function addResetCSS(targetDir: string): Promise<void> {
  const resetPath = path.join(targetDir, 'src', 'reset.css');
  await fs.ensureDir(path.dirname(resetPath));
  await fs.writeFile(resetPath, RESET_CSS);
  console.log('✓ Added CSS reset');
}
```
✅ **Done when**: Reset CSS file is generated

---

**Step 42**: Create src/features/theme.ts
```typescript
import fs from 'fs-extra';
import path from 'path';

const THEME_TOKENS = `import * as stylex from '@stylexjs/stylex';

// Define theme tokens
export const colors = stylex.defineVars({
  primaryText: '#1a1a1a',
  secondaryText: '#666666',
  primaryBg: '#ffffff',
  secondaryBg: '#f5f5f5',
  accent: '#0066cc',
  border: '#e0e0e0',
});

export const spacing = stylex.defineVars({
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
});
`;

export async function addThemeTokens(targetDir: string): Promise<void> {
  const themePath = path.join(targetDir, 'src', 'theme.stylex.ts');
  await fs.ensureDir(path.dirname(themePath));
  await fs.writeFile(themePath, THEME_TOKENS);
  console.log('✓ Added theme tokens');
}
```
✅ **Done when**: Theme tokens file is generated

---

**Step 43**: Create src/features/strict.ts (ESLint only for now)
```typescript
import fs from 'fs-extra';
import path from 'path';

const ESLINT_CONFIG = {
  extends: [
    '@stylexjs/eslint-plugin/recommended'
  ],
  rules: {
    '@stylexjs/valid-styles': 'error'
  }
};

export async function addStrictConfig(targetDir: string): Promise<void> {
  // Add .eslintrc.json
  const eslintPath = path.join(targetDir, '.eslintrc.json');
  await fs.writeJson(eslintPath, ESLINT_CONFIG, { spaces: 2 });

  // Read existing package.json
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);

  // Add @stylexjs/eslint-plugin to devDependencies if not present
  if (!pkg.devDependencies?.['@stylexjs/eslint-plugin']) {
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies['@stylexjs/eslint-plugin'] = '0.17.4'; // Match example version
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  console.log('✓ Added strict ESLint config');
}
```
✅ **Done when**: ESLint config is added

---

**Step 44**: Call feature functions based on flags
```typescript
// In src/index.ts, after generating package.json and README

if (argv.withReset) {
  await addResetCSS(targetDir);
}

if (argv.withTheme) {
  await addThemeTokens(targetDir);
}

if (argv.strict) {
  await addStrictConfig(targetDir);
}
```
✅ **Done when**: Features are applied when flags are passed

---

**Step 45**: Test --with-reset flag
```bash
npm run build
node dist/index.js test-reset --template vite-react --with-reset --no-install
cat test-reset/src/reset.css
```
✅ **Done when**: reset.css is created when flag is used

---

**Step 46**: Test --with-theme flag
```bash
node dist/index.js test-theme --template vite-react --with-theme --no-install
cat test-theme/src/theme.stylex.ts
```
✅ **Done when**: theme.stylex.ts is created when flag is used

---

**Step 47**: Test --strict flag
```bash
node dist/index.js test-strict --template vite-react --strict --no-install
cat test-strict/.eslintrc.json
```
✅ **Done when**: ESLint config is created when flag is used

---

**Step 48**: Test all flags together
```bash
node dist/index.js test-all --template nextjs --with-reset --with-theme --strict
cd test-all
npm install
npm run dev
```
✅ **Done when**: All features work together without conflicts

---

#### Part 8: Polish & Documentation (Steps 49-52)

**Step 49**: Add color output with ansis
```typescript
import ansis from 'ansis';

// Replace console.log calls with colored output
console.log(ansis.green('✓') + ' Created directory:', targetDir);
console.log(ansis.green('✓') + ' Using template:', template.name);
console.log(ansis.green('✓') + ' Files copied');
console.log(ansis.green('✓') + ' Generated package.json');
console.log(ansis.green('✓') + ' Dependencies installed');

console.log('\n' + ansis.bold.green('✨ Success!') + ' Created ' + projectName);
```
✅ **Done when**: Output has colors and looks professional

---

**Step 50**: Add better error messages
```typescript
try {
  // main logic
} catch (error) {
  console.error(ansis.red('Error:'), error.message);
  process.exit(1);
}
```
✅ **Done when**: Errors are displayed in red with clear messages

---

**Step 51**: Create packages/create-stylex-app/README.md
```markdown
# create-stylex-app

Scaffold a new StyleX project from official templates.

## Usage

```bash
# Interactive mode
npx create-stylex-app

# With template
npx create-stylex-app my-app --template nextjs

# With features
npx create-stylex-app my-app --template vite-react --with-reset --with-theme --strict
```

## Options

- `--template, -t` - Template to use (nextjs, vite-react, vite)
- `--with-reset` - Include CSS reset file
- `--with-theme` - Include theme tokens
- `--strict` - Enable strict ESLint config
- `--no-install` - Skip dependency installation

## Templates

- **nextjs** - Next.js App Router + TypeScript
- **vite-react** - Vite + React + TypeScript
- **vite** - Vite Vanilla TypeScript
```
✅ **Done when**: README documents all features and options

---

**Step 52**: Final end-to-end test
```bash
# Clean up
rm -rf test-*

# Test each scenario
npm run build

# 1. Interactive mode
node dist/index.js

# 2. Quick start
node dist/index.js my-app

# 3. With template
node dist/index.js next-app --template nextjs

# 4. All features
node dist/index.js full-app --template vite-react --with-reset --with-theme --strict

# Verify all work
cd full-app
npm install
npm run dev
npm run build
```
✅ **Done when**: All scenarios work without errors

---

### Phase 1 Complete! 🎉

**What we built**:
- ✅ Working CLI with yargs + prompts
- ✅ 3 templates (nextjs, vite-react, vite)
- ✅ Reads from examples (always current StyleX versions)
- ✅ Feature flags (--with-reset, --with-theme, --strict)
- ✅ Dependency installation
- ✅ Colored output
- ✅ Error handling
- ✅ Documentation

**What's NOT included** (Future Work):
- ❌ Add-to-existing (`--add` flag)
- ❌ Advanced theming
- ❌ Component generators
- ❌ Community templates

---

## Future Considerations

> **Note**: The following sections describe potential future enhancements that may be explored after the MVP is stable and battle-tested. These are not part of the current implementation plan.

### Potential Future: Add to Existing Projects

**Concept**: Similar to Panda CSS's `panda init` - allow users to add StyleX to existing projects

**Why this could be valuable**:
- Most developers already have Next.js/Vite projects
- Lower barrier to trying StyleX
- Matches patterns from other CSS-in-JS tools

**Potential Features**:
- Framework detection (analyze package.json)
- Interactive setup wizard
- Auto-configuration (install deps, modify build configs)
- Generate example files

**Potential Command Syntax**:
```bash
# In existing project directory
npx create-stylex-app --add
# or
npx stylex init

# Would detect framework and add StyleX
```

**Decision Point**: After MVP is stable, evaluate user feedback to determine if this feature is needed.

---

### Potential Future: Advanced Features

**Long-term enhancement ideas**:
- [ ] Additional templates (webpack, rollup, rspack, esbuild, etc.)
- [ ] Template variants (JS vs TS, App Router vs Pages, etc.)
- [ ] Enhanced theming (dark mode, multiple presets, theme builder)
- [ ] Better progress UI (spinners, progress bars, listr2)
- [ ] Community template support (custom templates from GitHub)
- [ ] Component generators (`npx create-stylex-app component Button`)
- [ ] Interactive theme builder
- [ ] Migration tools (CSS Modules → StyleX)
- [ ] Telemetry (opt-in analytics)

---

## CLI Design

### Command Syntax

```bash
# Interactive mode (recommended)
npx create-stylex-app

# Quick start
npx create-stylex-app my-app

# With template
npx create-stylex-app my-app --template nextjs

# With features
npx create-stylex-app my-app -t vite-react --with-reset --with-theme --strict

# All flags
npx create-stylex-app my-app \
  --template vite-react \
  --with-reset \
  --with-theme \
  --strict \
  --pm pnpm \
  --no-install \
  --no-git
```

### Flags Reference

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--template <name>` | `-t` | Template to use | Interactive |
| `--with-reset` | | Include CSS reset | `false` |
| `--with-theme` | | Include theme tokens | `false` |
| `--strict` | | Strict ESLint + TS | `false` |
| `--pm <manager>` | | Package manager | Auto-detect |
| `--no-install` | | Skip install | `false` |
| `--no-git` | | Skip git init | `false` |

### Interactive Flow

```
? Project name › my-app

? Select a template ›
  ❯ Next.js (App Router + TypeScript)
    Vite + React (TypeScript)
    Vite (Vanilla TypeScript)

? Add features? (Space to select, Enter to continue) ›
  ◯ CSS Reset
  ◯ Theme tokens
  ◯ Strict mode (ESLint + TypeScript)

? Package manager ›
  ❯ npm (detected)
    yarn
    pnpm

? Install dependencies? (Y/n) › Yes

✔ Scaffolding project...
✔ Installing dependencies...
✔ Done!

Next steps:
  cd my-app
  npm run dev
```

**UI Note**: Using `prompts` library provides clean, simple prompts. Can upgrade to `@clack/prompts` in future for fancier UI without changing logic.

---

## Testing Strategy

### Manual Testing Checklist

For each template (nextjs, vite-react, vite):
- [ ] Create project with default settings
- [ ] Create project with all features enabled
- [ ] Verify all files created
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` starts dev server
- [ ] Run `npm run build` builds successfully
- [ ] Verify StyleX compilation works
- [ ] Check generated README accuracy

### Automated Testing (Future)

```typescript
// Integration tests
describe('create-stylex-app', () => {
  it('scaffolds nextjs template', async () => {
    await scaffold({ template: 'nextjs', projectName: 'test-app' });
    expect(fs.existsSync('test-app/package.json')).toBe(true);
    expect(fs.existsSync('test-app/next.config.js')).toBe(true);
  });

  it('applies reset feature', async () => {
    await scaffold({ template: 'vite-react', withReset: true });
    expect(fs.existsSync('test-app/src/reset.css')).toBe(true);
  });
});
```

---

## Success Criteria

### MVP (Phase 1) Success Metrics
- ✅ 3 working templates (nextjs, vite-react, vite)
- ✅ All 3 feature flags working (reset, theme, strict)
- ✅ Clean interactive CLI experience
- ✅ Generated projects run without errors
- ✅ Documentation complete

### Quality Standards
- All generated projects must:
  - Install dependencies without errors
  - Start dev server successfully
  - Build for production successfully
  - Have accurate README with setup instructions
  - Follow StyleX best practices

---

## Open Decisions

### Technical Choices
- [x] **CLI Library**: yargs ✓ (aligned with StyleX CLI)
- [x] **Prompts Library**: prompts ✓ (simple, battle-tested)
- [x] **Colors**: ansis ✓ (aligned with StyleX CLI)
- [x] **Arg Parser**: yargs ✓ (same as StyleX CLI)
- [x] **Bundler**: tsup ✓
- [x] **Template Source**: Read from `/examples` at runtime ✓
  - ✅ Single source of truth
  - ✅ Auto-sync with example updates
  - ✅ StyleX versions always current
- [ ] **Package Name**: `create-stylex-app` vs `@stylexjs/create-app`
  - Recommendation: `create-stylex-app` (follows npm convention)
- [ ] **Binary Name**: `create-stylex-app` (no alias needed for MVP)

### Process Decisions
- [ ] Release strategy: Independent or with main StyleX releases?
  - Recommendation: **Independent releases** (allows faster iteration)
- [ ] Version management for templates
  - Recommendation: Templates version with package (no separate versioning for MVP)
- [ ] Template update mechanism
  - Defer to future (manual sync for MVP)
- [ ] Community template submission process
  - Defer to future

---

## Next Actions

1. **Create package structure** in `/packages/create-stylex-app/`
2. **Set up build tooling** (TypeScript + tsup)
3. **Implement basic CLI** with yargs + prompts
4. **Create first template** (vite-react - simplest, read from examples)
5. **Test end-to-end** workflow manually

**Implementation Approach**:
- Start with 1 template working end-to-end (Steps 1-28)
- Add remaining templates and features (Steps 29-52)
- Polish and document

**Suggested PRs**:
- **First PR**: MVP with 1 template working end-to-end (Steps 1-28: read from examples)
- **Second PR**: Add remaining 2 templates + dependency installation (Steps 29-39)
- **Third PR**: Add feature flags + polish (Steps 40-52)

---

**Document Status**: Focus on MVP only (create-new); add-to-existing is future consideration
**Last Updated**: 2026-01-05
**Version**: 0.7.0 - **Scope Clarification**: Removed Phase 2/3 language; MVP = create-new only, add-to-existing = future

---

## Summary of Architectural Decisions

### ✅ Aligned with StyleX Existing Tools
- **yargs** for arg parsing (same as @stylexjs/cli)
- **ansis** for colors (same as @stylexjs/cli)
- **TypeScript** (consistent with StyleX codebase)

### ✅ Industry Standard Additions
- **prompts** for interactive CLI (used by create-react-app)
- **cross-spawn** for process spawning (universal standard)
- **fs-extra** for file utilities (safer than native fs)

### 🎯 Critical Design: Examples as Source of Truth
- **Templates reference** existing `/examples` directories
- **No duplicate** template files to maintain
- **Auto-sync**: StyleX versions update automatically when examples update
- **Zero maintenance**: No hardcoded versions in create-stylex-app

### 📋 Implementation Focus
**Current Scope**: Create new projects (`create-stylex-app my-app`)

**MVP Goal**: Ship a working, useful scaffolding tool for creating new StyleX projects

**Future Considerations**: Add-to-existing and advanced features may be explored after MVP is stable

### 🚀 Benefits
1. **Consistency**: Familiar patterns for StyleX contributors
2. **Reusability**: Leverage existing monorepo dependencies
3. **Stability**: Battle-tested libraries, not bleeding-edge
4. **Maintainability**: Same stack = easier to maintain across CLI tools
5. **Auto-updates**: ✨ **StyleX versions always current from examples** ✨
