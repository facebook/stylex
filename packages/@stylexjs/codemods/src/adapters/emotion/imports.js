/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Emotion wiring: how a file opts into the css prop. M1 recognizes the
 * modern `@emotion/react` forms only — the `@jsxImportSource` pragma and a
 * named `css` import. Any other `@emotion/*` surface (styled, class-based
 * `@emotion/css`, Global, keyframes, classic `jsx` pragma) is a blocker:
 * we skip the whole file rather than half-migrate it.
 */

const PRAGMA_PATTERN = /@jsxImportSource\s+@emotion\/react/;

export type EmotionWiring = {
  +hasPragma: boolean,
  +cssLocalName: string | null,
  +blockers: Array<string>,
};

export function analyzeEmotionWiring(
  j: $FlowFixMe,
  root: $FlowFixMe,
): EmotionWiring {
  let cssLocalName: string | null = null;
  const blockers: Array<string> = [];

  root.find(j.ImportDeclaration).forEach((path: $FlowFixMe) => {
    const source = String(path.node.source.value);
    if (!source.startsWith('@emotion/')) {
      return;
    }
    if (source !== '@emotion/react') {
      blockers.push(`import from '${source}' is not convertible yet`);
      return;
    }
    for (const specifier of path.node.specifiers ?? []) {
      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.imported.name === 'css'
      ) {
        cssLocalName = specifier.local.name;
      } else {
        blockers.push(
          `'@emotion/react' import of '${
            specifier.imported?.name ?? specifier.local?.name ?? '?'
          }' is not convertible yet`,
        );
      }
    }
  });

  return {
    hasPragma: PRAGMA_PATTERN.test(findPragmaText(j, root) ?? ''),
    cssLocalName,
    blockers,
  };
}

function allCommentSlots(j: $FlowFixMe, root: $FlowFixMe): Array<$FlowFixMe> {
  const program = root.get().node.program;
  const slots = [program];
  if (program.body.length > 0) {
    slots.push(program.body[0]);
  }
  return slots;
}

function findPragmaText(j: $FlowFixMe, root: $FlowFixMe): string | null {
  for (const slot of allCommentSlots(j, root)) {
    for (const comment of slot.comments ?? []) {
      if (PRAGMA_PATTERN.test(comment.value)) {
        return comment.value;
      }
    }
  }
  return null;
}

/** Removes the `@jsxImportSource @emotion/react` pragma comment. */
export function removePragma(j: $FlowFixMe, root: $FlowFixMe): void {
  for (const slot of allCommentSlots(j, root)) {
    if (slot.comments != null) {
      slot.comments = slot.comments.filter(
        (comment: $FlowFixMe) => !PRAGMA_PATTERN.test(comment.value),
      );
    }
  }
}

/**
 * Removes the `css` specifier from the `@emotion/react` import (the whole
 * declaration when nothing else remains), transplanting any non-pragma
 * comments onto the next statement so file headers survive.
 */
export function removeCssImport(j: $FlowFixMe, root: $FlowFixMe): void {
  root.find(j.ImportDeclaration).forEach((path: $FlowFixMe) => {
    if (String(path.node.source.value) !== '@emotion/react') {
      return;
    }
    const remaining = (path.node.specifiers ?? []).filter(
      (specifier: $FlowFixMe) =>
        !(
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === 'css'
        ),
    );
    if (remaining.length > 0) {
      path.node.specifiers = remaining;
      return;
    }
    const comments = (path.node.comments ?? []).filter(
      (comment: $FlowFixMe) =>
        comment.leading === true && !PRAGMA_PATTERN.test(comment.value),
    );
    const next = path.parent.node.body[path.name + 1];
    if (comments.length > 0 && next != null) {
      next.comments = [...comments, ...(next.comments ?? [])];
    }
    j(path).remove();
  });
}

/**
 * Inserts `import * as stylex from '@stylexjs/stylex';` after the last
 * import. Detection of a pre-existing StyleX import is a blocker upstream
 * (registry merge lands in M4), so this never duplicates.
 */
export function insertStylexImport(j: $FlowFixMe, root: $FlowFixMe): void {
  const declaration = j.importDeclaration(
    [j.importNamespaceSpecifier(j.identifier('stylex'))],
    j.literal('@stylexjs/stylex'),
  );
  const imports = root.find(j.ImportDeclaration);
  if (imports.size() > 0) {
    j(imports.paths()[imports.size() - 1]).insertAfter(declaration);
  } else {
    root.get().node.program.body.unshift(declaration);
  }
}
