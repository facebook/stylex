/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * The Emotion -> StyleX pipeline for one file: detect -> read (adapter),
 * buildIR -> emit (core), rewrite -> registry -> imports (adapter).
 *
 * M5 policy (bail loudly, per site): every convertible css site is rewritten
 * and each unconvertible one is left in place with a
 * `// TODO(stylex-migration): …` marker — the file is no longer skipped
 * wholesale. Genuinely file-level structural issues (a non-namespace stylex
 * import, ≥2 registries, an unconvertible keyframes) still refuse the whole
 * file with stated reasons. Nothing is ever silently dropped or guessed.
 */

import { buildFileIR } from '../../core/buildIR';
import { emitFileIR } from '../../core/emit';
import type {
  EmittedRule,
  EmittedStyle,
  EmittedKeyframes,
} from '../../core/emit';
import { normalizeFileIR } from '../../core/normalize';
import { postprocess } from '../../core/postprocess';
import { lintGate } from '../../core/gates/lint';
import { checkRule } from '../../core/referee';
import { formatTodo, isTodoMarker } from '../../core/todos';
import {
  parseSource,
  printSource,
  parserForFile,
  styleToObjectAst,
  jsxComment,
} from '../../core/rewriter';
import {
  analyzeEmotionWiring,
  removePragma,
  removeCssImport,
  insertStylexImport,
} from './imports';
import { detectSites, detectKeyframes, detectExistingRegistry } from './detect';
import { readSite, readKeyframes } from './read';
import type { PlainStyleObject } from './read';
import { rewriteSite } from './rewriteSites';

export type TransformResult =
  | {
      +status: 'converted',
      +code: string,
      +sites: $ReadOnlyArray<{ +key: string, +cssObject: PlainStyleObject }>,
      +keyframes: $ReadOnlyArray<{
        +framesObject: { +[selector: string]: { +[string]: mixed } },
      }>,
      /** Reasons for each site left in place with a TODO marker (M5). */
      +flags: $ReadOnlyArray<string>,
    }
  | { +status: 'skipped', +reasons: $ReadOnlyArray<string> }
  | { +status: 'unchanged' };

export type TransformOptions = {
  /** Wrap `:hover` in `@media (hover: hover)` (default true). */
  +hoverGuard?: boolean,
  /** Map inline-axis physical properties to logical (default true). */
  +logicalProperties?: boolean,
};

