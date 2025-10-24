/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type {
  CallExpression,
  Directive,
  Expression,
  Identifier,
  Literal,
  ModuleDeclaration,
  Node,
  ObjectExpression,
  Pattern,
  Program,
  Property,
  Statement,
  VariableDeclaration,
  VariableDeclarator,
  PrivateIdentifier,
} from 'estree';
/*:: import { Rule } from 'eslint'; */
import makeLiteralRule from './rules/makeLiteralRule';
import makeUnionRule from './rules/makeUnionRule';
import micromatch from 'micromatch';
import isAnimationName from './rules/isAnimationName';
import isPositionTryFallbacks from './rules/isPositionTryFallbacks';
import isStylexResolvedVarsToken from './rules/isStylexResolvedVarsToken';
import isCSSVariable from './rules/isCSSVariable';
import evaluate from './utils/evaluate';
import resolveKey from './utils/resolveKey';
import { CSSPropertyKeys, CSSProperties, all } from './reference/cssProperties';
import createImportTracker from './utils/createImportTracker';
import getDistance from './utils/getDistance';
import isStylexCreateDeclaration from './utils/isStylexCreateDeclaration';

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

const stylexNoDisallowedProperties = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
    fixable: 'suggest',
    docs: {
      descriptions: 'Flags any property that is not allowed by stylex',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowRawCSSVars: {
            type: 'boolean',
            default: true,
          },
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
        },
      },
    ],
  },
  create(context: Rule.RuleContext): { ... } {
    type Schema = {
      allowRawCSSVars: boolean,
      validImports: Array<
        | string
        | {
            from: string,
            as: string,
          },
      >,
    };
    const {
      allowRawCSSVars = true,
      validImports: importsToLookFor = ['stylex', '@stylexjs/stylex'],
    }: Schema = context.options[0] || {};
    const importTracker = createImportTracker(importsToLookFor);
    const variables = new Map<string, Expression | 'ARG'>();
    const dynamicStyleVariables = new Set<string>();

    const stylexResolvedVarsTokenImports = new Set<string>();
    const styleXDefaultImports = new Set<string>();
    const styleXCreateImports = new Set<string>();
    const styleXKeyframesImports = new Set<string>();
    const styleXPositionTryImports = new Set<string>();

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

    function checkStyleProperty(
      style: Node,
      level: number,
      propName: null | string,
      outerIsPseudoElement: boolean,
    ): void {
      if (style.type !== 'Property') {
        return;
      }
      if (style.value.type === 'ObjectExpression') {
        const styleValue: ObjectExpression = style.value;
        if (
          level > 0 &&
          propName == null &&
          !(outerIsPseudoElement && level === 1)
        ) {
          return;
        }
        const key = style.key;
        if (key.type === 'PrivateIdentifier') {
          return;
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
          return;
        }
        if (
          typeof keyName !== 'string' ||
          (key.type !== 'Literal' && key.type !== 'Identifier')
        ) {
          return;
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
            outerIsPseudoElement ||
              keyName.startsWith('@') ||
              keyName.startsWith(':'),
          ),
        );
      }
      let styleKey: Expression | PrivateIdentifier = style.key;
      if (
        styleKey.type === 'PrivateIdentifier' ||
        isStylexResolvedVarsToken(styleKey, stylexResolvedVarsTokenImports)
      ) {
        return;
      }
      if (style.computed && styleKey.type !== 'Literal') {
        const val = evaluate(styleKey, variables);
        if (val != null && val !== 'ARG') {
          styleKey = val;
        }
      }
      const key =
        propName ??
        (styleKey.type === 'Identifier' ? styleKey.name : styleKey.value);
      if (typeof key !== 'string') {
        return;
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
        return context.report({
          node: style.key,
          loc: style.key.loc,
          message: 'This is not a key that is allowed by stylex',
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
        isStylexResolvedVarsToken(style.value, stylexResolvedVarsTokenImports);
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
            fix: (fixer) => fixer.replaceText(style.value, `'${replacement}'`),
            suggest: [
              {
                desc: `Replace "${style.value.value}" with "${replacement}"?`,
                fix: (fixer) =>
                  fixer.replaceText(style.value, `'${replacement}'`),
              },
            ],
          } as Rule.ReportDescriptor);
        }
      }
    }

    return {
      ImportDeclaration: importTracker.ImportDeclaration,
      Program(node: Program) {
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
      CallExpression(node: CallExpression) {
        if (!isStylexCreateDeclaration(node, importTracker)) {
          return;
        }
        const namespaces = node.arguments[0];
        if (namespaces.type !== 'ObjectExpression') {
          return;
        }

        namespaces.properties.forEach((property) => {
          // we only care about properties with object values
          if (property.type !== 'Property') {
            return;
          }

          let styles = property.value;

          if (
            styles.type === 'ArrowFunctionExpression' &&
            (styles.body.type === 'ObjectExpression' ||
              // $FlowFixMe TSAsExpression is relevant to the context of typescript
              (styles.body.type === 'TSAsExpression' &&
                styles.body.expression.type === 'ObjectExpression'))
          ) {
            const params = styles.params;
            styles =
              // $FlowFixMe[incompatible-type] TSAsExpression is relevant to the context of typescript
              styles.type === 'TSAsExpression'
                ? styles.expression
                : styles.body;
            params.forEach((param) => {
              if (param.type === 'Identifier') {
                dynamicStyleVariables.add(param.name);
              }
            });
          } else if (styles.type !== 'ObjectExpression') {
            return;
          }

          styles.properties.forEach((prop) =>
            checkStyleProperty(prop, 0, null, false),
          );
          // Reset local variables.
          dynamicStyleVariables.clear();
        });
      },
      'Program:exit'() {
        importTracker.clear();
        variables.clear();
      },
    };
  },
};
export default stylexNoDisallowedProperties as typeof stylexNoDisallowedProperties;
