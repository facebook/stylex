#!/usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PLUGIN_ROOT = path.join(REPO_ROOT, 'ai-dev', 'plugins');
const INDEX_PATH = path.join(PLUGIN_ROOT, 'index.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function formatBulletList(items) {
  return items.map((item) => `- \`${item}\``).join('\n');
}

function formatCommandList(commands) {
  return commands
    .map((entry) => `- **${entry.name}:** \`${entry.command}\``)
    .join('\n');
}

function renderVerificationCommands(index) {
  if (
    !index.verification_commands ||
    index.verification_commands.length === 0
  ) {
    return '';
  }
  return `## Validation Commands

Always run these commands before finalizing changes:

${formatCommandList(index.verification_commands)}
`;
}

function renderRepoStructure(index) {
  if (!index.repo_structure || index.repo_structure.length === 0) {
    return '';
  }
  return `## Package Map

${index.repo_structure
  .map((entry) => `- \`${entry.path}\` - ${entry.role}`)
  .join('\n')}
`;
}

function renderConventions(index) {
  if (!index.conventions) {
    return '';
  }
  return `## Conventions

- ${index.conventions.note}
`;
}

function renderDoNotRules(index) {
  if (!index.do_not_rules || index.do_not_rules.length === 0) {
    return '';
  }
  return `## Do Not

${index.do_not_rules.map((rule) => `- ${rule}`).join('\n')}
`;
}

function renderLocalOverride(index) {
  if (!index.local_override || !index.local_override.path) {
    return '';
  }
  return `## Local Override

For machine-local customizations, use \`${index.local_override.path}\` (not committed).
`;
}

function formatWorkflowSection(workflow) {
  const lines = [];
  lines.push(`### ${workflow.id} (${workflow.priority})`);
  lines.push('');
  lines.push(workflow.title);
  lines.push('');
  lines.push('When to use:');
  lines.push('');
  for (const entry of workflow.when_to_use) {
    lines.push(`- ${entry}`);
  }
  lines.push('');
  lines.push('Load sources first:');
  lines.push('');
  for (const source of workflow.sources) {
    lines.push(`- \`${source}\``);
  }
  lines.push('');
  lines.push('Hard constraints:');
  lines.push('');
  for (const item of workflow.hard_constraints) {
    lines.push(`- ${item}`);
  }
  lines.push('');
  return lines.join('\n');
}

function renderAgentsMarkdown(index, workflows) {
  const defaultWorkflows = index.default_workflows.join(', ');
  const defaultWorkflowSet = new Set(index.default_workflows);
  const defaultWorkflowDetails = workflows.filter((wf) =>
    defaultWorkflowSet.has(wf.id),
  );
  const nonDefaultWorkflows = workflows.filter(
    (wf) => !defaultWorkflowSet.has(wf.id),
  );
  const workflowSummary = workflows
    .map((wf) => `- \`${wf.id}\` (${wf.priority}): ${wf.title}`)
    .join('\n');

  const sections = defaultWorkflowDetails.map(formatWorkflowSection).join('\n');
  const nonDefaultSummary =
    nonDefaultWorkflows.length === 0
      ? ''
      : `## Non-default Workflows

${nonDefaultWorkflows
  .map((wf) => `- \`${wf.id}\` (${wf.priority}): ${wf.title}`)
  .join('\n')}

Use scoped maintainer files for deep maintainer guidance:
- \`.github/instructions/stylex-maintainers.instructions.md\`
- \`.cursor/rules/stylex-maintainers.mdc\`
`;

  return `# StyleX Agent Context

_Generated file. Do not edit directly._
_Source: \`ai-dev/plugins/index.json\` and \`ai-dev/plugins/*.json\`._

This file is a context router. Keep detailed setup/authoring guidance in canonical static docs.

## Default Workflow Selection

Default workflows: ${defaultWorkflows}

Use maintainer workflow only when the task clearly edits StyleX internals.

## Canonical Sources

${formatBulletList(index.global_sources)}

## Workflow Plugins

${workflowSummary}

${sections}
${nonDefaultSummary}
## Rule Alignment Targets

${formatBulletList(index.rule_alignment_targets)}

${renderVerificationCommands(index)}
${renderDoNotRules(index)}
${renderConventions(index)}
${renderRepoStructure(index)}
${renderLocalOverride(index)}
## Maintainer Trigger Paths

- \`packages/@stylexjs/*\`
- \`packages/style-value-parser/*\`

## Generation and Integrity

- Generate: \`node tools/ai-context/generate-agents.js\`
- Check drift: \`node tools/ai-context/generate-agents.js --check\`
- Never edit generated context files manually; update plugin source files instead.
`;
}