export function transformEmotionFile(
  source: string,
  filename: string = 'file.js',
  options?: TransformOptions,
): TransformResult {
  // Cheap bail before parsing anything.
  if (!source.includes('@emotion/react')) {
    return { status: 'unchanged' };
  }

  const { j, root } = parseSource(source, {
    parser: parserForFile(filename),
  });

  const wiring = analyzeEmotionWiring(j, root);
  if (
    !wiring.hasPragma &&
    wiring.cssLocalName == null &&
    wiring.keyframesLocalName == null
  ) {
    return { status: 'unchanged' };
  }

  // Keyframes first, so css sites can reference them by name.
  const kfDetection = detectKeyframes(j, root, wiring.keyframesLocalName);
  const kfReads = kfDetection.sites.map((s) =>
    readKeyframes(s.varName, s.objectNode),
  );

  const detection = detectSites(j, root, wiring.cssLocalName);
  const registryDetection = detectExistingRegistry(j, root);

  // Whole-file refusals: genuinely file-level structural issues (not a single
  // site). Keyframes stay whole-file for now — per-site keyframe flagging is a
  // later slice.
  const wholeFileBlockers = [
    ...wiring.blockers,
    ...detection.blockers,
    ...kfDetection.blockers,
    ...registryDetection.blockers,
    ...kfReads.map((r) => (r.ok ? null : r.blocker)).filter(Boolean),
  ];
  if (wholeFileBlockers.length > 0) {
    return { status: 'skipped', reasons: wholeFileBlockers };
  }

  // --- Per-site classification: each css site either converts or is flagged
  // with a `// TODO(stylex-migration): …` marker (bail loudly, in place). ---
  const flags: Array<{ +attrPath: $FlowFixMe, +reason: string }> = [];
  const candidates: Array<{ +site: $FlowFixMe, +read: $FlowFixMe }> = [];
  for (const site of detection.sites) {
    if (site.kind === 'flagged') {
      flags.push({ attrPath: site.attrPath, reason: site.reason });
      continue;
    }
    if (siteAlreadyFlagged(j, site.attrPath)) {
      continue; // re-run guard: leave a previously-flagged site alone
    }
    const read = readSite(site, kfDetection.names);
    if (read.ok) {
      candidates.push({ site, read });
    } else {
      flags.push({ attrPath: site.attrPath, reason: read.blocker });
    }
  }

  // Adapter -> core for the convertible candidates.
  const fileIR = normalizeFileIR(
    {
      rules: buildFileIR(
        candidates.map((c) => ({
          nameHint: c.read.nameHint,
          declarations: c.read.declarations,
        })),
      ).rules,
      keyframes: kfReads.map((r) => {
        if (!r.ok) {
          throw new Error('unreachable: keyframes blockers checked above');
        }
        return r.rule;
      }),
    },
    { logicalProperties: options?.logicalProperties ?? true },
  );

  // L5 Referee, per rule: a conflicting site is flagged, not fatal to the file.
  const convertRules: Array<{ +rule: $FlowFixMe, +candidateIndex: number }> =
    [];
  fileIR.rules.forEach((rule, i) => {
    const checked = checkRule(rule);
    if (checked.ok) {
      convertRules.push({ rule: checked.rule, candidateIndex: i });
    } else {
      flags.push({
        attrPath: candidates[i].site.attrPath,
        reason: checked.conflicts[0],
      });
    }
  });

  if (convertRules.length === 0 && kfDetection.sites.length === 0) {
    if (flags.length === 0) {
      return { status: 'unchanged' };
    }
    // Nothing convertible, but sites to flag: inject TODOs and keep Emotion.
    for (const flag of flags) {
      injectTodo(j, flag.attrPath, flag.reason);
    }
    return {
      status: 'converted',
      code: printSource({ j, root }),
      sites: [],
      keyframes: [],
      flags: flags.map((f) => f.reason),
    };
  }

  const existing = registryDetection.registry;
  const { rules, keyframes, bindings } = emitFileIR(
    {
      rules: convertRules.map((c) => c.rule),
      keyframes: fileIR.keyframes,
    },
    { hoverGuard: options?.hoverGuard ?? true, reservedKeys: existing?.keys },
  );

  // L10 Scoped postprocess (see scopedFix): fixes ONLY our emitted stylex.
  const stylesLocalName =
    existing != null ? existing.varName : pickStylesName(j, root);
  const fixed = scopedFix(j, rules, keyframes, stylesLocalName, filename);
  if (fixed.residualErrors.length > 0) {
    return { status: 'skipped', reasons: fixed.residualErrors };
  }

  // Rewrite converted sites; flag the rest in place.
  convertRules.forEach((c, k) => {
    rewriteSite(
      j,
      candidates[c.candidateIndex].site,
      stylesLocalName,
      bindings[k],
    );
  });
  rewriteKeyframes(j, kfDetection.sites, fixed.keyframesByName);
  for (const flag of flags) {
    injectTodo(j, flag.attrPath, flag.reason);
  }

  if (rules.length > 0 && fixed.createObject != null) {
    if (existing != null) {
      existing.objectNode.properties.push(...fixed.createObject.properties);
    } else {
      insertRegistry(
        j,
        root,
        candidates[convertRules[0].candidateIndex].site,
        stylesLocalName,
        fixed.createObject,
      );
    }
  }
  if (existing == null && (rules.length > 0 || keyframes.length > 0)) {
    insertStylexImport(j, root);
  }
  // Remove Emotion wiring only where it is no longer referenced: flagged css
  // props keep the pragma; a still-used `css`/`keyframes` keeps its import.
  removeCssImport(j, root);
  removePragma(j, root);

  const code = printSource({ j, root });
  // Final safety VERIFY (not fix) over the whole file — catches a merge into a
  // user registry whose own code is lint-dirty; we refuse rather than rewrite.
  const finalLint = lintGate(code, { filename });
  if (!finalLint.ok) {
    return {
      status: 'skipped',
      reasons: finalLint.messages.map(
        (m) => `${m.ruleId ?? 'error'}: ${m.message} (line ${m.line})`,
      ),
    };
  }

  return {
    status: 'converted',
    code,
    sites: convertRules.map((c, k) => ({
      key: bindings[k],
      cssObject: candidates[c.candidateIndex].read.cssObject,
    })),
    keyframes: kfReads.map((kf) => {
      if (!kf.ok) {
        throw new Error('unreachable: keyframes blockers checked above');
      }
      return { framesObject: kf.framesObject };
    }),
    flags: flags.map((f) => f.reason),
  };
}

