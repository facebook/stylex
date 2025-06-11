/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module 'postcss' {
  declare export type PluginCreator<T> = (opts?: T) => Plugin;

  declare export interface Plugin {
    postcssPlugin: string;
    Once?: (root: Root, postcss: Postcss) => void;
    OnceExit?: (root: Root, postcss: Postcss) => void;
    Root?: (root: Root, postcss: Postcss) => void;
    RootExit?: (root: Root, postcss: Postcss) => void;
    AtRule?: (atRule: AtRule, postcss: Postcss) => void;
    AtRuleExit?: (atRule: AtRule, postcss: Postcss) => void;
    Rule?: (rule: Rule, postcss: Postcss) => void;
    RuleExit?: (rule: Rule, postcss: Postcss) => void;
    Declaration?: (decl: Declaration, postcss: Postcss) => void;
    DeclarationExit?: (decl: Declaration, postcss: Postcss) => void;
    Comment?: (comment: Comment, postcss: Postcss) => void;
    CommentExit?: (comment: Comment, postcss: Postcss) => void;
  }

  declare export interface Postcss {
    version: string;
    plugins: Array<Plugin>;
    process: (
      css: string | { toString(): string },
      opts?: ProcessOptions,
    ) => Promise<Result>;
    (plugins?: Array<Plugin>): Postcss;
  }

  declare export interface ProcessOptions {
    from?: string;
    to?: string;
    map?: boolean | { inline: boolean, annotation: boolean };
    parser?: any;
    stringifier?: any;
    syntax?: any;
  }

  declare export interface Result {
    css: string;
    map: any;
    root: Root;
    messages: Array<any>;
    processor: Postcss;
    opts: ProcessOptions;
    warnings(): Array<any>;
    toString(): string;
  }

  declare export interface Root {
    type: 'root';
    nodes: Array<ChildNode>;
    source: Source;
    raws: any;
    parent: null;
    lastEach: number;
    indexes: { [key: string]: number };
    rawCache: { [key: string]: string };
    [key: string]: any;
  }

  declare export interface AtRule {
    type: 'atrule';
    name: string;
    params: string;
    nodes?: Array<ChildNode>;
    parent: Container;
    source: Source;
    raws: any;
    [key: string]: any;
  }

  declare export interface Rule {
    type: 'rule';
    selector: string;
    nodes: Array<ChildNode>;
    parent: Container;
    source: Source;
    raws: any;
    [key: string]: any;
  }

  declare export interface Declaration {
    type: 'decl';
    prop: string;
    value: string;
    parent: Container;
    source: Source;
    raws: any;
    [key: string]: any;
  }

  declare export interface Comment {
    type: 'comment';
    text: string;
    parent: Container;
    source: Source;
    raws: any;
    [key: string]: any;
  }

  declare export interface Container {
    type: string;
    nodes: Array<ChildNode>;
    parent: Container | null;
    source: Source;
    raws: any;
    [key: string]: any;
  }

  declare export type ChildNode = AtRule | Rule | Declaration | Comment;

  declare export interface Source {
    start?: { line: number, column: number };
    end?: { line: number, column: number };
    input: { css: string, id?: string };
  }

  declare const postcss: Postcss;
  declare export default typeof postcss;
}
