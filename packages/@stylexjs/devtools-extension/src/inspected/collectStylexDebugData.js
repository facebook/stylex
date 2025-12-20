/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { StylexDebugData } from '../types.js';

type RuleData = $ReadOnly<{
  selectorText: string,
  classNames: Array<string>,
  cssText: string,
  order: number,
}>;

// NOTE:
// This function is stringified and used using `evalInInspectedWindow` in the panel.
// So it must be a completely self-contained function that doesn't rely on any external variables or functions.
export function collectStylexDebugData(): StylexDebugData {
  function safeString(value: mixed): string {
    if (typeof value === 'string') return value;
    if (value == null) return '';
    return String(value);
  }

  function isCSSStyleRule(rule: CSSRule): implies rule is CSSStyleRule {
    // $FlowExpectedError[incompatible-type-guard]
    return rule.type === 1;
  }

  function isCSSMediaRule(rule: CSSRule): implies rule is CSSMediaRule {
    // $FlowExpectedError[incompatible-type-guard]
    return rule.type === 4;
  }

  function isCSSSupportsRule(rule: CSSRule): implies rule is CSSSupportsRule {
    // $FlowExpectedError[incompatible-type-guard]
    return rule.type === 12;
  }

  function parseDataStyleSrc(raw: string): Array<string> {
    if (typeof raw !== 'string' || raw.trim() === '') return [];
    return raw
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseSourceEntry(raw: mixed): {
    raw: string,
    file: string,
    line: number | null,
  } {
    const text = safeString(raw).trim();
    const match = text.match(/:(\d+)\s*$/);
    if (!match || match.index == null) {
      return { raw: text, file: text, line: null };
    }
    const line = Number(match[1]);
    const file = text.slice(0, match.index);
    return { raw: text, file, line: Number.isFinite(line) ? line : null };
  }

  function splitSelectors(selectorText: string): Array<string> {
    return selectorText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function extractClassNames(selectorText: string): Array<string> {
    const out = [];
    const re = /\.([_a-zA-Z0-9-]+)/g;
    let m = re.exec(selectorText);
    while (m != null) {
      out.push(m[1]);
      m = re.exec(selectorText);
    }
    return out;
  }

  function collectStyleRulesFromSheet(
    sheet: CSSStyleSheet,
    elementClassSet: $ReadOnlySet<string>,
    out: Array<RuleData>,
    state: { ruleOrder: number, skippedSheets: number },
  ) {
    let rules: ?CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      state.skippedSheets += 1;
      return;
    }
    if (!rules) return;

    function walkRules(ruleList: CSSRuleList) {
      for (let i = 0; i < ruleList.length; i += 1) {
        const rule = ruleList[i];
        if (!rule) continue;

        // CSSRule.STYLE_RULE === 1
        if (isCSSStyleRule(rule) && rule.selectorText && rule.cssText) {
          const selectorText = rule.selectorText;
          const classNames = extractClassNames(selectorText);
          if (classNames.length === 0) continue;

          let hasIntersection = false;
          for (const cls of classNames) {
            if (elementClassSet.has(cls)) {
              hasIntersection = true;
              break;
            }
          }
          if (!hasIntersection) continue;

          out.push({
            selectorText,
            classNames,
            cssText: rule.cssText,
            order: state.ruleOrder++,
          });
          continue;
        }

        // CSSRule.MEDIA_RULE === 4
        if (isCSSMediaRule(rule) && rule.conditionText && rule.cssRules) {
          let matches = false;
          try {
            matches = window.matchMedia(rule.conditionText).matches;
          } catch {
            matches = false;
          }
          if (matches) {
            walkRules(rule.cssRules);
          }
          continue;
        }

        // CSSRule.SUPPORTS_RULE === 12
        if (isCSSSupportsRule(rule) && rule.conditionText && rule.cssRules) {
          let matches = false;
          try {
            // $FlowFixMe[cannot-resolve-name]
            matches = CSS.supports(rule.conditionText);
          } catch {
            matches = false;
          }
          if (matches) {
            walkRules(rule.cssRules);
          }
          continue;
        }

        if ('cssRules' in rule) {
          // $FlowFixMe[prop-missing]
          walkRules(rule.cssRules);
        }
      }
    }

    walkRules(rules);
  }

  function tryMatchSelector(element: HTMLElement, selectorText: string) {
    const selectors = splitSelectors(selectorText);
    for (const selector of selectors) {
      try {
        if (element.matches(selector)) return selector;
      } catch {
        // ignore invalid selectors (e.g. some pseudo-elements)
      }
    }
    return null;
  }

  function stripCssComments(cssText: string) {
    let out = '';
    let i = 0;
    let inString = false;
    let quote = '';
    while (i < cssText.length) {
      const ch = cssText[i];

      if (!inString && ch === '/' && cssText[i + 1] === '*') {
        const end = cssText.indexOf('*/', i + 2);
        if (end === -1) {
          break;
        }
        i = end + 2;
        continue;
      }

      out += ch;
      if (inString) {
        if (ch === quote) {
          inString = false;
          quote = '';
        } else if (ch === '\\\\') {
          // skip escaped char
          i += 1;
          if (i < cssText.length) out += cssText[i];
        }
      } else if (ch === '"' || ch === "'") {
        inString = true;
        quote = ch;
      }

      i += 1;
    }
    return out;
  }

  function splitTopLevel(text: string, delimiterChar: string) {
    const parts = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let quote = '';

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];

      if (inString) {
        current += ch;
        if (ch === quote) {
          inString = false;
          quote = '';
        } else if (ch === '\\\\') {
          i += 1;
          if (i < text.length) current += text[i];
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = true;
        quote = ch;
        current += ch;
        continue;
      }

      if (ch === '(') depth += 1;
      if (ch === ')') depth = Math.max(depth - 1, 0);

      if (ch === delimiterChar && depth === 0) {
        parts.push(current);
        current = '';
        continue;
      }

      current += ch;
    }

    if (current) parts.push(current);
    return parts;
  }

  function parseDeclarationsFromRuleCssText(ruleCssText: unknown) {
    if (typeof ruleCssText !== 'string') return [];
    const cleaned = stripCssComments(ruleCssText);
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return [];
    const body = cleaned.slice(start + 1, end).trim();
    if (!body) return [];

    const decls = [];
    const statements = splitTopLevel(body, ';')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      const [propPart, ...rest] = splitTopLevel(stmt, ':');
      if (!propPart || rest.length === 0) continue;
      const property = propPart.trim();
      const valueRaw = rest.join(':').trim();
      if (!property || !valueRaw) continue;

      let value = valueRaw;
      let important = false;
      if (/\s!important\s*$/i.test(value)) {
        important = true;
        value = value.replace(/\s!important\s*$/i, '').trim();
      }
      decls.push({ property, value, important });
    }

    return decls;
  }

  // $FlowExpectedError[cannot-resolve-name] - $0 helps get the currently selected item
  const element = typeof $0 !== 'undefined' ? $0 : null;
  if (!element) {
    return {
      element: { tagName: '—' },
      sources: [],
      applied: { classes: [] },
    };
  }

  const tagName = safeString(element.tagName).toLowerCase();
  const classAttr: string = safeString(element.getAttribute('class'));
  const classesOrdered = classAttr.trim() ? classAttr.trim().split(/\s+/) : [];
  const elementClassSet = new Set<string>(classesOrdered);

  const dataStyleSrcRaw = safeString(element.getAttribute('data-style-src'));
  const sourcesRaw = parseDataStyleSrc(dataStyleSrcRaw);
  const sources = sourcesRaw.map(parseSourceEntry);

  const state = { ruleOrder: 0, skippedSheets: 0 };
  const rules: Array<RuleData> = [];

  const stylexStyleEls: Array<HTMLStyleElement> = Array.from(
    document.querySelectorAll('style'),
  ) as $FlowFixMe;
  const preferredSheets = stylexStyleEls
    .map((el: HTMLStyleElement) => el.sheet)
    .filter(Boolean);

  const sheets: Array<CSSStyleSheet> =
    preferredSheets.length > 0
      ? preferredSheets
      : (Array.from(document.styleSheets) as $FlowFixMe);

  for (const sheet of sheets) {
    collectStyleRulesFromSheet(sheet, elementClassSet, rules, state);
  }

  const classToDecls = new Map<string, Array<$FlowFixMe>>();
  for (const rule of rules) {
    const matchedSelector = tryMatchSelector(element, rule.selectorText);
    if (!matchedSelector) continue;

    const matchedClasses = rule.classNames.filter((cls: string) =>
      elementClassSet.has(cls),
    );
    const uniqueMatchedClasses = Array.from(new Set<string>(matchedClasses));
    if (uniqueMatchedClasses.length === 0) continue;

    const decls = parseDeclarationsFromRuleCssText(rule.cssText);
    if (decls.length === 0) continue;

    for (const cls of uniqueMatchedClasses) {
      const declList = classToDecls.get(cls);
      if (declList == null) {
        classToDecls.set(cls, [...decls]);
      } else {
        declList.push(...decls);
      }
    }
  }

  const classes = [];
  for (const cls of classesOrdered) {
    const decls = classToDecls.get(cls);
    if (!decls) continue;
    classes.push({ name: cls, declarations: decls });
  }

  return {
    element: { tagName },
    sources,
    applied: { classes },
  };
}