function renderToolRouterMarkdown(toolName, index, workflows) {
  const defaultWorkflows = index.default_workflows.join(', ');
  return `# ${toolName} Context

_Generated file. Do not edit directly._
_Source: \`ai-dev/plugins/index.json\` and \`ai-dev/plugins/*.json\`._

Use \`AGENTS.md\` as the primary context router.

## Defaults

- Default workflows: ${defaultWorkflows}
- Use maintainer workflow only for StyleX internals.

## Canonical Sources

${formatBulletList(index.global_sources)}

## Workflow Summary

${workflows
  .map((wf) => `- \`${wf.id}\` (${wf.priority}): ${wf.title}`)
  .join('\n')}

## Rule Alignment

${formatBulletList(index.rule_alignment_targets)}

${renderVerificationCommands(index)}
${renderDoNotRules(index)}
${renderConventions(index)}
${renderRepoStructure(index)}
${renderLocalOverride(index)}
## Generation and Integrity

- Generate: \`node tools/ai-context/generate-agents.js\`
- Check drift: \`node tools/ai-context/generate-agents.js --check\`
- Never edit generated context files manually; update plugin source files instead.
`;
}

function renderCopilotRepoInstructions(index) {
  return `# StyleX Copilot Repository Instructions

_Generated file. Do not edit directly._
_Source: \`ai-dev/plugins/index.json\` and \`ai-dev/plugins/*.json\`._

Keep this file global and orthogonal. Put workflow-specific guidance in
\`.github/instructions/*.instructions.md\`.

## Global behavior

- Default to \`WF-SETUP\` and \`WF-AUTHOR\`.
- Use \`WF-MAINTAIN\` only for StyleX internals.
- Load canonical docs before giving setup or authoring advice.
- Align suggestions with StyleX lint rules.
- Avoid duplicating long setup/authoring explanations; reference canonical files.

## Canonical Sources

${formatBulletList(index.global_sources)}

## Rule Alignment

${formatBulletList(index.rule_alignment_targets)}

${renderVerificationCommands(index)}
${renderDoNotRules(index)}
${renderConventions(index)}
## Generation and Integrity

- Generate: \`node tools/ai-context/generate-agents.js\`
- Check drift: \`node tools/ai-context/generate-agents.js --check\`
`;
}

function renderCopilotScopedInstruction(workflow) {
  return `---
applyTo: ${JSON.stringify(workflow.copilot_apply_to)}
---
# ${workflow.id} (${workflow.priority})

${workflow.title}

When to use:

${workflow.when_to_use.map((entry) => `- ${entry}`).join('\n')}

Load sources first:

${workflow.sources.map((source) => `- \`${source}\``).join('\n')}

Hard constraints:

${workflow.hard_constraints.map((item) => `- ${item}`).join('\n')}
`;
}

function renderCursorRuleFrontmatter(options) {
  const lines = ['---'];
  lines.push(`description: ${JSON.stringify(options.description)}`);
  if (options.alwaysApply != null) {
    lines.push(`alwaysApply: ${options.alwaysApply ? 'true' : 'false'}`);
  }
  if (options.globs && options.globs.length > 0) {
    lines.push('globs:');
    for (const glob of options.globs) {
      lines.push(`  - ${JSON.stringify(glob)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function renderCursorGlobalRule(index) {
  const frontmatter = renderCursorRuleFrontmatter({
    description:
      'StyleX global router: default setup/authoring workflows and canonical source files.',
    alwaysApply: true,
  });

  const body = `Use \`WF-SETUP\` and \`WF-AUTHOR\` by default.
Use \`WF-MAINTAIN\` only for StyleX internals under \`packages/@stylexjs/*\` and \`packages/style-value-parser/*\`.
Load canonical sources first:
${formatBulletList(index.global_sources)}
Keep this rule short and route to canonical docs instead of duplicating long explanations.`;

  return `${frontmatter}

${body}
`;
}

function renderCursorWorkflowRule(workflow) {
  const frontmatter = renderCursorRuleFrontmatter({
    description: `${workflow.id} workflow routing and constraints`,
    globs: workflow.cursor_globs,
  });
  const body = `Workflow: \`${workflow.id}\` (${workflow.priority})
${workflow.title}

Load sources first:
${workflow.sources.map((source) => `- \`${source}\``).join('\n')}

