/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * The single place in the codebase that knows which AST toolkit we use.
 * Everything else (core and adapters alike) goes through this wrapper, so
 * jscodeshift/recast stays swappable (hermes-parser, ts-morph, plain
 * babel+recast) without touching any other module — a maintainer question
 * we have deliberately kept open.
 *
 * jscodeshift is the default: format-preserving printing via recast, and
 * parses the Flow/TS/JSX found in user code. Adapters receive `j` and
 * `root` from here and never import the toolkit themselves (enforced by
 * seam-test); `core/` outside this file never sees an AST node at all.
 */

import jscodeshift from 'jscodeshift';
import type { EmittedStyle, EmittedValue } from './emit';

// 'flow' also covers plain JS + JSX; 'tsx' also covers plain TS.
export type ParserChoice = 'flow' | 'tsx';

export type Rewriter = {
  +j: $FlowFixMe,
  +root: $FlowFixMe,
};

/** Picks a parser from the file extension (TS/TSX vs Flow/JS). */
export function parserForFile(filename: string): ParserChoice {
  return /\.(ts|tsx|mts|cts)$/.test(filename) ? 'tsx' : 'flow';
}

/** Parses source into a rewriter handle (a jscodeshift Collection). */
export function parseSource(
  source: string,
  options?: { +parser?: ParserChoice },
): Rewriter {
  const j = jscodeshift.withParser(options?.parser ?? 'flow');
  return { j, root: j(source) };
}

/** Prints a rewriter handle back to source, format-preserving. */
export function printSource(rewriter: Rewriter): string {
  return rewriter.root.toSource({ quote: 'single' });
}

/**
 * Renders emitted style data (plain values, fallback arrays, or nested
 * condition objects) as an ObjectExpression — the bridge that lets
 * `core/emit.js` stay AST-free.
 */
export function styleToObjectAst(
  j: $FlowFixMe,
  style: EmittedStyle,
): $FlowFixMe {
  return objectAst(j, style);
}

const IDENTIFIER_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** A property/condition key: bare identifier where legal, else a string
 * literal (`':hover'`, `'@media (min-width: 600px)'`). */
function keyAst(j: $FlowFixMe, key: string): $FlowFixMe {
  return IDENTIFIER_KEY.test(key) ? j.identifier(key) : j.literal(key);
}

function valueAst(j: $FlowFixMe, value: EmittedValue): $FlowFixMe {
  if (Array.isArray(value)) {
    return j.arrayExpression(value.map((v) => j.literal(v)));
  }
  if (value != null && typeof value === 'object') {
    return objectAst(j, value);
  }
  return j.literal(value);
}

function objectAst(
  j: $FlowFixMe,
  object: { +[string]: EmittedValue },
): $FlowFixMe {
  return j.objectExpression(
    Object.keys(object).map((key) =>
      j.property('init', keyAst(j, key), valueAst(j, object[key])),
    ),
  );
}
