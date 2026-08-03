/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

afterEach(() => {
  jest.resetModules();
  delete global.browser;
  delete global.chrome;
});

test('uses the Chrome callback eval overload without unsupported options', async () => {
  const evaluate = jest.fn((expression, callback) => callback(42));
  global.chrome = {
    devtools: { inspectedWindow: { eval: evaluate }, panels: {} },
    runtime: { getURL: jest.fn() },
  };
  const { evalInInspectedPage } = require('../src/devtools/inspectedClient');

  await expect(evalInInspectedPage('6 * 7')).resolves.toBe(42);
  expect(evaluate).toHaveBeenCalledWith('6 * 7', expect.any(Function));
});

test('normalizes Firefox promise eval results without passing options', async () => {
  const evaluate = jest.fn(() => Promise.resolve([42, undefined]));
  global.browser = {
    devtools: { inspectedWindow: { eval: evaluate }, panels: {} },
    runtime: { getURL: jest.fn() },
  };
  const { evalInInspectedPage } = require('../src/devtools/inspectedClient');

  await expect(evalInInspectedPage('6 * 7')).resolves.toBe(42);
  expect(evaluate).toHaveBeenCalledWith('6 * 7');
});

test('creates a Firefox sidebar without calling unsupported setHeight', async () => {
  const pane = { setPage: jest.fn() };
  const createSidebarPane = jest.fn(() => Promise.resolve(pane));
  global.browser = {
    devtools: {
      inspectedWindow: {},
      panels: { elements: { createSidebarPane } },
    },
    runtime: { getURL: jest.fn() },
  };
  const {
    createStylexSidebarPane,
  } = require('../src/devtools/createSidebarPane');

  await createStylexSidebarPane();

  expect(createSidebarPane).toHaveBeenCalledWith('StyleX');
  expect(pane.setPage).toHaveBeenCalledWith('panel.html');
});

test('keeps Firefox source APIs disabled even if partial methods exist', () => {
  global.browser = {
    devtools: {
      inspectedWindow: { getResources: jest.fn() },
      panels: { openResource: jest.fn() },
    },
    runtime: { getURL: jest.fn() },
  };

  const resources = require('../src/devtools/sourceResources');

  expect(resources.supportsSourcePreview).toBe(false);
  expect(resources.supportsOpenResource).toBe(false);
});

test('tolerates missing optional selection and navigation events', () => {
  global.browser = {
    devtools: { inspectedWindow: {}, panels: {} },
    runtime: { getURL: jest.fn() },
  };
  const { devtoolsBridge } = require('../src/devtools/bridge');

  expect(() => devtoolsBridge.subscribe(jest.fn())()).not.toThrow();
});

test('uses Chrome 148 callback resource APIs for previews and navigation', async () => {
  const resource = {
    url: 'webpack://src/App.js',
    getContent: jest.fn((callback) =>
      callback('const first = 1;\nconst second = 2;', ''),
    ),
  };
  const getResources = jest.fn((callback) => callback([resource]));
  const openResource = jest.fn();
  global.chrome = {
    devtools: {
      inspectedWindow: { getResources },
      panels: { openResource },
    },
    runtime: { getURL: jest.fn() },
  };
  const resources = require('../src/devtools/sourceResources');

  await expect(resources.getSourcePreview('src/App.js', 2)).resolves.toEqual({
    url: resource.url,
    snippet: expect.stringContaining('> 2 | const second = 2;'),
  });
  await resources.openSource('src/App.js', 2);

  expect(getResources).toHaveBeenCalledTimes(1);
  expect(resource.getContent).toHaveBeenCalledTimes(1);
  expect(openResource).toHaveBeenCalledWith(resource.url, 1);
});
