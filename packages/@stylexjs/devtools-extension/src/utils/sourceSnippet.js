/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

function findMatchingClosingCurlyBraceLine(
  lines: Array<string>,
  startLine: number,
): number | null {
  const startIndex = Math.max(0, startLine - 1);
  const firstLine = lines[startIndex] ?? '';
  const startColumn = Math.max(0, firstLine.lastIndexOf('{'));

  let depth = 0;
  let started = false;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escapeNext = false;
  const templateStack = [];

  for (let li = startIndex; li < lines.length; li += 1) {
    const text = lines[li] ?? '';
    inLineComment = false;
    const colStart = li === startIndex ? startColumn : 0;

    for (let ci = colStart; ci < text.length; ci += 1) {
      const ch = text[ci];
      const next = text[ci + 1];

      if (inLineComment) break;

      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          ci += 1;
        }
        continue;
      }

      if (inSingle) {
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        if (ch === '\\') {
          escapeNext = true;
          continue;
        }
        if (ch === "'") {
          inSingle = false;
        }
        continue;
      }

      if (inDouble) {
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        if (ch === '\\') {
          escapeNext = true;
          continue;
        }
        if (ch === '"') {
          inDouble = false;
        }
        continue;
      }

      const templateTop =
        templateStack.length > 0
          ? templateStack[templateStack.length - 1]
          : null;
      const inTemplateText = templateTop && templateTop.inExpression === false;

      if (inTemplateText) {
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        if (ch === '\\') {
          escapeNext = true;
          continue;
        }
        if (ch === '`') {
          templateStack.pop();
          continue;
        }
        if (ch === '$' && next === '{' && templateTop != null) {
          templateTop.inExpression = true;
          templateTop.exprDepth = 1;

          if (!started) {
            started = true;
            depth = 1;
          } else {
            depth += 1;
          }

          ci += 1;
          continue;
        }
        continue;
      }

      if (ch === '/' && next === '/') {
        inLineComment = true;
        ci += 1;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        ci += 1;
        continue;
      }
      if (ch === "'") {
        inSingle = true;
        escapeNext = false;
        continue;
      }
      if (ch === '"') {
        inDouble = true;
        escapeNext = false;
        continue;
      }
      if (ch === '`') {
        templateStack.push({ inExpression: false, exprDepth: 0 });
        escapeNext = false;
        continue;
      }

      if (ch === '{') {
        if (!started) {
          started = true;
          depth = 1;
        } else {
          depth += 1;
        }
        if (templateTop && templateTop.inExpression) {
          templateTop.exprDepth += 1;
        }
        continue;
      }

      if (ch === '}') {
        if (!started) continue;
        depth -= 1;
        if (templateTop && templateTop.inExpression) {
          templateTop.exprDepth -= 1;
          if (templateTop.exprDepth === 0) {
            templateTop.inExpression = false;
            templateTop.exprDepth = 0;
          }
        }
        if (depth === 0) {
          return li + 1;
        }
      }
    }
  }

  return null;
}

export function formatSourceSnippet(
  content: string,
  line: number | null,
): string {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  if (lines.length === 0) return '';

  const targetLine =
    typeof line === 'number' && Number.isFinite(line) ? line : null;
  if (targetLine == null) {
    return lines.slice(0, Math.min(40, lines.length)).join('\n');
  }

  const start = Math.max(targetLine, 1);
  const startLineText = lines[targetLine - 1] ?? '';
  const hasOpeningBrace = startLineText.includes('{');
  const braceEnd = hasOpeningBrace
    ? findMatchingClosingCurlyBraceLine(lines, targetLine)
    : null;

  let end =
    braceEnd != null ? braceEnd : Math.min(targetLine + 6, lines.length);
  const maxPreviewLines = 200;
  const truncated = end - start + 1 > maxPreviewLines;
  if (truncated) {
    end = Math.min(start + maxPreviewLines - 1, lines.length);
  }

  const width = String(end).length;
  const out = [];
  for (let i = start; i <= end; i += 1) {
    const prefix = targetLine === i ? '>' : ' ';
    const num = String(i).padStart(width, ' ');
    out.push(`${prefix} ${num} | ${lines[i - 1] ?? ''}`);
  }
  if (truncated) {
    out.push('… (preview truncated)');
  }
  return out.join('\n');
}
