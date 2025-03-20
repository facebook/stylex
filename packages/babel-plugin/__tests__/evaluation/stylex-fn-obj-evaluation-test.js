/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const {
  evaluateStyleXCreateArg,
} = require('../../src/visitors/stylex-create/parse-stylex-create-arg');
const { default: StateManager } = require('../../src/utils/state-manager');

const { isNode } = require('@babel/types');

function removeLoc(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeLoc);
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    if (['start', 'end', 'loc'].includes(key)) {
      continue;
    }
    const value = obj[key];
    if (isNode(value)) {
      result[key] = removeLoc(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(removeLoc);
    } else if (value !== null && typeof value === 'object') {
      result[key] = removeLoc(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function evaluateFirstStatement(code, functions) {
  const ast = parse(code);
  let result;
  traverse(ast, {
    Program(path, state) {
      const stateManager = new StateManager({
        ...state,
        file: { metadata: {} },
      });
      const statements = path.get('body');
      const statement = statements[0];
      if (!statement) {
        return;
      }
      if (statement.isVariableDeclaration()) {
        const valuePath = statement.get('declarations')[0].get('init');
        result = evaluateStyleXCreateArg(valuePath, stateManager, functions);
      } else {
        result = evaluateStyleXCreateArg(statement, stateManager, functions);
      }
    },
  });
  return result;
}

describe('custom path evaluation works as expected', () => {
  test('Evaluates Empty Object', () => {
    const result = evaluateFirstStatement('const x = {};', {});

    expect(result.confident).toBe(true);
    expect(result.value).toEqual({});
  });
  test('Evaluates Static Style Object', () => {
    const result = evaluateFirstStatement(`
      const x = {
        default: {
          overflow: 'hidden',
          borderStyle: 'dashed',
          borderWidth: 1,
        },
      };
    `);
    expect(result.confident).toBe(true);

    expect(result.value).toEqual({
      default: {
        overflow: 'hidden',
        borderStyle: 'dashed',
        borderWidth: 1,
      },
    });
  });
  test('Evaluates object with function styles (identifier)', () => {
    const result = evaluateFirstStatement(`
      const x = {
        default: (width) => ({
          overflow: 'hidden',
          borderStyle: 'dashed',
          borderWidth: width,
        }),
      };
    `);
    expect(result.confident).toBe(true);
    expect(result.value).toEqual({
      default: {
        borderStyle: 'dashed',
        borderWidth: 'var(--borderWidth)',
        overflow: 'hidden',
      },
    });
    expect(removeLoc(result.fns)).toMatchInlineSnapshot(`
      {
        "default": [
          [
            {
              "name": "width",
              "type": "Identifier",
            },
          ],
          {
            "--borderWidth": {
              "expression": {
                "arguments": [
                  {
                    "name": "width",
                    "type": "Identifier",
                  },
                ],
                "callee": {
                  "async": false,
                  "body": {
                    "alternate": {
                      "alternate": {
                        "name": "undefined",
                        "type": "Identifier",
                      },
                      "consequent": {
                        "name": "val",
                        "type": "Identifier",
                      },
                      "test": {
                        "left": {
                          "name": "val",
                          "type": "Identifier",
                        },
                        "operator": "!=",
                        "right": {
                          "type": "NullLiteral",
                        },
                        "type": "BinaryExpression",
                      },
                      "type": "ConditionalExpression",
                    },
                    "consequent": {
                      "left": {
                        "name": "val",
                        "type": "Identifier",
                      },
                      "operator": "+",
                      "right": {
                        "type": "StringLiteral",
                        "value": "px",
                      },
                      "type": "BinaryExpression",
                    },
                    "test": {
                      "left": {
                        "argument": {
                          "name": "val",
                          "type": "Identifier",
                        },
                        "operator": "typeof",
                        "prefix": true,
                        "type": "UnaryExpression",
                      },
                      "operator": "===",
                      "right": {
                        "type": "StringLiteral",
                        "value": "number",
                      },
                      "type": "BinaryExpression",
                    },
                    "type": "ConditionalExpression",
                  },
                  "expression": null,
                  "params": [
                    {
                      "name": "val",
                      "type": "Identifier",
                    },
                  ],
                  "type": "ArrowFunctionExpression",
                },
                "type": "CallExpression",
              },
              "originalExpression": {
                "name": "width",
                "type": "Identifier",
              },
              "path": [
                {
                  "0": "b",
                  "1": "o",
                  "10": "h",
                  "2": "r",
                  "3": "d",
                  "4": "e",
                  "5": "r",
                  "6": "W",
                  "7": "i",
                  "8": "d",
                  "9": "t",
                },
              ],
            },
          },
        ],
      }
    `);
  });

  test('Evaluates object with function styles (binary expression)', () => {
    const result = evaluateFirstStatement(`
      const x = {
        default: (width) => ({
          overflow: 'hidden',
          borderStyle: 'dashed',
          borderWidth: width * 2 + 'px',
        }),
      };
    `);
    expect(result.confident).toBe(true);
    expect(result.value).toEqual({
      default: {
        overflow: 'hidden',
        borderStyle: 'dashed',
        borderWidth: 'var(--borderWidth)',
      },
    });
    expect(removeLoc(result.fns)).toMatchInlineSnapshot(`
      {
        "default": [
          [
            {
              "name": "width",
              "type": "Identifier",
            },
          ],
          {
            "--borderWidth": {
              "expression": {
                "arguments": [
                  {
                    "left": {
                      "left": {
                        "name": "width",
                        "type": "Identifier",
                      },
                      "operator": "*",
                      "right": {
                        "extra": {
                          "raw": "2",
                          "rawValue": 2,
                        },
                        "type": "NumericLiteral",
                        "value": 2,
                      },
                      "type": "BinaryExpression",
                    },
                    "operator": "+",
                    "right": {
                      "extra": {
                        "raw": "'px'",
                        "rawValue": "px",
                      },
                      "type": "StringLiteral",
                      "value": "px",
                    },
                    "type": "BinaryExpression",
                  },
                ],
                "callee": {
                  "async": false,
                  "body": {
                    "alternate": {
                      "alternate": {
                        "name": "undefined",
                        "type": "Identifier",
                      },
                      "consequent": {
                        "name": "val",
                        "type": "Identifier",
                      },
                      "test": {
                        "left": {
                          "name": "val",
                          "type": "Identifier",
                        },
                        "operator": "!=",
                        "right": {
                          "type": "NullLiteral",
                        },
                        "type": "BinaryExpression",
                      },
                      "type": "ConditionalExpression",
                    },
                    "consequent": {
                      "left": {
                        "name": "val",
                        "type": "Identifier",
                      },
                      "operator": "+",
                      "right": {
                        "type": "StringLiteral",
                        "value": "px",
                      },
                      "type": "BinaryExpression",
                    },
                    "test": {
                      "left": {
                        "argument": {
                          "name": "val",
                          "type": "Identifier",
                        },
                        "operator": "typeof",
                        "prefix": true,
                        "type": "UnaryExpression",
                      },
                      "operator": "===",
                      "right": {
                        "type": "StringLiteral",
                        "value": "number",
                      },
                      "type": "BinaryExpression",
                    },
                    "type": "ConditionalExpression",
                  },
                  "expression": null,
                  "params": [
                    {
                      "name": "val",
                      "type": "Identifier",
                    },
                  ],
                  "type": "ArrowFunctionExpression",
                },
                "type": "CallExpression",
              },
              "originalExpression": {
                "left": {
                  "left": {
                    "name": "width",
                    "type": "Identifier",
                  },
                  "operator": "*",
                  "right": {
                    "extra": {
                      "raw": "2",
                      "rawValue": 2,
                    },
                    "type": "NumericLiteral",
                    "value": 2,
                  },
                  "type": "BinaryExpression",
                },
                "operator": "+",
                "right": {
                  "extra": {
                    "raw": "'px'",
                    "rawValue": "px",
                  },
                  "type": "StringLiteral",
                  "value": "px",
                },
                "type": "BinaryExpression",
              },
              "path": [
                {
                  "0": "b",
                  "1": "o",
                  "10": "h",
                  "2": "r",
                  "3": "d",
                  "4": "e",
                  "5": "r",
                  "6": "W",
                  "7": "i",
                  "8": "d",
                  "9": "t",
                },
              ],
            },
          },
        ],
      }
    `);
  });
});