/** Whether a css site was already flagged on a previous run (re-run guard):
 * a TODO comment sibling immediately before its element, or leading on it. */
function siteAlreadyFlagged(j: $FlowFixMe, attrPath: $FlowFixMe): boolean {
  const elementPath = attrPath.parent.parent;
  const parent = elementPath.parent.node;
  const children = Array.isArray(parent.children) ? parent.children : null;
  const leading = (elementPath.node.comments ?? []).some((c: $FlowFixMe) =>
    isTodoMarker(c.value),
  );
  if (leading) {
    return true;
  }
  if (children == null) {
    return false;
  }
  const idx = children.indexOf(elementPath.node);
  for (let i = idx - 1; i >= 0; i--) {
    const sibling = children[i];
    if (sibling.type === 'JSXText' && String(sibling.value).trim() === '') {
      continue;
    }
    return (
      sibling.type === 'JSXExpressionContainer' &&
      sibling.expression?.type === 'JSXEmptyExpression' &&
      (sibling.expression.comments ?? []).some((c: $FlowFixMe) =>
        isTodoMarker(c.value),
      )
    );
  }
  return false;
}

/** Injects a `TODO(stylex-migration): reason` marker at a flagged css site: a
 * braced JSX comment sibling when the element is a JSX child, else a leading
 * block comment on the element (both valid, unlike a bare comment as a child). */
function injectTodo(j: $FlowFixMe, attrPath: $FlowFixMe, reason: string): void {
  const elementPath = attrPath.parent.parent;
  const element = elementPath.node;
  const parent = elementPath.parent.node;
  const text = formatTodo(reason);
  if (
    (parent.type === 'JSXElement' || parent.type === 'JSXFragment') &&
    Array.isArray(parent.children)
  ) {
    const idx = parent.children.indexOf(element);
    parent.children.splice(idx, 0, jsxComment(j, text), j.jsxText('\n'));
  } else {
    element.comments = [
      ...(element.comments ?? []),
      { type: 'CommentBlock', value: text, leading: true, trailing: false },
    ];
  }
}

const STYLEX_IMPORT = "import * as stylex from '@stylexjs/stylex';";

/**
 * Scoped postprocess: build a standalone module of just the emitted stylex
 * (keyframes + create + usage stubs), run StyleX's eslint autofixes on it,
 * and extract the FIXED object expressions. The user's file is never linted,
 * so their pre-existing stylex code cannot be reordered.
 */
