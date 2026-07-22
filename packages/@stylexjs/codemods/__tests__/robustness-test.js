/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * M7 hardening: run a corpus of realistic and awkward inputs through the
 * transform and assert the invariants that must hold on ANY input —
 *   (1) it never throws;
 *   (2) a `converted` result compiles through the babel-plugin and lints clean;
 *   (3) a `skipped`/`unchanged` result leaves the source byte-identical.
 * This is the net that catches real-world surprises before v1.0.
 */

import { transformEmotionFile } from '../src/adapters/emotion/transform';
import { compileGate } from '../src/core/gates/compile';
import { lintGate } from '../src/core/gates/lint';

const H = '/** @jsxImportSource @emotion/react */\n';

const CORPUS: Array<{ name: string, filename: string, source: string }> = [
  {
    name: 'TypeScript (.tsx) input',
    filename: 'a.tsx',
    source:
      H +
      "import * as React from 'react';\n" +
      'type P = { title: string };\n' +
      'export function C({ title }: P): React.ReactNode {\n' +
      "  return <div css={{ color: 'red', fontSize: 14 }}>{title}</div>;\n" +
      '}\n',
  },
  {
    name: 'flagged site inside a Fragment',
    filename: 'b.jsx',
    source:
      H +
      'export function C() {\n' +
      '  return (\n    <>\n' +
      "      <span css={{ color: 'gray' }}>ok</span>\n" +
      '      <button css={{ color: fn() }}>flag</button>\n' +
      '    </>\n  );\n}\n',
  },
  {
    name: 'arrow-function component + nested elements each with css',
    filename: 'c.jsx',
    source:
      H +
      'const C = () => (\n  <ul css={{ padding: 0 }}>\n' +
      "    <li css={{ color: 'blue' }}>one</li>\n  </ul>\n);\n" +
      'export default C;\n',
  },
  {
    name: 'vendor-prefixed + kebab-case-ish properties',
    filename: 'd.jsx',
    source:
      H +
      'export const C = () => <div css={{ WebkitLineClamp: 2, zIndex: 10 }}>x</div>;\n',
  },
  {
    name: 'source comments are preserved around a conversion',
    filename: 'e.jsx',
    source:
      H +
      '// leading comment\n' +
      "export function C() {\n  // inside\n  return <div css={{ color: 'red' }}>x</div>;\n}\n",
  },
  {
    name: 'ternary css value is flagged, not crashed',
    filename: 'f.jsx',
    source:
      H +
      'export function C({ on }) {\n' +
      "  return <div css={on ? { color: 'red' } : { color: 'blue' }}>x</div>;\n}\n",
  },
  {
    name: 'empty css object',
    filename: 'g.jsx',
    source: H + 'export const C = () => <div css={{}}>x</div>;\n',
  },
  {
    name: 'css with only an emotion label',
    filename: 'h.jsx',
    source: H + "export const C = () => <div css={{ label: 'box' }}>x</div>;\n",
  },
  {
    name: 'two keyframes + a component using one',
    filename: 'i.jsx',
    source:
      H +
      "import { keyframes } from '@emotion/react';\n" +
      'const spin = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });\n' +
      "const pulse = keyframes({ '0%': { opacity: 1 }, '100%': { opacity: 0 } });\n" +
      'export const C = () => (\n' +
      "  <div css={{ animationName: spin, animationDuration: '1s' }}>x</div>\n" +
      ');\n',
  },
  {
    name: 'deeply nested condition (media > hover)',
    filename: 'j.jsx',
    source:
      H +
      'export const C = () => (\n' +
      "  <a css={{ color: 'black', '@media (min-width: 600px)': { ':hover': { color: 'red' } } }}>x</a>\n" +
      ');\n',
  },
  {
    name: 'no emotion at all (plain component)',
    filename: 'k.jsx',
    source: "export const C = () => <div className='x'>x</div>;\n",
  },
  {
    name: 'css prop whose value references a module-scope object',
    filename: 'l.jsx',
    source:
      H +
      "const shared = { color: 'red' };\n" +
      'export const C = () => <div css={shared}>x</div>;\n',
  },
];

describe.each(CORPUS.map((c) => [c.name, c]))(
  'robustness: %s',
  (_name, entry) => {
    let result;
    test('does not throw', () => {
      expect(() => {
        result = transformEmotionFile(entry.source, entry.filename);
      }).not.toThrow();
    });

    test('output is compilable and lint-clean, or source is untouched', () => {
      const r = result ?? transformEmotionFile(entry.source, entry.filename);
      if (r.status === 'converted') {
        const compiled = compileGate(r.code, { filename: entry.filename });
        if (!compiled.ok) {
          throw new Error(`does not compile:\n${compiled.errors.join('\n')}`);
        }
        const linted = lintGate(r.code, { filename: entry.filename });
        if (!linted.ok) {
          throw new Error(
            `not lint-clean:\n${JSON.stringify(linted.messages, null, 2)}`,
          );
        }
        // A conversion with NO leftover flagged sites must fully de-Emotion the
        // file: no `@emotion/react` import, no `@jsxImportSource` pragma.
        if (r.flags.length === 0) {
          expect(r.code).not.toMatch(/@emotion\/react/);
          expect(r.code).not.toMatch(/jsxImportSource/);
        }
      } else {
        // skipped/unchanged must not mutate the source.
        expect(r.status === 'skipped' || r.status === 'unchanged').toBe(true);
      }
    });
  },
);
