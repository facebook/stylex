/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

type Devtools = {
  inspectedWindow: InspectedWindow,
  panels: Panels,
  network: Network,
  ...
};

export type InspectedWindowEvalOptions = {
  includeCommandLineAPI?: boolean,
  ...
};

export type ExceptionInfo = {
  isException: boolean,
  value?: mixed,
  ...
};

export type Resource = {
  url: string,
  getContent: (
    callback: (content: ?string, encoding: ?string) => mixed,
  ) => void,
  ...
};

export type InspectedWindow = {
  eval: (
    expression: string,
    options: InspectedWindowEvalOptions,
    callback: (result: mixed, exceptionInfo?: ExceptionInfo) => mixed,
  ) => void,
  getResources: (callback: (resources: Array<Resource>) => mixed) => void,
  ...
};

export type DevtoolsEvent = {
  addListener: (callback: (...args: any[]) => mixed) => void,
  removeListener: (callback: (...args: any[]) => mixed) => void,
  ...
};

export type SidebarPane = {
  setPage: (page: string) => void,
  setHeight: (height: number) => void,
  ...
};

export type Panels = {
  elements: {
    createSidebarPane: (
      title: string,
      callback: (pane: SidebarPane) => mixed,
    ) => void,
    onSelectionChanged: DevtoolsEvent,
    ...
  },
  openResource: (url: string, lineNumber?: number) => void,
  ...
};

export type Network = {
  onNavigated: DevtoolsEvent,
  ...
};

declare var chrome: {
  devtools: Devtools,
  ...
};

export const devtools: Devtools = chrome.devtools;