Hard constraints:
${workflow.hard_constraints.map((item) => `- ${item}`).join('\n')}
`;
  return `${frontmatter}

${body}`;
}

function buildOutputs(index, workflows) {
  const byId = new Map(workflows.map((workflow) => [workflow.id, workflow]));
  return [
    {
      path: path.join(REPO_ROOT, 'AGENTS.md'),
      content: renderAgentsMarkdown(index, workflows),
    },
    {
      path: path.join(
        REPO_ROOT,
        'packages',
        'docs',
        'static',
        'llm',
        'AGENTS.md',
      ),
      content: renderAgentsMarkdown(index, workflows),
    },
    {
      path: path.join(REPO_ROOT, 'CLAUDE.md'),
      content: renderToolRouterMarkdown('CLAUDE', index, workflows),
    },
    {
      path: path.join(REPO_ROOT, 'GEMINI.md'),
      content: renderToolRouterMarkdown('GEMINI', index, workflows),
    },
    {
      path: path.join(REPO_ROOT, '.github', 'copilot-instructions.md'),
      content: renderCopilotRepoInstructions(index),
    },
    {
      path: path.join(
        REPO_ROOT,
        '.github',
        'instructions',
        'stylex-setup.instructions.md',
      ),
      content: renderCopilotScopedInstruction(byId.get('WF-SETUP')),
    },
    {
      path: path.join(
        REPO_ROOT,
        '.github',
        'instructions',
        'stylex-authoring.instructions.md',
      ),
      content: renderCopilotScopedInstruction(byId.get('WF-AUTHOR')),
    },
    {
      path: path.join(
        REPO_ROOT,
        '.github',
        'instructions',
        'stylex-maintainers.instructions.md',
      ),
      content: renderCopilotScopedInstruction(byId.get('WF-MAINTAIN')),
    },
    {
      path: path.join(REPO_ROOT, '.cursor', 'rules', 'stylex-global.mdc'),
      content: renderCursorGlobalRule(index),
    },
    {
      path: path.join(REPO_ROOT, '.cursor', 'rules', 'stylex-setup.mdc'),
      content: renderCursorWorkflowRule(byId.get('WF-SETUP')),
    },
    {
      path: path.join(REPO_ROOT, '.cursor', 'rules', 'stylex-authoring.mdc'),
      content: renderCursorWorkflowRule(byId.get('WF-AUTHOR')),
    },
    {
      path: path.join(REPO_ROOT, '.cursor', 'rules', 'stylex-maintainers.mdc'),
      content: renderCursorWorkflowRule(byId.get('WF-MAINTAIN')),
    },
  ];
}

function main() {
  const isCheck = process.argv.includes('--check');
  const index = readJson(INDEX_PATH);
  const workflows = index.workflows.map((name) =>
    readJson(path.join(PLUGIN_ROOT, `${name}.json`)),
  );
  const outputs = buildOutputs(index, workflows);

  let hasDiff = false;
  for (const output of outputs) {
    const filePath = output.path;
    const desired = output.content;
    const current = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, 'utf8')
      : null;
    if (current !== desired) {
      hasDiff = true;
      if (!isCheck) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, desired, 'utf8');
        // eslint-disable-next-line no-console
        console.log(`updated ${path.relative(REPO_ROOT, filePath)}`);
      }
    }
  }

  if (isCheck && hasDiff) {
    // eslint-disable-next-line no-console
    console.error(
      'Generated context files are out of date. Run: node tools/ai-context/generate-agents.js',
    );
    process.exitCode = 1;
  }
}

main();
