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
const { evaluate } = require('../../src/utils/evaluate-path');
const { default: StateManager } = require('../../src/utils/state-manager');

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
        result = evaluate(valuePath, stateManager, functions);
      } else {
        result = evaluate(statement, stateManager, functions);
      }
    },
  });
  if (result === undefined || result.confident === false) {
    return { confident: false };
  } else {
    return result.value;
  }
}

describe('custom path evaluation works as expected', () => {
  test('Evaluates Primitive Value expressions', () => {
    expect(evaluateFirstStatement('1 + 2', {})).toBe(3);
    expect(evaluateFirstStatement('1 - 2', {})).toBe(-1);
    expect(evaluateFirstStatement('1 * 2', {})).toBe(2);
    expect(evaluateFirstStatement('1 / 2', {})).toBe(0.5);
    expect(evaluateFirstStatement('1 % 2', {})).toBe(1);
    expect(evaluateFirstStatement('1 ** 2', {})).toBe(1);
    expect(evaluateFirstStatement('1 << 2', {})).toBe(4);
    expect(evaluateFirstStatement('1 >> 2', {})).toBe(0);
    expect(evaluateFirstStatement('1 & 2', {})).toBe(0);
    expect(evaluateFirstStatement('1 | 2', {})).toBe(3);
    expect(evaluateFirstStatement('1 ^ 2', {})).toBe(3);
    expect(evaluateFirstStatement('1 && 2', {})).toBe(2);
    expect(evaluateFirstStatement('1 || 2', {})).toBe(1);

    expect(evaluateFirstStatement('null', {})).toBe(null);
    expect(evaluateFirstStatement('undefined', {})).toBe(undefined);
    expect(evaluateFirstStatement('true', {})).toBe(true);
    expect(evaluateFirstStatement('false', {})).toBe(false);
    expect(evaluateFirstStatement('let x = "hello";', {})).toBe('hello');
  });
  test('Evaluates Simple Arrays and Objects', () => {
    expect(evaluateFirstStatement('const x = {};', {})).toEqual({});
    expect(
      evaluateFirstStatement('const x = {name: "Name", age: 43};', {}),
    ).toEqual({ name: 'Name', age: 43 });

    expect(evaluateFirstStatement('const x = [];', {})).toEqual([]);
    expect(evaluateFirstStatement('const x = [1, 2, 3];', {})).toEqual([
      1, 2, 3,
    ]);
    expect(evaluateFirstStatement('const x = [1, 2, 3, 4, 5];', {})).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });
  test('Evaluates Objects with spreads', () => {
    expect(
      evaluateFirstStatement(
        'const x = {name: "Name", ...({hero: true}), age: 43};',
        {},
      ),
    ).toEqual({ name: 'Name', hero: true, age: 43 });

    expect(
      evaluateFirstStatement(
        'const x = {name: "Name", ...({name: "StyleX", age: 1}), age: 43};',
        {},
      ),
    ).toEqual({ name: 'StyleX', age: 43 });
  });

  test('Evaluates built-in functions', () => {
    expect(evaluateFirstStatement('const x = Math.max(1, 2, 3);', {})).toBe(3);
    expect(evaluateFirstStatement('const x = Math.min(1, 2, 3);', {})).toBe(1);
  });

  test('Evaluates custom functions', () => {
    function makeArray(...args) {
      return [...args].reverse();
    }

    expect(
      evaluateFirstStatement('const x = makeArray(1, 2, 3);', {
        identifiers: {
          makeArray: { fn: makeArray },
        },
      }),
    ).toEqual([3, 2, 1]);

    expect(
      evaluateFirstStatement('const x = stylex.makeArray(1, 2, 3);', {
        memberExpressions: { stylex: { makeArray: { fn: makeArray } } },
      }),
    ).toEqual([3, 2, 1]);
  });

  test('Evaluates custom functions that return non-static values', () => {
    class MyClass {
      constructor(value) {
        this.value = value;
      }
    }
    function makeClass(value) {
      return new MyClass(value);
    }

    expect(
      evaluateFirstStatement('const x = makeClass("Hello");', {
        identifiers: { makeClass: { fn: makeClass } },
      }),
    ).toEqual(new MyClass('Hello'));
  });

  test('Evaluates custom functions used as spread values', () => {
    function makeObj(value) {
      return { spreadValue: value };
    }

    expect(
      evaluateFirstStatement(
        'const x = {name: "Name", ...makeObj("Hello"), age: 30};',
        {
          identifiers: {
            makeObj: { fn: makeObj },
          },
        },
      ),
    ).toEqual({ name: 'Name', spreadValue: 'Hello', age: 30 });
  });

  test('Evaluates custom functions that take paths', () => {
    function getNode(path) {
      const { type, value } = path.node;
      return { type, value };
    }

    expect(
      evaluateFirstStatement('const x = getNode("Hello");', {
        identifiers: { getNode: { fn: getNode, takesPath: true } },
      }),
    ).toEqual({ type: 'StringLiteral', value: 'Hello' });
  });

  describe('evaluating function expressions', () => {
    test('function with a single params', () => {
      const fn = evaluateFirstStatement('const double = x => x * 2;', {});
      expect(typeof fn).toEqual('function');

      expect(fn(2)).toBe(4);
    });

    test('function with a two params', () => {
      const fn = evaluateFirstStatement('const add = (a, b) => a + b;', {});
      expect(typeof fn).toEqual('function');

      expect(fn(2, 7)).toBe(9);
    });

    test('Array map', () => {
      expect(
        evaluateFirstStatement('const x = [1, 2, 3].map(x => x * 2);', {}),
      ).toEqual([2, 4, 6]);
    });

    test('Array filter', () => {
      expect(
        evaluateFirstStatement(
          'const x = [1, 2, 3].filter(x => x % 2 === 0);',
          {},
        ),
      ).toEqual([2]);
    });

    test('Array map and filter', () => {
      expect(
        evaluateFirstStatement(
          'const x = [1, 2, 3].map(x => x * 2).filter(x => x % 2 === 0);',
          {},
        ),
      ).toEqual([2, 4, 6]);
    });

    test('Object entries', () => {
      expect(
        evaluateFirstStatement(
          'const x = Object.entries({a: 1, b: 2, c: 4}).filter((entry) => entry[1] % 2 === 0);',
          {},
        ),
      ).toEqual([
        ['b', 2],
        ['c', 4],
      ]);

      expect(
        evaluateFirstStatement(
          'const x = Object.fromEntries(Object.entries({a: 1, b: 2, c: 4}).filter((entry) => entry[1] % 2 === 0));',
          {},
        ),
      ).toEqual({
        b: 2,
        c: 4,
      });
    });
  });
});
