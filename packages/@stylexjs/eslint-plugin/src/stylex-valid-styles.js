/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import getDistance from './utils/getDistance';
import isWhiteSpaceOrEmpty from './utils/isWhiteSpaceOrEmpty';
import type {
  CallExpression,
  Directive,
  Expression,
  Identifier,
  ImportDeclaration,
  ModuleDeclaration,
  Node,
  ObjectExpression,
  Pattern,
  Program,
  Property,
  Literal,
  Statement,
  VariableDeclaration,
  VariableDeclarator,
  PrivateIdentifier,
} from 'estree';
import micromatch from 'micromatch';
/*:: import { Rule } from 'eslint'; */
import makeLiteralRule from './rules/makeLiteralRule';
import isString from './rules/isString';
import makeUnionRule from './rules/makeUnionRule';
import isNumber from './rules/isNumber';
import isAnimationName from './rules/isAnimationName';
import isPositionTryFallbacks from './rules/isPositionTryFallbacks';
import isStylexResolvedVarsToken from './rules/isStylexResolvedVarsToken';
import isCSSVariable from './rules/isCSSVariable';
import evaluate from './utils/evaluate';
import resolveKey from './utils/resolveKey';
import {
  CSSPropertyKeys,
  CSSProperties,
  CSSPropertyReplacements,
  pseudoElements,
  convertToStandardProperties,
  pseudoClassesAndAtRules,
  allModifiers,
  all,
} from './reference/cssProperties';

export type Variables = $ReadOnlyMap<string, Expression | 'ARG'>;
export type RuleCheck = (
  node: $ReadOnly<Expression | Pattern>,
  variables?: Variables,
  prop?: $ReadOnly<Property>,
  context?: Rule.RuleContext,
) => RuleResponse;
export type RuleResponse = void | {
  message: string,
  distance?: number,
  suggest?: {
    fix: Rule.ReportFixer,
    desc: string,
  },
};

const showError =
  (message: string): RuleCheck =>
  () => ({ message });

