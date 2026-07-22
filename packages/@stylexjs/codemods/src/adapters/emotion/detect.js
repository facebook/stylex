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

import { REASONS } from '../../core/todos';

export type ConvertibleSite = {
  +kind: 'convertible',
  +attrPath: $FlowFixMe, // JSXAttribute path
  +objectNode: $FlowFixMe, // the style ObjectExpression
  +tagName: string,
};
export type FlaggedSite = {
  +kind: 'flagged',
  +attrPath: $FlowFixMe,
  +tagName: string,
  +reason: string,
};
export type StyleSite = ConvertibleSite | FlaggedSite;

export type Detection = {
  +sites: Array<StyleSite>,
  +blockers: Array<string>,
};

/**
 * Classifies every `css` prop as convertible (a static object) or flagged
 * (with a reason). M5: a flagged site no longer skips the file — it gets a
 * `// TODO(stylex-migration): …` marker while the rest of the file converts.
 */
export function detectSites(
  j: $FlowFixMe,
  root: $FlowFixMe,
  cssLocalName: string | null,
): Detection {
  const sites: Array<StyleSite> = [];
  const blockers: Array<string> = [];

  root
    .find(j.JSXAttribute, { name: { name: 'css' } })
    .forEach((path: $FlowFixMe) => {
      const opening = path.parent.node;
      const nameNode = opening.name;
      const tagName = String(nameNode.name ?? '?');
      const flag = (reason: string) =>
        sites.push({ kind: 'flagged', attrPath: path, tagName, reason });

      if (nameNode.type !== 'JSXIdentifier' || !/^[a-z]/.test(tagName)) {
        flag(REASONS.componentElement);
        return;
      }
      const conflicting = (opening.attributes ?? []).find(
        (attr: $FlowFixMe) =>
          attr.type === 'JSXSpreadAttribute' ||
          attr.name?.name === 'className' ||
          attr.name?.name === 'style',
      );
      if (conflicting != null) {
        flag(REASONS.propConflict);
        return;
      }
      const container = path.node.value;
      if (container?.type !== 'JSXExpressionContainer') {
        flag('css prop is not an expression');
        return;
      }
      const expression = container.expression;
      if (expression.type === 'ObjectExpression') {
        sites.push({
          kind: 'convertible',
          attrPath: path,
          objectNode: expression,
          tagName,
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
        sites.push({
          kind: 'convertible',
          attrPath: path,
          objectNode: expression.arguments[0],
          tagName,
        });
        return;
      }
      flag(
        expression.type === 'TaggedTemplateExpression'
          ? REASONS.templateLiteral
          : REASONS.dynamicValue,
      );
    });

  return { sites, blockers };
}

export type ExistingRegistry = {
  +objectNode: $FlowFixMe, // the ObjectExpression passed to stylex.create
  +varName: string, // the `const <varName> = stylex.create(...)` binding
  +keys: $ReadOnlySet<string>, // existing style-name keys
};

export type RegistryDetection = {
  +registry: ExistingRegistry | null,
  +stylexImported: boolean,
  +blockers: Array<string>,
};

/**
 * Finds a pre-existing `import * as stylex` + `const X = stylex.create({...})`
 * so new styles can be MERGED into it (M4) rather than the file being refused.
 * Anything non-standard (stylex imported by a name other than a namespace,
 * ≥2 creates, a non-object/non-const create) is a blocker.
 */
export function detectExistingRegistry(
  j: $FlowFixMe,
  root: $FlowFixMe,
): RegistryDetection {
  const blockers: Array<string> = [];

  const stylexImport = root
    .find(j.ImportDeclaration)
    .filter(
      (path: $FlowFixMe) =>
        String(path.node.source.value) === '@stylexjs/stylex',
    );
  if (stylexImport.size() === 0) {
    return { registry: null, stylexImported: false, blockers };
  }

  const specifiers = stylexImport.paths()[0].node.specifiers ?? [];
  const namespace = specifiers.find(
    (s: $FlowFixMe) => s.type === 'ImportNamespaceSpecifier',
  );
  if (specifiers.length !== 1 || namespace == null) {
    blockers.push(
      'file imports @stylexjs/stylex in a non-namespace form (merge needs `import * as stylex`)',
    );
    return { registry: null, stylexImported: true, blockers };
  }
  const stylexLocal = namespace.local.name;

  const registries: Array<ExistingRegistry> = [];
  root
    .find(j.CallExpression)
    .filter(
      (path: $FlowFixMe) =>
        path.node.callee.type === 'MemberExpression' &&
        path.node.callee.object.type === 'Identifier' &&
        path.node.callee.object.name === stylexLocal &&
        path.node.callee.property.name === 'create',
    )
    .forEach((path: $FlowFixMe) => {
      const declarator = path.parent.node;
      const arg = path.node.arguments[0];
      if (
        declarator.type !== 'VariableDeclarator' ||
        declarator.id.type !== 'Identifier' ||
        arg?.type !== 'ObjectExpression'
      ) {
        blockers.push(
          'pre-existing stylex.create is not a simple const object',
        );
        return;
      }
      const keys = new Set<string>();
      for (const prop of arg.properties) {
        if (prop.key?.type === 'Identifier') {
          keys.add(prop.key.name);
        } else if (
          prop.key?.type === 'Literal' ||
          prop.key?.type === 'StringLiteral'
        ) {
          keys.add(String(prop.key.value));
        }
      }
      registries.push({ objectNode: arg, varName: declarator.id.name, keys });
    });

  if (registries.length > 1) {
    blockers.push('file has ≥2 stylex.create registries (merge targets one)');
    return { registry: null, stylexImported: true, blockers };
  }

  return {
    registry: registries[0] ?? null,
    stylexImported: true,
    blockers,
  };
}

export type KeyframesSite = {
  +callPath: $FlowFixMe, // CallExpression path (keyframes({...}))
  +objectNode: $FlowFixMe, // the frames ObjectExpression
  +varName: string, // the `const <varName> = keyframes(...)` binding
};

export type KeyframesDetection = {
  +sites: Array<KeyframesSite>,
  +names: Set<string>,
  +blockers: Array<string>,
};

/**
 * Finds `const NAME = keyframes({ ... })` declarations. Only the object form
 * bound to a simple `const` is convertible; anything else (tagged template,
 * inline, reassignment) is a blocker.
 */
export function detectKeyframes(
  j: $FlowFixMe,
  root: $FlowFixMe,
  keyframesLocalName: string | null,
): KeyframesDetection {
  const sites: Array<KeyframesSite> = [];
  const names: Set<string> = new Set();
  const blockers: Array<string> = [];
  if (keyframesLocalName == null) {
    return { sites, names, blockers };
  }

  const siteCallees = new Set<$FlowFixMe>();
  root
    .find(j.CallExpression)
    .filter(
      (path: $FlowFixMe) =>
        path.node.callee.type === 'Identifier' &&
        path.node.callee.name === keyframesLocalName,
    )
    .forEach((path: $FlowFixMe) => {
      const declarator = path.parent.node;
      const isSimpleConstBinding =
        declarator.type === 'VariableDeclarator' &&
        declarator.init === path.node &&
        declarator.id.type === 'Identifier';
      const arg = path.node.arguments[0];
      if (
        !isSimpleConstBinding ||
        path.node.arguments.length !== 1 ||
        arg.type !== 'ObjectExpression'
      ) {
        blockers.push(
          'keyframes() must be an object bound to a const to convert ' +
            '(tagged-template or inline keyframes land later)',
        );
        return;
      }
      siteCallees.add(path.node.callee);
      names.add(declarator.id.name);
      sites.push({
        callPath: path,
        objectNode: arg,
        varName: declarator.id.name,
      });
    });

  // Any other use of the keyframes identifier (not a convertible call, not
  // the import) means we cannot fully remove it — refuse.
  root
    .find(j.Identifier, { name: keyframesLocalName })
    .forEach((path: $FlowFixMe) => {
      const parentNode = path.parent.node;
      if (
        parentNode.type === 'ImportSpecifier' ||
        siteCallees.has(path.node) ||
        (parentNode.type === 'Property' && parentNode.key === path.node)
      ) {
        return;
      }
      blockers.push(
        `'${keyframesLocalName}' is used in an unsupported position`,
      );
    });

  return { sites, names, blockers };
}
