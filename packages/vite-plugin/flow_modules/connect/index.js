/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import http from 'http';
import events from 'events';

export type ServerHandle = HandleFunction | http.Server;

export interface IncomingMessage extends http.IncomingMessage {
  originalUrl: http.IncomingMessage['url'];
}

type NextFunction = (err?: any) => void;

export type SimpleHandleFunction = (
  req: IncomingMessage,
  res: http.ServerResponse,
) => void;
export type NextHandleFunction = (
  req: IncomingMessage,
  res: http.ServerResponse,
  next: NextFunction,
) => void;
export type ErrorHandleFunction = (
  err: any,
  req: IncomingMessage,
  res: http.ServerResponse,
  next: NextFunction,
) => void;
export type HandleFunction =
  | SimpleHandleFunction
  | NextHandleFunction
  | ErrorHandleFunction;

export interface ServerStackItem {
  route: string;
  handle: ServerHandle;
}

export interface Server extends events.EventEmitter {
  (req: http.IncomingMessage, res: http.ServerResponse, next?: Function): void;

  route: string;
  stack: ServerStackItem[];

  use(fn: NextHandleFunction): Server;
  use(fn: HandleFunction): Server;
  use(route: string, fn: NextHandleFunction): Server;
  use(route: string, fn: HandleFunction): Server;

  handle(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Function,
  ): void;

  listen(
    port: number,
    hostname?: string,
    backlog?: number,
    callback?: Function,
  ): http.Server;
  listen(port: number, hostname?: string, callback?: Function): http.Server;
  listen(path: string, callback?: Function): http.Server;
  listen(handle: any, listeningListener?: Function): http.Server;
}