const stylexValidStyles = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
    fixable: 'code',
    docs: {
      descriptions: 'Enforce that you create valid stylex styles',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          validImports: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    from: { type: 'string' },
                    as: { type: 'string' },
                  },
                },
              ],
            },
            default: ['stylex', '@stylexjs/stylex'],
          },
          allowRawCSSVars: {
            type: 'boolean',
            default: true,
          },
          allowOuterPseudoAndMedia: {
            type: 'boolean',
            default: false,
          },
          banPropsForLegacy: {
            type: 'boolean',
            default: false,
          },
          propLimits: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                limit: {
                  oneOf: [
                    { type: 'null' },
                    { type: 'string' },
                    { type: 'number' },
                    {
                      type: 'array',
                      items: {
                        oneOf: [
                          { type: 'null' },
                          { type: 'string' },
                          { type: 'number' },
                        ],
                      },
                    },
                  ],
                },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    ],
  },
  create(context: Rule.RuleContext): { ... } {
    const variables = new Map<string, Expression | 'ARG'>();
    const dynamicStyleVariables = new Set<string>();

    const legacyReason =
      'This property is not supported in legacy StyleX resolution.';

    type PropLimits = {
      [string]: {
        limit: null | string | number | Array<string | number>,
        reason: string,
      },
    };

    type Schema = {
      validImports: Array<
        | string
        | {
            from: string,
            as: string,
          },
      >,
      allowRawCSSVars: boolean,
      allowOuterPseudoAndMedia: boolean,
      banPropsForLegacy: boolean,
      propLimits?: PropLimits,
    };

    const legacyProps: PropLimits = {
      'grid*': { limit: null, reason: legacyReason },
      'mask+([a-zA-Z])': { limit: null, reason: legacyReason },
      blockOverflow: { limit: null, reason: legacyReason },
      inlineOverflow: { limit: null, reason: legacyReason },
      transitionProperty: {
        limit: ['opacity', 'transform', 'opacity, transform', 'none'],
        reason: legacyReason,
      },
    };

    const {
      validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'],
      allowRawCSSVars = true,
      allowOuterPseudoAndMedia,
      banPropsForLegacy = false,
      propLimits = {},
    }: Schema = context.options[0] || {};

    /**
     * Check if a file has a valid extension for StyleX variable imports.
     *
     * `.stylex`: used when importing `defineVars` or `defineConsts`. This prevents
     *   the linter/compiler from marking imports as unresolved and allows computed
     *   keys in those cases.
     *
     * `.transformed`: used for files that have already been processed by a custom
     *   transform that pre-resolve StyleX variables to silence ESLint/compiler errors.
     *
     */
    function isValidStylexResolvedVarsFileExtension(filename: string) {
      const baseExtensions = ['.stylex', '.transformed'];
      const extensions = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs'];
      return ['', ...extensions].some((ext) =>
        baseExtensions.some((base) => filename.endsWith(`${base}${ext}`)),
      );
    }
    const stylexResolvedVarsTokenImports = new Set<string>();
    const styleXDefaultImports = new Set<string>();
    const styleXCreateImports = new Set<string>();
    const styleXKeyframesImports = new Set<string>();
    const styleXPositionTryImports = new Set<string>();

    const overrides: PropLimits = {
      ...(banPropsForLegacy ? legacyProps : {}),
      ...propLimits,
    };

    const CSSPropertiesWithOverrides: { [string]: RuleCheck } = {
      ...CSSProperties,
      // TODO change this to a special function that looks for stylex.keyframes call
      animationName: makeUnionRule(
        makeLiteralRule('none'),
        isAnimationName(styleXDefaultImports, styleXKeyframesImports),
        all,
      ),
      positionTryFallbacks: makeUnionRule(
        makeLiteralRule('none'),
        isCSSVariable,
        isPositionTryFallbacks(styleXDefaultImports, styleXPositionTryImports),
        all,
      ),
    };
    for (const overrideKey in overrides) {
      const { limit, reason } = overrides[overrideKey];
      const overrideValue =
        limit === null
          ? showError(reason)
          : limit === '*'
            ? makeUnionRule(isString, isNumber, all)
            : limit === 'string'
              ? makeUnionRule(isString, all)
              : limit === 'number'
                ? makeUnionRule(isNumber, all)
                : typeof limit === 'string' || typeof limit === 'number'
                  ? makeUnionRule(limit, all)
                  : Array.isArray(limit)
                    ? makeUnionRule(
                        ...limit.map((l) => {
                          if (l === '*') {
                            return makeUnionRule(isString, isNumber);
                          }
                          if (l === 'string') {
                            return isString;
                          }
                          if (l === 'number') {
                            return isNumber;
                          }
                          return l;
                        }),
                        all,
                      )
                    : undefined;
      if (overrideValue === undefined) {
        // skip
        continue;
      }
      if (overrideKey.includes('*') || overrideKey.includes('+')) {
        for (const key in CSSPropertiesWithOverrides) {
          if (micromatch.isMatch(key, overrideKey)) {
            CSSPropertiesWithOverrides[key] = overrideValue;
          }
        }
      } else {
        CSSPropertiesWithOverrides[overrideKey] = overrideValue;
      }
    }

    function isStylexCallee(node: Node) {
      return (
        (node.type === 'MemberExpression' &&
          node.object.type === 'Identifier' &&
          styleXDefaultImports.has(node.object.name) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'create') ||
        (node.type === 'Identifier' && styleXCreateImports.has(node.name))
      );
    }

    function isStylexDeclaration(node: $ReadOnly<{ ...Node, ... }>) {
      return (
        node &&
        node.type === 'CallExpression' &&
        isStylexCallee(node.callee) &&
        node.arguments.length === 1
      );
    }

    function checkStyleProperty(
      style: Node,
      level: number,
      propName: null | string,
    ): void {
      // currently ignoring preset spreads.
      if (style.type === 'Property') {
        // const styleAsProperty: Property = style;
        if (style.value.type === 'ObjectExpression') {
          const styleValue: ObjectExpression = style.value;
          // TODO: Remove this soon
          // But we want to make sure that the same "condition" isn't repeated
          if (level > 0 && propName == null) {
            return context.report({
              node: style.value as Node,
              loc: style.value.loc,
              message: 'You cannot nest styles more than one level deep',
            } as Rule.ReportDescriptor);
          }
          const key = style.key;
          if (key.type === 'PrivateIdentifier') {
            return context.report({
              node: key,
              loc: key.loc,
              message: 'Private properties are not allowed in stylex',
            } as Rule.ReportDescriptor);
          }
          const keyName =
            key.type === 'Literal'
              ? key.value
              : key.type === 'Identifier'
                ? !style.computed
                  ? key.name
                  : resolveKey(key, variables)
                : null;
          if (isStylexResolvedVarsToken(key, stylexResolvedVarsTokenImports)) {
            return undefined;
          }
          if (
            typeof keyName !== 'string' ||
            (key.type !== 'Literal' && key.type !== 'Identifier')
          ) {
            return context.report({
              node: key,
              loc: key.loc,
              message: 'Keys must be strings',
            } as Rule.ReportDescriptor);
          }
          if (keyName.startsWith('@') || keyName.startsWith(':')) {
            if (level === 0) {
              const ruleCheck = (
                allowOuterPseudoAndMedia ? allModifiers : pseudoElements
              )(key, variables);

              if (ruleCheck !== undefined) {
                if (keyName.startsWith('::')) {
                  return context.report({
                    node: style.value,
                    loc: style.value.loc,
                    message: `Unknown pseudo element "${keyName}"`,
                  } as $ReadOnly<Rule.ReportDescriptor>);
                }
                return context.report({
                  node: style.value,
                  loc: style.value.loc,
                  message: allowOuterPseudoAndMedia
                    ? 'Nested styles can only be used for the pseudo selectors in the stylex allowlist and for @media queries'
                    : 'Pseudo Classes, Media Queries and other At Rules should be nested as conditions within style properties. Only Pseudo Elements (::after) are allowed at the top-level',
                } as $ReadOnly<Rule.ReportDescriptor>);
              }
            } else {
              const ruleCheck = pseudoClassesAndAtRules(key, variables);

              if (ruleCheck !== undefined) {
                return context.report({
                  node: style.value,
                  loc: style.value.loc,
                  message:
                    'Invalid Pseudo class or At Rule used for conditional style value',
                } as $ReadOnly<Rule.ReportDescriptor>);
              }
            }
          }

          return styleValue.properties.forEach((prop) =>
            checkStyleProperty(
              prop,
              level + 1,
              propName ??
                (keyName.startsWith('@') ||
                keyName.startsWith(':') ||
                keyName === 'default'
                  ? null
                  : keyName),
            ),
          );
        }
        let styleKey: Expression | PrivateIdentifier = style.key;
        if (styleKey.type === 'PrivateIdentifier') {
          return context.report({
            node: styleKey,
            loc: styleKey.loc,
            message: 'Private properties are not allowed in stylex',
          } as Rule.ReportDescriptor);
        }
        if (
          isStylexResolvedVarsToken(styleKey, stylexResolvedVarsTokenImports)
        ) {
          return undefined;
        }
        if (style.computed && styleKey.type !== 'Literal') {
          const val = evaluate(styleKey, variables);
          if (val == null) {
            return context.report({
              node: style.key,
              loc: style.key.loc,
              message: 'Computed key cannot be resolved.',
            } as Rule.ReportDescriptor);
          } else if (val === 'ARG') {
            return context.report({
              node: style.key,
              loc: style.key.loc,
              message: 'Computed key cannot depend on function argument',
            } as Rule.ReportDescriptor);
          } else {
            styleKey = val;
          }
        }
        if (styleKey.type !== 'Literal' && styleKey.type !== 'Identifier') {
          return context.report({
            node: styleKey,
            loc: styleKey.loc,
            message:
              'All keys in a stylex object must be static literal values.',
          } as Rule.ReportDescriptor);
        }
        const key =
          propName ??
          (styleKey.type === 'Identifier' ? styleKey.name : styleKey.value);
        if (typeof key !== 'string') {
          return context.report({
            node: styleKey,
            loc: styleKey.loc,
            message:
              'All keys in a stylex object must be static literal string values.',
          } as Rule.ReportDescriptor);
        }
        if (CSSPropertyReplacements[key] != null) {
          const propCheck: RuleCheck = CSSPropertyReplacements[key];
          // eslint-disable-next-line no-unused-vars
          const val: Property = style;
          const check = propCheck(style.value, variables, style);
          if (check != null) {
            const { message, suggest } = check;
            const diagnostic: Rule.ReportDescriptor = {
              node: style,
              loc: style.loc,
              message,
              suggest: suggest != null ? [suggest] : undefined,
            };
            return context.report(diagnostic);
          }
        }
        const ruleChecker = CSSPropertiesWithOverrides[key];
        if (ruleChecker == null) {
          if (allowRawCSSVars && micromatch.isMatch(key, '--*')) {
            return;
          }

          const closestKey = CSSPropertyKeys.find((cssProp) => {
            const distance = getDistance(key, cssProp, 2);
            return distance <= 2;
          });

          const replacementKey =
            style.key.type === 'Identifier' &&
            convertToStandardProperties[style.key.name]
              ? convertToStandardProperties[style.key.name]
              : style.key.type === 'Literal' &&
                  typeof style.key.value === 'string' &&
                  convertToStandardProperties[style.key.value]
                ? convertToStandardProperties[style.key.value]
                : null;

          let originalKey = '';

          if (style.key.type === 'Identifier') {
            originalKey = style.key.name;
          } else if (
            style.key.type === 'Literal' &&
            typeof style.key.value === 'string'
          ) {
            originalKey = style.key.value;
          }

          return context.report({
            node: style.key,
            loc: style.key.loc,
            message:
              replacementKey &&
              (style.key.type === 'Identifier' || style.key.type === 'Literal')
                ? `The key "${originalKey}" is not a standard CSS property. Did you mean "${replacementKey}"?`
                : 'This is not a key that is allowed by stylex',
            fix: (fixer) => {
              if (replacementKey) {
                return fixer.replaceText(style.key, replacementKey);
              }
              return null;
            },
            suggest:
              closestKey != null
                ? [
                    {
                      desc: `Did you mean "${closestKey}"?`,
                      fix: (fixer) => {
                        if (style.key.type === 'Identifier') {
                          return fixer.replaceText(style.key, closestKey);
                        } else if (
                          style.key.type === 'Literal' &&
                          (typeof style.key.value === 'string' ||
                            typeof style.key.value === 'number' ||
                            typeof style.key.value === 'boolean' ||
                            style.key.value == null)
                        ) {
                          const styleKey: Literal = style.key;
                          const raw = style.key.raw;
                          if (raw != null) {
                            const quoteType = raw.substr(0, 1);
                            return fixer.replaceText(
                              styleKey,
                              `${quoteType}${closestKey}${quoteType}`,
                            );
                          }
                        }
                        return null;
                      },
                    },
                  ]
                : undefined,
          } as Rule.ReportDescriptor);
        }
        if (typeof ruleChecker !== 'function') {
          throw new TypeError(`CSSProperties[${key}] is not a function`);
        }

        const isReferencingStylexDefineVarsTokens =
          stylexResolvedVarsTokenImports.size > 0 &&
          isStylexResolvedVarsToken(
            style.value,
            stylexResolvedVarsTokenImports,
          );
        if (!isReferencingStylexDefineVarsTokens) {
          let varsWithFnArgs: Map<string, Expression | 'ARG'> = variables;
          if (dynamicStyleVariables.size > 0) {
            varsWithFnArgs = new Map();
            for (const [key, value] of variables) {
              varsWithFnArgs.set(key, value);
            }
            for (const key of dynamicStyleVariables) {
              varsWithFnArgs.set(key, 'ARG');
            }
          }

          if (
            (key === 'float' || key === 'clear') &&
            style.value.type === 'Literal' &&
            typeof style.value.value === 'string' &&
            (style.value.value === 'start' || style.value.value === 'end')
          ) {
            const replacement =
              style.value.value === 'start' ? 'inline-start' : 'inline-end';
            return context.report({
              node: style.value,
              loc: style.value.loc,
              message: `The value "${style.value.value}" is not a standard CSS value for "${key}". Did you mean "${replacement}"?`,
              fix: (fixer) =>
                fixer.replaceText(style.value, `'${replacement}'`),
              suggest: [
                {
                  desc: `Replace "${style.value.value}" with "${replacement}"?`,
                  fix: (fixer) =>
                    fixer.replaceText(style.value, `'${replacement}'`),
                },
              ],
            } as Rule.ReportDescriptor);
          }

          const check = ruleChecker(
            style.value,
            varsWithFnArgs,
            style,
            context,
          );
          if (check != null) {
            const { message, suggest } = check;
            return context.report({
              node: style.value,
              loc: style.value.loc,
              message: `${key} value must be one of:\n${message}${
                key === 'lineHeight'
                  ? '\nBe careful when fixing: lineHeight: 10px is not the same as lineHeight: 10'
                  : ''
              }`,
              suggest: suggest != null ? [suggest] : undefined,
            } as Rule.ReportDescriptor);
          }
          if (
            style.value.type === 'Literal' &&
            typeof style.value.value === 'string' &&
            isWhiteSpaceOrEmpty(style.value.value) &&
            styleKey.name !== 'content'
          ) {
            return context.report({
              node: style.value,
              loc: style.value.loc,
              message: 'The empty string is not allowed by Stylex.',
            } as Rule.ReportDescriptor);
          }
        }
      }
    }

    return {
      Program(node: Program) {
        // Keep track of all the top-level local variable declarations
        // This is because stylex allows you to use local constants in your styles

        // const body = node.body;
        // for (let statement of body) {

        // }

        const vars = node.body
          .reduce(
            (
              collection: Array<VariableDeclaration>,
              node: Statement | ModuleDeclaration | Directive,
            ) => {
              if (node.type === 'VariableDeclaration') {
                collection.push(node);
              }
              return collection;
            },
            [],
          )
          .map(
            (
              constDecl: VariableDeclaration,
            ): $ReadOnlyArray<VariableDeclarator> => constDecl.declarations,
          )
          .reduce(
            (
              arr: $ReadOnlyArray<VariableDeclarator>,
              curr: $ReadOnlyArray<VariableDeclarator>,
            ) => arr.concat(curr),
            [],
          );

        const [requires, others] = vars.reduce(
          (acc, decl) => {
            if (
              decl.init != null &&
              decl.init.type === 'CallExpression' &&
              decl.init.callee.type === 'Identifier' &&
              decl.init.callee.name === 'require'
            ) {
              acc[0].push(decl);
            } else {
              acc[1].push(decl);
            }
            return acc;
          },
          [[] as Array<VariableDeclarator>, [] as Array<VariableDeclarator>],
        );

        requires.forEach((decl: VariableDeclarator) => {
          // detect requires of "stylex" and "@stylexjs/stylex"
          if (
            decl.init != null &&
            decl.init.type === 'CallExpression' &&
            decl.init.callee.type === 'Identifier' &&
            decl.init.callee.name === 'require' &&
            decl.init.arguments.length === 1 &&
            decl.init.arguments[0].type === 'Literal' &&
            importsToLookFor.includes(decl.init.arguments[0].value)
          ) {
            if (decl.id.type === 'Identifier') {
              styleXDefaultImports.add(decl.id.name);
            }
            if (decl.id.type === 'ObjectPattern') {
              decl.id.properties.forEach((prop) => {
                if (
                  prop.type === 'Property' &&
                  prop.key.type === 'Identifier' &&
                  prop.key.name === 'create' &&
                  !prop.computed &&
                  prop.value.type === 'Identifier'
                ) {
                  styleXCreateImports.add(prop.value.name);
                }
              });
            }
          }
        });

        others
          .filter((decl) => decl.id.type === 'Identifier')
          .forEach((decl: VariableDeclarator) => {
            const id: ?Identifier =
              decl.id.type === 'Identifier' ? decl.id : null;
            const init = decl.init;
            if (id != null && init != null) {
              variables.set(id.name, init);
            }
          });
      },
      ImportDeclaration(node: ImportDeclaration) {
        if (
          node.source.type !== 'Literal' ||
          typeof node.source.value !== 'string'
        ) {
          return;
        }
        const sourceValue = node.source.value;

        const foundImportSource = importsToLookFor.find((importSource) => {
          if (typeof importSource === 'string') {
            return importSource === sourceValue;
          }
          return importSource.from === sourceValue;
        });

        const isStylexImport = foundImportSource !== undefined;
        const isStylexResolvedVarsImport =
          isValidStylexResolvedVarsFileExtension(sourceValue);

        if (!(isStylexImport || isStylexResolvedVarsImport)) {
          return;
        }
        if (isStylexImport) {
          if (typeof foundImportSource === 'string') {
            node.specifiers.forEach((specifier) => {
              if (
                specifier.type === 'ImportDefaultSpecifier' ||
                specifier.type === 'ImportNamespaceSpecifier'
              ) {
                styleXDefaultImports.add(specifier.local.name);
              }
              if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === 'create'
              ) {
                styleXCreateImports.add(specifier.local.name);
              }
              if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === 'keyframes'
              ) {
                styleXKeyframesImports.add(specifier.local.name);
              }
              if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === 'positionTry'
              ) {
                styleXPositionTryImports.add(specifier.local.name);
              }
            });
          }

          if (typeof foundImportSource === 'object') {
            node.specifiers.forEach((specifier) => {
              if (specifier.type === 'ImportSpecifier') {
                if (specifier.imported.name === foundImportSource.as) {
                  styleXDefaultImports.add(specifier.local.name);
                }
              }
            });
          }
        }

        if (isStylexResolvedVarsImport) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              stylexResolvedVarsTokenImports.add(specifier.local.name);
            }
          });
        }
      },
      CallExpression(node: { ...CallExpression, ...Rule.NodeParentExtension }) {
        if (!isStylexDeclaration(node)) {
          return;
        }

        const namespaces = node.arguments[0];
        // const loc: ?AST['SourceLocation'] = namespaces.loc;
        if (namespaces.type !== 'ObjectExpression') {
          return context.report({
            node: namespaces,
            loc: namespaces.loc,
            message: 'Styles must be represented as JavaScript objects',
          } as Rule.ReportDescriptor);
        }

        namespaces.properties.forEach((namespace) => {
          if (namespace.type !== 'Property') {
            return context.report({
              node: namespace,
              loc: namespace.loc,
              message: 'Styles cannot be spread objects',
            });
          }

          let styles = namespace.value;

          if (styles.type !== 'ObjectExpression') {
            if (
              styles.type === 'ArrowFunctionExpression' &&
              (styles.body.type === 'ObjectExpression' ||
                // $FlowFixMe
                (styles.body.type === 'TSAsExpression' &&
                  styles.body.expression.type === 'ObjectExpression'))
            ) {
              const params = styles.params;
              styles = styles.body;
              // $FlowFixMe
              if (styles.type === 'TSAsExpression') {
                styles = styles.expression;
              }
              if (params.some((param) => param.type !== 'Identifier')) {
                return params
                  .filter((param) => param.type !== 'Identifier')
                  .forEach((param) => {
                    context.report({
                      node: param,
                      loc: param.loc,
                      message:
                        'Dynamic Styles can only accept named parameters. Destructuring, spreading or default parameters are not allowed.',
                    });
                  });
              }
              params.forEach((param) => {
                if (param.type === 'Identifier') {
                  dynamicStyleVariables.add(param.name);
                }
              });
            } else {
              return context.report({
                node: namespace.value,
                loc: namespace.value.loc,
                message:
                  'Styles must be represented as JavaScript objects, not ' +
                  styles.type,
              });
            }
          }
          styles.properties.forEach((prop) =>
            checkStyleProperty(prop, 0, null),
          );
          // Reset local variables.
          dynamicStyleVariables.clear();
        });
      },
      'Program:exit'() {
        variables.clear();
      },
    };
  },
};
export default stylexValidStyles as typeof stylexValidStyles;
/* eslint-enable object-shorthand */
