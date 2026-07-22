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
  +keyframesLocalName: string | null,
  +blockers: Array<string>,
};

// Named @emotion/react imports the adapter knows how to convert.
const CONVERTIBLE_IMPORTS = new Set(['css', 'keyframes']);

export function analyzeEmotionWiring(
  j: $FlowFixMe,
  root: $FlowFixMe,
): EmotionWiring {
  let cssLocalName: string | null = null;
  let keyframesLocalName: string | null = null;
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
      const imported =
        specifier.type === 'ImportSpecifier' ? specifier.imported.name : null;
      if (imported === 'css') {
        cssLocalName = specifier.local.name;
      } else if (imported === 'keyframes') {
        keyframesLocalName = specifier.local.name;
      } else {
        blockers.push(
          `'@emotion/react' import of '${
            imported ?? specifier.local?.name ?? '?'
          }' is not convertible yet`,
        );
      }
    }
  });

  return {
    hasPragma: PRAGMA_PATTERN.test(findPragmaText(j, root) ?? ''),
    cssLocalName,
    keyframesLocalName,
    blockers,
  };
}

// The pragma can attach to the program or to whichever top-level statement
// leads the file — and that statement's index shifts once we insert the stylex
// import. Scanning every top-level statement finds it regardless of position.
function allCommentSlots(j: $FlowFixMe, root: $FlowFixMe): Array<$FlowFixMe> {
  const program = root.get().node.program;
  return [program, ...program.body];
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

/**
 * Removes the `@jsxImportSource @emotion/react` pragma — but only when no
 * `css` prop remains (a flagged, still-Emotion site needs the pragma).
 */
export function removePragma(j: $FlowFixMe, root: $FlowFixMe): void {
  if (root.find(j.JSXAttribute, { name: { name: 'css' } }).size() > 0) {
    return;
  }
  for (const slot of allCommentSlots(j, root)) {
    if (slot.comments != null) {
      slot.comments = slot.comments.filter(
        (comment: $FlowFixMe) => !PRAGMA_PATTERN.test(comment.value),
      );
    }
  }
}

/**
 * Whether an identifier name is still referenced AS A VALUE — not as its own
 * import specifier, a member-access property (`stylex.keyframes`), or an
 * object key. Without those exclusions the newly-emitted `stylex.keyframes`
 * property would be mistaken for a use of the Emotion `keyframes` import.
 */
function isStillReferenced(
  j: $FlowFixMe,
  root: $FlowFixMe,
  name: string,
): boolean {
  return (
    root
      .find(j.Identifier, { name })
      .filter((path: $FlowFixMe) => {
        const parent = path.parent.node;
        if (parent.type === 'ImportSpecifier') {
          return false;
        }
        if (
          parent.type === 'MemberExpression' &&
          parent.property === path.node &&
          !parent.computed
        ) {
          return false;
        }
        if (
          (parent.type === 'Property' || parent.type === 'ObjectProperty') &&
          parent.key === path.node &&
          !parent.computed
        ) {
          return false;
        }
        return true;
      })
      .size() > 0
  );
}

/**
 * Removes the converted specifiers (`css`, `keyframes`) from the
 * `@emotion/react` import — but only those whose local name is no longer
 * referenced (a flagged tagged-template still using `css` keeps it). Drops the
 * whole declaration when nothing remains, transplanting any non-pragma
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
          CONVERTIBLE_IMPORTS.has(specifier.imported.name) &&
          !isStillReferenced(j, root, specifier.local.name)
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