function scopedFix(
  j: $FlowFixMe,
  rules: $ReadOnlyArray<EmittedRule>,
  keyframes: $ReadOnlyArray<EmittedKeyframes>,
  stylesLocalName: string,
  filename: string,
): {
  createObject: $FlowFixMe | null,
  keyframesByName: Map<string, $FlowFixMe>,
  residualErrors: $ReadOnlyArray<string>,
} {
  const lines: Array<string> = [STYLEX_IMPORT];
  for (const kf of keyframes) {
    const framesObject: { [string]: EmittedStyle } = {};
    for (const frame of kf.frames) {
      framesObject[frame.selector] = frame.style;
    }
    lines.push(
      `const ${kf.name} = stylex.keyframes(` +
        `${printExpr(j, styleToObjectAst(j, framesObject))});`,
    );
  }
  if (rules.length > 0) {
    const createStyle: { [string]: EmittedStyle } = {};
    for (const rule of rules) {
      createStyle[rule.key] = rule.style;
    }
    lines.push(
      `const ${stylesLocalName} = stylex.create(` +
        `${printExpr(j, styleToObjectAst(j, createStyle))});`,
    );
    // Usage stubs so no-unused stays quiet (real usage is in the JSX).
    for (const rule of rules) {
      lines.push(`stylex.props(${stylesLocalName}.${rule.key});`);
    }
  }

  const { code, residualErrors } = postprocess(lines.join('\n'), filename, {
    excludeRules: ['no-unused'],
  });

  const parsed = j(code);
  let createObject: $FlowFixMe | null = null;
  const keyframesByName: Map<string, $FlowFixMe> = new Map();
  parsed.find(j.CallExpression).forEach((path: $FlowFixMe) => {
    const callee = path.node.callee;
    if (
      callee.type !== 'MemberExpression' ||
      callee.object.type !== 'Identifier' ||
      callee.object.name !== 'stylex'
    ) {
      return;
    }
    if (callee.property.name === 'create') {
      createObject = unparenthesize(path.node.arguments[0]);
    } else if (callee.property.name === 'keyframes') {
      const declarator = path.parent.node;
      if (
        declarator.type === 'VariableDeclarator' &&
        declarator.id.type === 'Identifier'
      ) {
        keyframesByName.set(
          declarator.id.name,
          unparenthesize(path.node.arguments[0]),
        );
      }
    }
  });

  return { createObject, keyframesByName, residualErrors };
}

/** Prints a single expression node to source (via a throwaway wrapper). An
 * object literal at statement position is parenthesized to avoid block
 * ambiguity; that grouping is stripped again on the way back out. */
function printExpr(j: $FlowFixMe, node: $FlowFixMe): string {
  return j(j.expressionStatement(node))
    .toSource({ quote: 'single' })
    .replace(/;\s*$/, '');
}

/** Clears any parenthesized-grouping metadata from a node so recast reprints
 * it without redundant parens (the TS parser records it, Flow does not). */
function unparenthesize(node: $FlowFixMe): $FlowFixMe {
  if (node != null && node.extra != null) {
    node.extra.parenthesized = false;
    node.extra.parens = undefined;
  }
  return node;
}

/**
 * Rewrites each `keyframes({...})` call in place to `stylex.keyframes(<fixed
 * object>)`, matched to detected sites by the bound variable name.
 */
function rewriteKeyframes(
  j: $FlowFixMe,
  sites: $ReadOnlyArray<{ +callPath: $FlowFixMe, +varName: string, ... }>,
  fixedByName: Map<string, $FlowFixMe>,
): void {
  for (const site of sites) {
    const framesObject = fixedByName.get(site.varName);
    if (framesObject == null) {
      continue;
    }
    j(site.callPath).replaceWith(
      j.callExpression(
        j.memberExpression(j.identifier('stylex'), j.identifier('keyframes')),
        [framesObject],
      ),
    );
  }
}

/** `styles`, or a numbered variant if the file already uses that name. */
function pickStylesName(j: $FlowFixMe, root: $FlowFixMe): string {
  const taken = (name: string) => root.find(j.Identifier, { name }).size() > 0;
  let name = 'styles';
  for (let n = 2; taken(name); n++) {
    name = `styles${n}`;
  }
  return name;
}

/**
 * Inserts `const <styles> = stylex.create({...})` directly above the
 * top-level statement containing the first converted site (per the
 * best-practices doc's registry placement).
 */
function insertRegistry(
  j: $FlowFixMe,
  root: $FlowFixMe,
  firstSite: $FlowFixMe,
  stylesLocalName: string,
  createObject: $FlowFixMe,
): void {
  const declaration = j.variableDeclaration('const', [
    j.variableDeclarator(
      j.identifier(stylesLocalName),
      j.callExpression(
        j.memberExpression(j.identifier('stylex'), j.identifier('create')),
        [createObject],
      ),
    ),
  ]);

  let statementPath = firstSite.attrPath;
  while (
    statementPath.parent != null &&
    statementPath.parent.node.type !== 'Program'
  ) {
    statementPath = statementPath.parent;
  }
  j(statementPath).insertBefore(declaration);
}
