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
import type { EmittedRule } from '../../core/emit';
import { normalizeFileIR } from '../../core/normalize';
import { postprocess } from '../../core/postprocess';
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
import { detectSites } from './detect';
import { readSite } from './read';
import type { PlainStyleObject } from './read';
import { rewriteSite } from './rewriteSites';

export type TransformResult =
  | {
      +status: 'converted',
      +code: string,
      +sites: $ReadOnlyArray<{ +key: string, +cssObject: PlainStyleObject }>,
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
  if (!wiring.hasPragma && wiring.cssLocalName == null) {
    return { status: 'unchanged' };
  }

  const detection = detectSites(j, root, wiring.cssLocalName);
  const blockers = [...wiring.blockers, ...detection.blockers];
  const reads = detection.sites.map(readSite);
  for (const read of reads) {
    if (!read.ok) {
      blockers.push(read.blocker);
    }
  }
  if (blockers.length > 0) {
    return { status: 'skipped', reasons: blockers };
  }
  if (detection.sites.length === 0) {
    return { status: 'unchanged' };
  }

  // Adapter -> core: declarations in, create data + binding map out.
  const groups = reads.map((read) => {
    if (!read.ok) {
      throw new Error('unreachable: blockers were checked above');
    }
    return { nameHint: read.nameHint, declarations: read.declarations };
  });
  // L6 Normalize runs before the referee so every downstream layer sees one
  // vocabulary (physical→logical is a sanctioned RTL change).
  const fileIR = normalizeFileIR(buildFileIR(groups), {
    logicalProperties: options?.logicalProperties ?? true,
  });

  // L5 Referee: convert only when Emotion's cascade and StyleX's priority
  // agree on every simultaneously-active condition; otherwise refuse.
  const refereed = fileIR.rules.map(checkRule);
  const conflicts = refereed.flatMap((r) => (r.ok ? [] : r.conflicts));
  if (conflicts.length > 0) {
    return { status: 'skipped', reasons: conflicts };
  }
  const { rules, bindings } = emitFileIR(
    {
      rules: refereed.map((r) => {
        if (!r.ok) {
          throw new Error('unreachable: conflicts were checked above');
        }
        return r.rule;
      }),
      keyframes: fileIR.keyframes,
    },
    { hoverGuard: options?.hoverGuard ?? true },
  );

  // Core -> adapter: place the StyleX back into the file's idiom.
  const stylesLocalName = pickStylesName(j, root);
  detection.sites.forEach((site, i) => {
    rewriteSite(j, site, stylesLocalName, bindings[i]);
  });
  insertRegistry(j, root, detection.sites[0], stylesLocalName, rules);
  insertStylexImport(j, root);
  removeCssImport(j, root);
  removePragma(j, root);

  // L10 Postprocess: run StyleX's own eslint autofixes so key ordering and
  // shorthands match its canonical form. Unfixable residual errors mean the
  // output is not clean at error → refuse the whole file.
  const { code, residualErrors } = postprocess(
    printSource({ j, root }),
    filename,
  );
  if (residualErrors.length > 0) {
    return { status: 'skipped', reasons: residualErrors };
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
  };
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
  rules: $ReadOnlyArray<EmittedRule>,
): void {
  const createObject = j.objectExpression(
    rules.map((rule) =>
      j.property(
        'init',
        j.identifier(rule.key),
        styleToObjectAst(j, rule.style),
      ),
    ),
  );
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
