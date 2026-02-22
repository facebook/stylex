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
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { evaluate } = require('../evaluate-path');
const { default: StateManager } = require('../state-manager');

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

function evaluateLastStatement(code, functions) {
  const ast = parse(code);
  let result;
  traverse(ast, {
    Program(path, state) {
      const stateManager = new StateManager({
        ...state,
        file: { metadata: {} },
      });
      const statements = path.get('body');
      const last = statements[statements.length - 1];
      if (last.isExpressionStatement()) {
        result = evaluate(last.get('expression'), stateManager, functions);
      }
    },
  });
  if (result === undefined || result.confident === false) {
    return { confident: false };
  } else {
    return result.value;
  }
}

function evaluateNamedVariable(code, variableName, stateOptions = {}) {
  const ast = parse(code, { sourceType: 'module' });
  let result;
  traverse(ast, {
    Program(path, state) {
      const stateManager = new StateManager({
        ...state,
        filename: stateOptions.filename,
        file: { metadata: {} },
        opts: stateOptions.opts ?? {},
      });

      const statements = path.get('body');
      for (const statement of statements) {
        if (!statement.isVariableDeclaration()) {
          continue;
        }
        for (const decl of statement.get('declarations')) {
          if (!decl.isVariableDeclarator()) {
            continue;
          }
          const idPath = decl.get('id');
          if (!idPath.isIdentifier() || idPath.node.name !== variableName) {
            continue;
          }
          const initPath = decl.get('init');
          if (initPath != null) {
            result = evaluate(initPath, stateManager, stateOptions.functions);
            return;
          }
        }
      }
    },
  });

  if (result === undefined || result.confident === false) {
    return { confident: false };
  }
  return result.value;
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

    test('Methods called by string should be bind', () => {
      expect(
        evaluateFirstStatement(
          'const x = "".concat("10px"," ").concat("10px");',
          {},
        ),
      ).toBe('10px 10px');
      expect(evaluateFirstStatement('const x = "abc".charCodeAt(0);', {})).toBe(
        97,
      );
    });
  });

  describe('evaluate-path mutation detection', () => {
    test('evaluates constant array correctly', () => {
      const code = `
        const a = [1, 2];
        a;
      `;
      expect(evaluateLastStatement(code, {})).toEqual([1, 2]);
    });

    test('should bail out when array is mutated via push', () => {
      const code = `
        const a = [1, 2];
        a.push(3);
        a;
      `;
      expect(evaluateLastStatement(code, {})).toEqual({ confident: false });
    });

    test('should bail out when array is mutated via assignment', () => {
      const code = `
        const a = [1, 2];
        a[0] = 3;
        a;
      `;
      expect(evaluateLastStatement(code, {})).toEqual({ confident: false });
    });

    test('should bail out when object is mutated via Object.assign', () => {
      const code = `
        const a = {bar: 'baz'};
        Object.assign(a, {foo: 1});
        a;
      `;
      expect(evaluateLastStatement(code, {})).toEqual({ confident: false });
    });
  });

  describe('evaluateThemeRef custom property name mapping', () => {
    test('resolves imported namedVar custom properties', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-eval-'));
      const sourceFilePath = path.join(tmpDir, 'App.js');
      const tokensFilePath = path.join(tmpDir, 'tokens.stylex.js');

      try {
        fs.writeFileSync(
          tokensFilePath,
          `
            import * as stylex from '@stylexjs/stylex';
            export const tokens = stylex.defineVars({
              surface: stylex.namedVar('--surface-bg', 'black'),
              accent: 'blue',
            });
          `,
          'utf8',
        );

        const appCode = `
          import { tokens } from './tokens.stylex';
          const customVar = tokens.surface;
          const hashedVar = tokens.accent;
        `;

        const opts = {
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: tmpDir,
          },
        };

        const customVar = evaluateNamedVariable(appCode, 'customVar', {
          filename: sourceFilePath,
          opts,
        });
        const hashedVar = evaluateNamedVariable(appCode, 'hashedVar', {
          filename: sourceFilePath,
          opts,
        });

        expect(customVar).toBe('var(--surface-bg)');
        expect(hashedVar).toMatch(/^var\(--x/);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    test('throws for invalid imported namedVar declarations', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-eval-'));
      const sourceFilePath = path.join(tmpDir, 'App.js');
      const tokensFilePath = path.join(tmpDir, 'tokens.stylex.js');

      try {
        fs.writeFileSync(
          tokensFilePath,
          `
            import * as stylex from '@stylexjs/stylex';
            export const tokens = stylex.defineVars({
              surface: stylex.namedVar('surface-bg', 'black'),
            });
          `,
          'utf8',
        );

        const appCode = `
          import { tokens } from './tokens.stylex';
          const customVar = tokens.surface;
        `;

        const opts = {
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: tmpDir,
          },
        };

        expect(() =>
          evaluateNamedVariable(appCode, 'customVar', {
            filename: sourceFilePath,
            opts,
          }),
        ).toThrow('Expected a CSS custom property name starting with "--"');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    test('resolves canonical package refs for named vars', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-eval-'));
      const packageDir = path.join(tmpDir, 'docs');
      const sourceFilePath = path.join(packageDir, 'src', 'pages', 'App.js');
      const tokensFilePath = path.join(
        packageDir,
        'src',
        'theming',
        'vars.stylex.ts',
      );

      try {
        fs.mkdirSync(path.dirname(sourceFilePath), { recursive: true });
        fs.mkdirSync(path.dirname(tokensFilePath), { recursive: true });
        fs.writeFileSync(
          path.join(packageDir, 'package.json'),
          JSON.stringify({ name: 'docs-new', private: true }),
          'utf8',
        );
        fs.writeFileSync(
          tokensFilePath,
          `
            import * as stylex from '@stylexjs/stylex';
            export const vars = stylex.defineVars({
              surface: stylex.namedVar('--surface-bg', 'black'),
            });
          `,
          'utf8',
        );

        const appCode = `
          import { vars } from '../theming/vars.stylex';
          const customVar = vars.surface;
        `;

        const opts = {
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: tmpDir,
          },
        };

        const customVar = evaluateNamedVariable(appCode, 'customVar', {
          filename: sourceFilePath,
          opts,
        });

        expect(customVar).toBe('var(--surface-bg)');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
