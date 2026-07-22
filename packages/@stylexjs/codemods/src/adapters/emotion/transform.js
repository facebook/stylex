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
 * M1 policy (user-ratified): whole-file-or-nothing. A file is rewritten
 * only when every style site is convertible; any blocker returns
 * `skipped` with the reasons and the source untouched. TODO-comment
 * flagging machinery lands in M5.
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
import {
  parseSource,
  printSource,
  parserForFile,
  styleToObjectAst,
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
  // A pre-existing `stylex.create` becomes a merge target rather than a refusal.
  const registryDetection = detectExistingRegistry(j, root);
  const blockers = [
    ...wiring.blockers,
    ...detection.blockers,
    ...kfDetection.blockers,
    ...registryDetection.blockers,
  ];
  const reads = detection.sites.map((s) => readSite(s, kfDetection.names));
  for (const read of reads) {
    if (!read.ok) {
      blockers.push(read.blocker);
    }
  }
  for (const kf of kfReads) {
    if (!kf.ok) {
      blockers.push(kf.blocker);
    }
  }
  if (blockers.length > 0) {
    return { status: 'skipped', reasons: blockers };
  }
  if (detection.sites.length === 0 && kfDetection.sites.length === 0) {
    return { status: 'unchanged' };
  }

  // Adapter -> core: declarations in, create data + binding map out.
  const groups = reads.map((read) => {
    if (!read.ok) {
      throw new Error('unreachable: blockers were checked above');
    }
    return { nameHint: read.nameHint, declarations: read.declarations };
  });
  const keyframeRules = kfReads.map((kf) => {
    if (!kf.ok) {
      throw new Error('unreachable: blockers were checked above');
    }
    return kf.rule;
  });
  // L6 Normalize runs before the referee so every downstream layer sees one
  // vocabulary (physical→logical is a sanctioned RTL change).
  const fileIR = normalizeFileIR(
    { rules: buildFileIR(groups).rules, keyframes: keyframeRules },
    { logicalProperties: options?.logicalProperties ?? true },
  );

  // L5 Referee: convert only when Emotion's cascade and StyleX's priority
  // agree on every simultaneously-active condition; otherwise refuse.
  const refereed = fileIR.rules.map(checkRule);
  const conflicts = refereed.flatMap((r) => (r.ok ? [] : r.conflicts));
  if (conflicts.length > 0) {
    return { status: 'skipped', reasons: conflicts };
  }
  const existing = registryDetection.registry;
  const { rules, keyframes, bindings } = emitFileIR(
    {
      rules: refereed.map((r) => {
        if (!r.ok) {
          throw new Error('unreachable: conflicts were checked above');
        }
        return r.rule;
      }),
      keyframes: fileIR.keyframes,
    },
    {
      hoverGuard: options?.hoverGuard ?? true,
      reservedKeys: existing?.keys,
    },
  );

  // L10 Scoped postprocess: run StyleX's own eslint autofixes on ONLY the
  // emitted stylex (as a standalone snippet), so a user's pre-existing stylex
  // is never linted or reordered. The fixed objects are spliced back below.
  const stylesLocalName =
    existing != null ? existing.varName : pickStylesName(j, root);
  const fixed = scopedFix(j, rules, keyframes, stylesLocalName, filename);
  if (fixed.residualErrors.length > 0) {
    return { status: 'skipped', reasons: fixed.residualErrors };
  }

  // Core -> adapter: place the StyleX back into the file's idiom.
  detection.sites.forEach((site, i) => {
    rewriteSite(j, site, stylesLocalName, bindings[i]);
  });
  rewriteKeyframes(j, kfDetection.sites, fixed.keyframesByName);
  if (rules.length > 0 && fixed.createObject != null) {
    if (existing != null) {
      // Merge: append our (already-fixed) style entries to the user's
      // registry. Top-level style names need no sort-keys ordering, and the
      // user's own entries are left exactly as they were.
      existing.objectNode.properties.push(...fixed.createObject.properties);
    } else {
      insertRegistry(
        j,
        root,
        detection.sites[0],
        stylesLocalName,
        fixed.createObject,
      );
    }
  }
  if (existing == null) {
    insertStylexImport(j, root);
  }
  removeCssImport(j, root);
  removePragma(j, root);

  const code = printSource({ j, root });
  // Final safety VERIFY (not fix) over the whole file. Our emitted code was
  // already fixed in isolation; this catches a merge into a user registry
  // whose own pre-existing code is lint-dirty — we refuse rather than
  // silently reorder it (that is the whole point of the scoped fix).
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
    sites: detection.sites.map((site, i) => {
      const read = reads[i];
      if (!read.ok) {
        throw new Error('unreachable: blockers were checked above');
      }
      return { key: bindings[i], cssObject: read.cssObject };
    }),
    keyframes: kfReads.map((kf) => {
      if (!kf.ok) {
        throw new Error('unreachable: blockers were checked above');
      }
      return { framesObject: kf.framesObject };
    }),
  };
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
      createObject = path.node.arguments[0];
    } else if (callee.property.name === 'keyframes') {
      const declarator = path.parent.node;
      if (
        declarator.type === 'VariableDeclarator' &&
        declarator.id.type === 'Identifier'
      ) {
        keyframesByName.set(declarator.id.name, path.node.arguments[0]);
      }
    }
  });

  return { createObject, keyframesByName, residualErrors };
}

/** Prints a single expression node to source (via a throwaway wrapper). */
function printExpr(j: $FlowFixMe, node: $FlowFixMe): string {
  return j(j.expressionStatement(node))
    .toSource({ quote: 'single' })
    .replace(/;\s*$/, '');
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
