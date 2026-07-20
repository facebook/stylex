/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L2 — Detect. Finds every Emotion style site in the file and everything
 * that makes the file unconvertible. M1 policy (user-ratified): a file is
 * converted only if EVERY style site is convertible; a single blocker
 * skips the whole file untouched.
 *
 * Convertible site forms:
 *   <div css={{ ... }} />          — object literal
 *   <div css={css({ ... })} />     — inline `css()` call around an object
 * on host (lowercase) elements with no `className`/`style`/spread props.
 */

export type StyleSite = {
  +attrPath: $FlowFixMe, // JSXAttribute path
  +objectNode: $FlowFixMe, // the style ObjectExpression
  +tagName: string,
};

export type Detection = {
  +sites: Array<StyleSite>,
  +blockers: Array<string>,
};

export function detectSites(
  j: $FlowFixMe,
  root: $FlowFixMe,
  cssLocalName: string | null,
): Detection {
  const sites: Array<StyleSite> = [];
  const blockers: Array<string> = [];
  const siteCallees = new Set<$FlowFixMe>();

  root
    .find(j.JSXAttribute, { name: { name: 'css' } })
    .forEach((path: $FlowFixMe) => {
      const opening = path.parent.node;
      const nameNode = opening.name;
      if (nameNode.type !== 'JSXIdentifier' || !/^[a-z]/.test(nameNode.name)) {
        blockers.push(
          'css prop on a component element (className forwarding is not provable)',
        );
        return;
      }
      const conflicting = (opening.attributes ?? []).find(
        (attr: $FlowFixMe) =>
          attr.type === 'JSXSpreadAttribute' ||
          attr.name?.name === 'className' ||
          attr.name?.name === 'style',
      );
      if (conflicting != null) {
        blockers.push(
          `<${nameNode.name}> mixes css with className/style/spread props`,
        );
        return;
      }
      const container = path.node.value;
      if (container?.type !== 'JSXExpressionContainer') {
        blockers.push(`css prop on <${nameNode.name}> is not an expression`);
        return;
      }
      const expression = container.expression;
      if (expression.type === 'ObjectExpression') {
        sites.push({
          attrPath: path,
          objectNode: expression,
          tagName: nameNode.name,
        });
        return;
      }
      if (
        expression.type === 'CallExpression' &&
        expression.callee.type === 'Identifier' &&
        cssLocalName != null &&
        expression.callee.name === cssLocalName &&
        expression.arguments.length === 1 &&
        expression.arguments[0].type === 'ObjectExpression'
      ) {
        siteCallees.add(expression.callee);
        sites.push({
          attrPath: path,
          objectNode: expression.arguments[0],
          tagName: nameNode.name,
        });
        return;
      }
      blockers.push(
        `css prop value form on <${nameNode.name}> is not convertible yet ` +
          '(template literals, arrays, references and dynamic styles land in later milestones)',
      );
    });

  if (cssLocalName != null) {
    root
      .find(j.Identifier, { name: cssLocalName })
      .forEach((path: $FlowFixMe) => {
        const parentNode = path.parent.node;
        if (
          parentNode.type === 'ImportSpecifier' ||
          siteCallees.has(path.node) ||
          (parentNode.type === 'Property' && parentNode.key === path.node) ||
          parentNode.type === 'JSXAttribute'
        ) {
          return;
        }
        blockers.push(
          `'${cssLocalName}' is used outside a convertible css prop ` +
            '(tagged templates / shared style variables land in later milestones)',
        );
      });
  }

  if (
    root
      .find(j.ImportDeclaration)
      .some(
        (path: $FlowFixMe) =>
          String(path.node.source.value) === '@stylexjs/stylex',
      )
  ) {
    blockers.push(
      'file already imports @stylexjs/stylex (registry merge lands in M4)',
    );
  }

  return { sites, blockers };
}
