/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

const fs = require('node:fs');
const path = require('node:path');

const { transformSync } = require('@babel/core');

describe('collectStylexDebugData', () => {
  let collectStylexDebugData;
  let getComputedStyleSpy;

  beforeAll(() => {
    const filePath = path.join(
      __dirname,
      '../src/inspected/collectStylexDebugData.js',
    );
    const source = fs.readFileSync(filePath, 'utf8');
    const transformed = transformSync(source, {
      filename: filePath,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            exclude: ['@babel/plugin-transform-typeof-symbol'],
            targets: { node: 'current' },
            modules: 'cjs',
          },
        ],
        require.resolve('@babel/preset-flow'),
        require.resolve('@babel/preset-react'),
      ],
      plugins: [
        [
          require.resolve('babel-plugin-syntax-hermes-parser'),
          { flow: 'detect' },
        ],
      ],
    });

    const module = { exports: {} };
    // eslint-disable-next-line no-new-func
    const executeModule = new Function('module', 'exports', transformed.code);
    executeModule(module, module.exports);
    ({ collectStylexDebugData } = module.exports);
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    getComputedStyleSpy = jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({
        length: 0,
        getPropertyValue: () => '',
      });
  });

  afterEach(() => {
    if (getComputedStyleSpy) {
      getComputedStyleSpy.mockRestore();
    }
    delete global.$0;
  });

  test('collects escaped Tailwind-style class names from selectors', () => {
    const element = document.createElement('div');
    element.setAttribute(
      'class',
      'sm:hidden w-[calc(100%-1rem)] shadow-[0_0_#000,0_0_#fff]',
    );
    document.body.appendChild(element);
    global.$0 = element;

    Object.defineProperty(element, 'matches', {
      configurable: true,
      value: (selector) =>
        selector === '.sm\\:hidden' ||
        selector === '.w-\\[calc\\(100\\%-1rem\\)\\]' ||
        selector === '.shadow-\\[0_0_\\#000\\,0_0_\\#fff\\]',
    });

    const mockSheet = {
      cssRules: [
        {
          type: 1,
          selectorText: '.sm\\:hidden:hover',
          cssText: '.sm\\:hidden:hover { display: none; }',
        },
        {
          type: 1,
          selectorText: '.w-\\[calc\\(100\\%-1rem\\)\\]',
          cssText:
            '.w-\\[calc\\(100\\%-1rem\\)\\] { width: calc(100% - 1rem); }',
        },
        {
          type: 1,
          selectorText: '.shadow-\\[0_0_\\#000\\,0_0_\\#fff\\]',
          cssText:
            '.shadow-\\[0_0_\\#000\\,0_0_\\#fff\\] { box-shadow: 0 0 #000, 0 0 #fff; }',
        },
      ],
    };

    Object.defineProperty(document, 'styleSheets', {
      configurable: true,
      value: [mockSheet],
    });

    const data = collectStylexDebugData();

    expect(data.applied.classes.map((entry) => entry.name)).toEqual([
      'sm:hidden',
      'w-[calc(100%-1rem)]',
      'shadow-[0_0_#000,0_0_#fff]',
    ]);

    expect(data.applied.classes[0].declarations).toEqual([
      {
        property: 'display',
        value: 'none',
        important: false,
        condition: ':hover',
        conditions: [':hover'],
        className: 'sm:hidden',
      },
    ]);

    expect(data.atomicRules).toEqual([
      {
        className: 'sm:hidden',
        property: 'display',
        value: 'none',
        important: false,
        conditions: [':hover'],
      },
      {
        className: 'w-[calc(100%-1rem)]',
        property: 'width',
        value: 'calc(100% - 1rem)',
        important: false,
        conditions: [],
      },
      {
        className: 'shadow-[0_0_#000,0_0_#fff]',
        property: 'box-shadow',
        value: '0 0 #000, 0 0 #fff',
        important: false,
        conditions: [],
      },
    ]);
  });

  test('dedupes identical declarations across multiple stylesheets', () => {
    const element = document.createElement('div');
    element.setAttribute('class', 'xfoo');
    document.body.appendChild(element);
    global.$0 = element;

    Object.defineProperty(element, 'matches', {
      configurable: true,
      value: (selector) => selector === '.xfoo',
    });

    const makeSheet = () => ({
      cssRules: [
        { type: 1, selectorText: '.xfoo', cssText: '.xfoo { color: red; }' },
      ],
    });

    // Same atomic rule injected into three stylesheets (as HMR / StrictMode /
    // multiple bundles do in dev).
    Object.defineProperty(document, 'styleSheets', {
      configurable: true,
      value: [makeSheet(), makeSheet(), makeSheet()],
    });

    const data = collectStylexDebugData();

    const xfoo = data.applied.classes.find((entry) => entry.name === 'xfoo');
    expect(xfoo.declarations).toEqual([
      {
        property: 'color',
        value: 'red',
        important: false,
        condition: 'default',
        className: 'xfoo',
      },
    ]);
  });

  test('inspects an element by CSS selector via the target argument', () => {
    const element = document.createElement('div');
    element.setAttribute('class', 'xfoo');
    element.setAttribute('id', 'target');
    document.body.appendChild(element);
    // Intentionally do NOT set global.$0 — the selector path must work without it.

    Object.defineProperty(element, 'matches', {
      configurable: true,
      value: (selector) => selector === '.xfoo',
    });

    Object.defineProperty(document, 'styleSheets', {
      configurable: true,
      value: [
        {
          cssRules: [
            {
              type: 1,
              selectorText: '.xfoo',
              cssText: '.xfoo { color: red; }',
            },
          ],
        },
      ],
    });

    const data = collectStylexDebugData('#target');

    expect(data.element.tagName).toBe('div');
    expect(data.applied.classes.map((entry) => entry.name)).toEqual(['xfoo']);
  });

  test('inspects an explicitly passed element via the target argument', () => {
    const element = document.createElement('span');
    element.setAttribute('class', 'xfoo');
    document.body.appendChild(element);

    Object.defineProperty(element, 'matches', {
      configurable: true,
      value: (selector) => selector === '.xfoo',
    });

    Object.defineProperty(document, 'styleSheets', {
      configurable: true,
      value: [
        {
          cssRules: [
            {
              type: 1,
              selectorText: '.xfoo',
              cssText: '.xfoo { color: red; }',
            },
          ],
        },
      ],
    });

    const data = collectStylexDebugData(element);

    expect(data.element.tagName).toBe('span');
    expect(data.applied.classes.map((entry) => entry.name)).toEqual(['xfoo']);
  });

  test('returns empty data for an invalid selector', () => {
    Object.defineProperty(document, 'styleSheets', {
      configurable: true,
      value: [],
    });

    const data = collectStylexDebugData(':::not a valid selector');

    expect(data.element.tagName).toBe('—');
    expect(data.applied.classes).toEqual([]);
  });
});
