/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import StateManager from '../state-manager';

const defaultConfig = {
  file: { metadata: {} } as any,
  key: 'key',
  opts: {},
  cwd: '/home/test/',
  filename: '/home/test/main.js',
  get(_key: mixed): any {},
  set(_key: mixed, _value: mixed): void {},
};

const makeState = (opts?: { ... } = {}) =>
  new StateManager({ ...defaultConfig, opts });

describe('StateManager config parsing', () => {
  let warnings = [];
  beforeEach(() => {
    warnings = [];
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      warnings.push(args);
    });
  });

  describe('"classNamePrefix" option', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ classNamePrefix: 1 });
      expect(stateManager.options.classNamePrefix).toBe('x');
      expect(warnings).toMatchInlineSnapshot(`
        [
          [
            "[@stylexjs/babel-plugin]",
            "Expected (options.classNamePrefix) to be a string, but got \`1\`.",
          ],
        ]
      `);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.classNamePrefix).toBe('x');
      expect(warnings).toEqual([]);
    });

    // This is unsafe if hashed classNames start with a number
    test('empty string value', () => {
      const stateManager = makeState({ classNamePrefix: '' });
      expect(stateManager.options.classNamePrefix).toBe('');
      expect(warnings).toEqual([]);
    });

    test('provided value', () => {
      const stateManager = makeState({ classNamePrefix: 'prefix' });
      expect(stateManager.options.classNamePrefix).toBe('prefix');
      expect(warnings).toEqual([]);
    });
  });

  describe('"debug" option (boolean)', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ debug: 'true' });
      expect(stateManager.options.debug).toBe(false);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          'Expected (options.debug) to be a boolean, but got `"true"`.',
        ],
      ]);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.debug).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({ debug: false });
      expect(stateManager.options.debug).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({ debug: true });
      expect(stateManager.options.debug).toBe(true);
      // automatically enabled in 'debug'
      expect(stateManager.options.enableDebugClassNames).toBe(true);
      expect(warnings).toEqual([]);
    });
  });

  describe('"dev" option (boolean)', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ dev: 'true' });
      expect(stateManager.options.dev).toBe(false);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          'Expected (options.dev) to be a boolean, but got `"true"`.',
        ],
      ]);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.dev).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({ dev: false });
      expect(stateManager.options.dev).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({ dev: true });
      expect(stateManager.options.dev).toBe(true);
      // debug is currently automatically enabled in 'dev'
      expect(stateManager.options.debug).toBe(true);
      // runtimeInjection is currently automatically enabled in 'dev'
      expect(stateManager.options.runtimeInjection).toBe(
        '@stylexjs/stylex/lib/stylex-inject',
      );
      expect(warnings).toEqual([]);
    });
  });

  describe('"enableDebugClassNames" option (boolean)', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ enableDebugClassNames: 'false' });
      expect(stateManager.options.enableDebugClassNames).toBe(true);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          'Expected (options.enableDebugClassNames) to be a boolean, but got `"false"`.',
        ],
      ]);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.enableDebugClassNames).toBe(true);
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({
        debug: true,
        enableDebugClassNames: false,
      });
      expect(stateManager.options.enableDebugClassNames).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({
        debug: true,
        enableDebugClassNames: true,
      });
      expect(stateManager.options.enableDebugClassNames).toBe(true);
      expect(warnings).toEqual([]);
    });
  });

  describe('"genConditionalClasses" option (boolean)', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ genConditionalClasses: 'true' });
      expect(stateManager.options.genConditionalClasses).toBe(false);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          'Expected (options.genConditionalClasses) to be a boolean, but got `"true"`.',
        ],
      ]);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.genConditionalClasses).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({ genConditionalClasses: false });
      expect(stateManager.options.genConditionalClasses).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({ genConditionalClasses: true });
      expect(stateManager.options.genConditionalClasses).toBe(true);
      expect(warnings).toEqual([]);
    });
  });

  describe('"importSources" option', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ importSources: 1 });
      expect(stateManager.options.importSources).toEqual([
        '@stylexjs/stylex',
        'stylex',
      ]);
      expect(warnings).toMatchInlineSnapshot(`
        [
          [
            "[@stylexjs/babel-plugin]",
            "Expected (options.importSources) to be an array, but got \`1\`.",
          ],
        ]
      `);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.importSources).toEqual([
        '@stylexjs/stylex',
        'stylex',
      ]);
      expect(warnings).toEqual([]);
    });

    test('empty value', () => {
      const stateManager = makeState({ importSources: [] });
      expect(stateManager.options.importSources).toEqual([
        '@stylexjs/stylex',
        'stylex',
      ]);
      expect(warnings).toEqual([]);
    });

    test('provided value', () => {
      const stateManager = makeState({
        importSources: [
          'built-with-stylex',
          { from: 'react-strict-dom', as: 'css' },
        ],
      });
      expect(stateManager.options.importSources).toMatchInlineSnapshot(`
        [
          "@stylexjs/stylex",
          "stylex",
          "built-with-stylex",
          {
            "as": "css",
            "from": "react-strict-dom",
          },
        ]
      `);
      expect(warnings).toEqual([]);
    });
  });

  describe('"runtimeInjection" option', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ runtimeInjection: 1 });
      expect(stateManager.options.runtimeInjection).toBeUndefined();
      expect(warnings).toMatchInlineSnapshot(`
        [
          [
            "[@stylexjs/babel-plugin]",
            "Expected (options.runtimeInjection) to be one of
        	- a boolean
        	- a string
        	- an object where:
        But got: 1",
          ],
        ]
      `);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.runtimeInjection).toBeUndefined();
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({ runtimeInjection: false });
      expect(stateManager.options.runtimeInjection).toBeUndefined();
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({ runtimeInjection: true });
      expect(stateManager.options.runtimeInjection).toBe(
        '@stylexjs/stylex/lib/stylex-inject',
      );
      expect(warnings).toEqual([]);
    });

    test('"true" value', () => {
      const stateManager = makeState({ runtimeInjection: 'true' });
      expect(stateManager.options.runtimeInjection).toBe('true');
      expect(warnings).toEqual([]);
    });
  });

  describe('"styleResolution" option', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ styleResolution: 'something-else' });
      expect(stateManager.options.styleResolution).toBe('application-order');
      expect(warnings).toMatchInlineSnapshot(`
        [
          [
            "[@stylexjs/babel-plugin]",
            "Expected (options.styleResolution) to be one of
        	- the literal "application-order"
        	- the literal "property-specificity"
        	- the literal "legacy-expand-shorthands"
        But got: "something-else"",
          ],
        ]
      `);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.styleResolution).toBe('application-order');
      expect(warnings).toEqual([]);
    });

    test('valid values', () => {
      let stateManager = makeState({ styleResolution: 'application-order' });
      expect(stateManager.options.styleResolution).toBe('application-order');

      stateManager = makeState({ styleResolution: 'property-specificity' });
      expect(stateManager.options.styleResolution).toBe('property-specificity');

      stateManager = makeState({ styleResolution: 'legacy-expand-shorthands' });
      expect(stateManager.options.styleResolution).toBe(
        'legacy-expand-shorthands',
      );

      expect(warnings).toEqual([]);
    });
  });

  describe('"test" option (boolean)', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ test: 'true' });
      expect(stateManager.options.test).toBe(false);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          'Expected (options.test) to be a boolean, but got `"true"`.',
        ],
      ]);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.test).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({ test: false });
      expect(stateManager.options.test).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({ test: true });
      expect(stateManager.options.test).toBe(true);
      expect(warnings).toEqual([]);
    });
  });

  describe('"treeshakeCompensation" option (boolean)', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ treeshakeCompensation: 'true' });
      expect(stateManager.options.treeshakeCompensation).toBe(false);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          'Expected (options.treeshakeCompensation) to be a boolean, but got `"true"`.',
        ],
      ]);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.treeshakeCompensation).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({ treeshakeCompensation: false });
      expect(stateManager.options.treeshakeCompensation).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({ treeshakeCompensation: true });
      expect(stateManager.options.treeshakeCompensation).toBe(true);
      expect(warnings).toEqual([]);
    });
  });

  describe('"unstable_moduleResolution" option', () => {
    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.unstable_moduleResolution).toBeUndefined();
      expect(warnings).toEqual([]);
    });

    test('"commonJS" type', () => {
      const stateManager = makeState({
        unstable_moduleResolution: { type: 'commonJS' },
      });
      expect(stateManager.options.unstable_moduleResolution).toEqual({
        type: 'commonJS',
      });
      expect(warnings).toEqual([]);
    });

    test('"haste" type', () => {
      const stateManager = makeState({
        unstable_moduleResolution: { type: 'haste' },
      });
      expect(stateManager.options.unstable_moduleResolution).toEqual({
        type: 'haste',
      });
      expect(warnings).toEqual([]);
    });

    test('"rootDir" option', () => {
      const stateManager = makeState({
        unstable_moduleResolution: { type: 'commonJS', rootDir: '/test/' },
      });
      expect(stateManager.options.unstable_moduleResolution).toEqual({
        type: 'commonJS',
        rootDir: '/test/',
      });
      expect(warnings).toEqual([]);
    });
  });

  describe('"useRemForFontSize" option (boolean)', () => {
    test('logs errors if invalid', () => {
      const stateManager = makeState({ useRemForFontSize: 'true' });
      expect(stateManager.options.useRemForFontSize).toBe(false);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          'Expected (options.useRemForFontSize) to be a boolean, but got `"true"`.',
        ],
      ]);
    });

    test('default value', () => {
      const stateManager = makeState();
      expect(stateManager.options.useRemForFontSize).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('false value', () => {
      const stateManager = makeState({ useRemForFontSize: false });
      expect(stateManager.options.useRemForFontSize).toBe(false);
      expect(warnings).toEqual([]);
    });

    test('true value', () => {
      const stateManager = makeState({ useRemForFontSize: true });
      expect(stateManager.options.useRemForFontSize).toBe(true);
      expect(warnings).toEqual([]);
    });
  });
});
