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
  debug: false,
  opts: {},
  cwd: '/home/test/',
  filename: '/home/test/main.js',
  get(_key: mixed): any {},
  set(_key: mixed, _value: mixed): void {},
};

const makeState = (opts: { ... }) =>
  new StateManager({ ...defaultConfig, opts });

describe('StateManager config parsing', () => {
  let warnings = [];
  beforeEach(() => {
    warnings = [];
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      warnings.push(args);
    });
  });

  /* eslint-disable no-loop-func */
  const booleanOptions = [
    'dev',
    'test',
    'genConditionalClasses',
    'useRemForFontSize',
    'treeshakeCompensation',
  ];
  for (const opt of booleanOptions) {
    it(`parses valid ${opt}`, () => {
      // $FlowFixMe[invalid-computed-prop]
      const stateManager = makeState({ [opt]: true });
      expect(stateManager.options[opt]).toBe(true);

      // $FlowFixMe[invalid-computed-prop]
      const stateManager2 = makeState({ [opt]: false });
      expect(stateManager2.options[opt]).toBe(false);

      const stateManager3 = makeState({});
      expect(stateManager3.options[opt]).toBe(false);

      expect(warnings).toEqual([]);
    });
    it(`logs errors on invalid ${opt}`, () => {
      // $FlowFixMe[invalid-computed-prop]
      const stateManager = makeState({ [opt]: 'true' });
      expect(stateManager.options[opt]).toBe(false);
      expect(warnings).toEqual([
        [
          '[@stylexjs/babel-plugin]',
          `Expected (options.${opt}) to be a boolean, but got \`"true"\`.`,
        ],
      ]);
    });
  }

  it('parses valid runtimeInjection', () => {
    let stateManager = makeState({ runtimeInjection: true });
    expect(stateManager.options.runtimeInjection).toBe(
      '@stylexjs/stylex/lib/stylex-inject',
    );

    stateManager = makeState({ dev: true });
    expect(stateManager.options.runtimeInjection).toBe(
      '@stylexjs/stylex/lib/stylex-inject',
    );

    stateManager = makeState({ runtimeInjection: 'true' });
    expect(stateManager.options.runtimeInjection).toBe('true');

    stateManager = makeState({ runtimeInjection: false });
    expect(stateManager.options.runtimeInjection).toBeUndefined();

    stateManager = makeState({});
    expect(stateManager.options.runtimeInjection).toBeUndefined();

    expect(warnings).toEqual([]);
  });
  it('logs errors on invalid runtimeInjection', () => {
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

  it('parses valid classNamePrefix option', () => {
    const stateManager = makeState({ classNamePrefix: 'test' });
    expect(stateManager.options.classNamePrefix).toBe('test');

    const stateManager2 = makeState({ classNamePrefix: '' });
    expect(stateManager2.options.classNamePrefix).toBe('');

    const stateManager3 = makeState({});
    expect(stateManager3.options.classNamePrefix).toBe('x');

    expect(warnings).toEqual([]);
  });

  it('parses valid debug option', () => {
    const stateManager = makeState({ debug: true });
    expect(stateManager.options.debug).toBe(true);

    const stateManager2 = makeState({ debug: false });
    expect(stateManager2.options.debug).toBe(false);

    expect(warnings).toEqual([]);
  });

  it('logs errors on invalid classNamePrefix option', () => {
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

  it('parses valid importSources option', () => {
    let stateManager = makeState({ importSources: ['test'] });
    expect(stateManager.options.importSources).toEqual([
      '@stylexjs/stylex',
      'stylex',
      'test',
    ]);

    stateManager = makeState({ importSources: [] });
    expect(stateManager.options.importSources).toEqual([
      '@stylexjs/stylex',
      'stylex',
    ]);

    stateManager = makeState({});
    expect(stateManager.options.importSources).toEqual([
      '@stylexjs/stylex',
      'stylex',
    ]);

    expect(warnings).toEqual([]);
  });
  it('logs errors on invalid importSources option', () => {
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

  it('parses valid styleResolution option', () => {
    let stateManager = makeState({ styleResolution: 'application-order' });
    expect(stateManager.options.styleResolution).toBe('application-order');

    stateManager = makeState({ styleResolution: 'property-specificity' });
    expect(stateManager.options.styleResolution).toBe('property-specificity');

    stateManager = makeState({ styleResolution: 'legacy-expand-shorthands' });
    expect(stateManager.options.styleResolution).toBe(
      'legacy-expand-shorthands',
    );

    stateManager = makeState({});
    expect(stateManager.options.styleResolution).toBe('application-order');

    expect(warnings).toEqual([]);
  });
  it('logs errors on invalid styleResolution option', () => {
    const stateManager = makeState({ styleResolution: 1 });
    expect(stateManager.options.styleResolution).toBe('application-order');
    expect(warnings).toMatchInlineSnapshot(`
      [
        [
          "[@stylexjs/babel-plugin]",
          "Expected (options.styleResolution) to be one of
      	- the literal "application-order"
      	- the literal "property-specificity"
      	- the literal "legacy-expand-shorthands"
      But got: 1",
        ],
      ]
    `);
  });

  it('logs errors on invalid styleResolution option', () => {
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

  it('parses valid unstable_moduleResolution option', () => {
    let stateManager = makeState({
      unstable_moduleResolution: { type: 'haste' },
    });
    expect(stateManager.options.unstable_moduleResolution).toEqual({
      type: 'haste',
    });

    stateManager = makeState({
      unstable_moduleResolution: { type: 'commonJS', rootDir: '/test/' },
    });
    expect(stateManager.options.unstable_moduleResolution).toEqual({
      type: 'commonJS',
      rootDir: '/test/',
    });

    expect(warnings).toEqual([]);
  });
  it('logs errors on commonJS unstable_moduleResolution without rootDir', () => {
    const stateManager = makeState({
      unstable_moduleResolution: { type: 'commonJS' },
    });
    expect(stateManager.options.unstable_moduleResolution).toBeNull();
    expect(warnings).toMatchInlineSnapshot(`
      [
        [
          "[@stylexjs/babel-plugin]",
          "Expected (options.unstable_moduleResolution) to be one of
      	- \`null\` or \`undefined\`
      	- one of
      		- an object where:
      			- Expected "type": to be the literal "commonJS"
      			- Expected "rootDir": to be a string
      			- Expected "themeFileExtension": to be 	- 
      				- one of
      					- \`null\` or \`undefined\`
      					- a string
      			- {"type":"commonJS"}
      		- an object where:
      			- Expected "type": to be the literal "haste"
      			- Expected "themeFileExtension": to be 	- 
      				- one of
      					- \`null\` or \`undefined\`
      					- a string
      			- {"type":"commonJS"}
      		- an object where:
      			- Expected "type": to be the literal "experimental_crossFileParsing"
      			- Expected "rootDir": to be a string
      			- Expected "themeFileExtension": to be 	- 
      				- one of
      					- \`null\` or \`undefined\`
      					- a string
      			- {"type":"commonJS"}
      But got: {"type":"commonJS"}",
        ],
      ]
    `);
  });
});
