/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

type PostCSSValueASTNode =
  | {
      type: 'word' | 'unicode-range',
      value: string,
      sourceIndex: number,
    }
  | {
      type: 'string' | 'comment',
      value: string,
      quote: '"' | "'",
      sourceIndex: number,
      unclosed?: boolean,
    }
  | {
      type: 'comment',
      value: string,
      sourceIndex: number,
      unclosed?: boolean,
    }
  | {
      type: 'div',
      value: ',' | '/' | ':',
      sourceIndex: number,
      before: '' | ' ' | '  ' | '   ',
      after: '' | ' ' | '  ' | '   ',
    }
  | {
      type: 'space',
      value: ' ' | '  ' | '   ',
      sourceIndex: number,
    }
  | {
      type: 'function',
      value: string,
      before: '' | ' ' | '  ' | '   ',
      after: '' | ' ' | '  ' | '   ',
      nodes: Array<PostCSSValueASTNode>,
      unclosed?: boolean,
      sourceIndex: number,
    };

declare interface PostCSSValueAST {
  nodes: Array<PostCSSValueASTNode>;
  walk(
    callback: (PostCSSValueASTNode, number, PostCSSValueAST) => ?false,
    bubble?: boolean,
  ): void;
}

type PostCSSValueParser = {
  (string): PostCSSValueAST,
  unit(string): { number: string, unit: string } | false,
  stringify(
    nodes: PostCSSValueAST | PostCSSValueASTNode | PostCSSValueAST['nodes'],
    custom?: (PostCSSValueASTNode) => string,
  ): string,
  walk(
    ast: PostCSSValueAST,
    callback: (PostCSSValueASTNode, number, PostCSSValueAST) => ?false,
    bubble?: boolean,
  ): void,
};

declare module 'postcss-value-parser' {
  declare module.exports: PostCSSValueParser;
}
