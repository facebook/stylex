/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import * as t from '@babel/types';
const { transformSync } = require('@babel/core');
const stylexPlugin = require('../../src/index');

// A simple babel plugin that looks for inline() calls
// hoists them out to stylex.create calls
// and replaces them with references.
function inlineDemoPlugin() {
  const collectedStyles = [];
  let stylesIdentifier;
  return {
    visitor: {
      Program: {
        enter(path, _state) {
          // get unique identifier
          stylesIdentifier = path.scope.generateUidIdentifier('styles');
          path.traverse({
            CallExpression(path, _state) {
              if (
                path.node.callee.type === 'Identifier' &&
                path.node.callee.name === 'inline'
              ) {
                const args = path.node.arguments;
                if (args.length !== 1) {
                  return;
                }
                const index = collectedStyles.length;
                collectedStyles.push(args[0]);
                path.replaceWith(
                  t.memberExpression(
                    stylesIdentifier,
                    t.identifier(`$${index}`),
                  ),
                );
              }
            },
          });
          path.node.body.push(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                stylesIdentifier,
                t.callExpression(
                  t.memberExpression(
                    t.identifier('stylex'),
                    t.identifier('create'),
                  ),
                  [
                    t.objectExpression(
                      collectedStyles.map((style, index) =>
                        t.objectProperty(t.identifier(`$${index}`), style),
                      ),
                    ),
                  ],
                ),
              ),
            ]),
          );
        },
      },
    },
  };
}

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [
      ['babel-plugin-syntax-hermes-parser', { flow: 'detect' }],
      inlineDemoPlugin,
      [
        stylexPlugin,
        {
          runtimeInjection: true,
          unstable_moduleResolution: { type: 'haste' },
          ...opts,
        },
      ],
    ],
  }).code;
}

describe('[transform] stylex.create()', () => {
  test('transforms style object', () => {
    expect(
      transform(`
        import stylex from 'stylex';

        function Demo() {
          return (
            <div>
              <button {...stylex.props(
                styles.default,
                inline({
                  backgroundColor: 'pink',
                  color: 'white',
                })
              )}>
                Hello
              </button>
            </div>
          );
        }

        const styles = stylex.create({
          default: {
            appearance: 'none',
            borderWidth: '0',
            borderStyle: 'none',
          }
        });
      `),
    ).toMatchInlineSnapshot(`
      "import _inject from "@stylexjs/stylex/lib/stylex-inject";
      var _inject2 = _inject;
      import stylex from 'stylex';
      function Demo() {
        return <div>
                    <button className="xjyslct xc342km xng3xce x6tqnqi x1awj2ng">
                      Hello
                    </button>
                  </div>;
      }
      _inject2({
        ltr: ".xjyslct{appearance:none}",
        priority: 3000
      });
      _inject2({
        ltr: ".xc342km{border-width:0}",
        priority: 2000
      });
      _inject2({
        ltr: ".xng3xce{border-style:none}",
        priority: 2000
      });
      _inject2({
        ltr: ".x6tqnqi{background-color:pink}",
        priority: 3000
      });
      _inject2({
        ltr: ".x1awj2ng{color:white}",
        priority: 3000
      });"
    `);
  });
});
