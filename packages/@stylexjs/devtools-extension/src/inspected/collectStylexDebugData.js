/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { AtomicStyleRule, StylexDebugData } from '../types.js';

type RuleData = $ReadOnly<{
  selectorText: string,
  classNames: Array<string>,
  conditions: Array<string>,
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

  function parseDataStyleSrc(raw: string): Array<string> {
    if (typeof raw !== 'string' || raw.trim() === '') return [];
    return raw
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const OVERRIDE_STORE_KEY = '__stylexDevtoolsOverrides__';
  const OVERRIDE_ELEMENT_KEY = '__stylexDevtoolsOverrideElement__';

  function getOverridesForElement(element: ?HTMLElement): Array<any> {
    if (!element) return [];
    const store = (window: any)[OVERRIDE_STORE_KEY];
    if (!store || typeof store.get !== 'function') {
      return [];
    }
    const stored = (window: any)[OVERRIDE_ELEMENT_KEY];
    const hasStored = stored && typeof stored.isSameNode === 'function';
    const sameNode = hasStored && stored.isSameNode(element);
    const elementKey = sameNode ? stored : element;
    if (!sameNode) {
      (window: any)[OVERRIDE_ELEMENT_KEY] = element;
    }
    const value = store.get(elementKey);
    if (!Array.isArray(value)) return [];
    return value.map((item) =>
      item && typeof item === 'object' ? { ...item } : item,
    );
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

  const LAYER_POLYFILL_RE = /:not\(#\\#\)/g;

  function stripLayerPolyfill(selectorText: string): {
    cleaned: string,
  } {
    if (!selectorText) {
      return { cleaned: selectorText };
    }
    const cleaned = selectorText.replace(LAYER_POLYFILL_RE, '');
    return {
      cleaned,
    };
  }

  const SIMPLE_CLASS_SELECTOR = /^\.[_a-zA-Z0-9-]+$/;

  function getAtRuleCondition(rule: CSSRule): string | null {
    if (!rule || typeof rule.cssText !== 'string') return null;
    const braceIndex = rule.cssText.indexOf('{');
    if (braceIndex === -1) return null;
    const prelude = rule.cssText.slice(0, braceIndex).trim();
    if (!prelude.startsWith('@')) return null;
    if (prelude.startsWith('@layer')) return null;
    return prelude;
  }

  function parseSelectorCondition(selectorText: string): null | {
    baseSelector: string,
    pseudoCondition: string | null,
    pseudoElementKey: string | null,
  } {
    const trimmed = selectorText.trim();
    if (!trimmed || trimmed[0] !== '.') return null;
    const { cleaned } = stripLayerPolyfill(trimmed);
    const firstColonIndex = cleaned.indexOf(':');
    if (firstColonIndex === -1) {
      return {
        baseSelector: cleaned,
        pseudoCondition: null,
        pseudoElementKey: null,
      };
    }
    const baseSelector = cleaned.slice(0, firstColonIndex).trim();
    const suffix = cleaned.slice(firstColonIndex).trim();
    const pseudoElementIndex = suffix.indexOf('::');
    if (pseudoElementIndex !== -1) {
      return {
        baseSelector,
        pseudoCondition: null,
        pseudoElementKey: suffix,
      };
    }
    return {
      baseSelector,
      pseudoCondition: suffix || null,
      pseudoElementKey: null,
    };
  }

  function isSimpleClassSelector(baseSelector: string): boolean {
    return SIMPLE_CLASS_SELECTOR.test(baseSelector);
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

    function walkRules(ruleList: CSSRuleList, conditions: Array<string>) {
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
            conditions,
            cssText: rule.cssText,
            order: state.ruleOrder++,
          });
          continue;
        }

        if ('cssRules' in rule) {
          const atCondition = getAtRuleCondition(rule);
          const nextConditions = atCondition
            ? [...conditions, atCondition]
            : conditions;
          // $FlowFixMe[prop-missing]
          walkRules(rule.cssRules, nextConditions);
        }
      }
    }

    walkRules(rules, []);
  }

  function collectAtomicRulesFromSheet(
    sheet: CSSStyleSheet,
    out: Array<AtomicStyleRule>,
    state: { skippedSheets: number },
  ) {
    let rules: ?CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      state.skippedSheets += 1;
      return;
    }
    if (!rules) return;

    function walkRules(ruleList: CSSRuleList, conditions: Array<string>) {
      for (let i = 0; i < ruleList.length; i += 1) {
        const rule = ruleList[i];
        if (!rule) continue;

        if (isCSSStyleRule(rule) && rule.selectorText && rule.cssText) {
          const decls = parseDeclarationsFromRuleCssText(rule.cssText);
          if (decls.length !== 1) continue;
          const [decl] = decls;
          const selectors = splitSelectors(rule.selectorText);
          for (const selector of selectors) {
            const selectorInfo = parseSelectorCondition(selector);
            if (!selectorInfo) continue;
            const { baseSelector, pseudoCondition, pseudoElementKey } =
              selectorInfo;
            if (!isSimpleClassSelector(baseSelector)) continue;
            const className = baseSelector.slice(1);

            const conditionParts: Array<string> = [];
            for (const entry of conditions) {
              if (!conditionParts.includes(entry)) conditionParts.push(entry);
            }
            if (pseudoCondition && !conditionParts.includes(pseudoCondition)) {
              conditionParts.push(pseudoCondition);
            }

            out.push({
              className,
              property: decl.property,
              value: decl.value,
              important: decl.important,
              conditions: conditionParts,
              ...(pseudoElementKey ? { pseudoElement: pseudoElementKey } : {}),
            });
          }
          continue;
        }

        if ('cssRules' in rule) {
          const atCondition = getAtRuleCondition(rule);
          const nextConditions = atCondition
            ? [...conditions, atCondition]
            : conditions;
          // $FlowFixMe[prop-missing]
          walkRules(rule.cssRules, nextConditions);
        }
      }
    }

    walkRules(rules, []);
  }

  function matchesSelector(element: HTMLElement, selectorText: string) {
    try {
      return element.matches(selectorText);
    } catch {
      // ignore invalid selectors (e.g. some pseudo-elements)
      return false;
    }
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
      computed: {},
      atomicRules: [],
      overrides: [],
      applied: { classes: [] },
    };
  }

  const tagName = safeString(element.tagName).toLowerCase();
  const computedStyle = window.getComputedStyle(element);
  const computed: { [string]: string } = {};
  for (let i = 0; i < computedStyle.length; i += 1) {
    const prop = computedStyle[i];
    if (!prop) continue;
    const value = computedStyle.getPropertyValue(prop);
    computed[prop] = value ? value.trim() : '';
  }
  const classAttr: string = safeString(element.getAttribute('class'));
  const classesOrdered = classAttr.trim() ? classAttr.trim().split(/\s+/) : [];
  const elementClassSet = new Set<string>(classesOrdered);

  const dataStyleSrcRaw = safeString(element.getAttribute('data-style-src'));
  const sourcesRaw = parseDataStyleSrc(dataStyleSrcRaw);
  const sources = sourcesRaw.map(parseSourceEntry);
  const overrides = getOverridesForElement(element);

  const state = { ruleOrder: 0, skippedSheets: 0 };
  const rules: Array<RuleData> = [];
  const atomicRules: Array<AtomicStyleRule> = [];
  const atomicState = { skippedSheets: 0 };

  const sheets: Array<CSSStyleSheet> = Array.from(
    document.styleSheets,
  ) as $FlowFixMe;

  for (const sheet of sheets) {
    collectStyleRulesFromSheet(sheet, elementClassSet, rules, state);
    collectAtomicRulesFromSheet(sheet, atomicRules, atomicState);
  }

  const classToDecls = new Map<string, Array<$FlowFixMe>>();
  for (const rule of rules) {
    const decls = parseDeclarationsFromRuleCssText(rule.cssText);
    if (decls.length === 0) continue;

    const selectors = splitSelectors(rule.selectorText);
    for (const selector of selectors) {
      const selectorInfo = parseSelectorCondition(selector);
      if (!selectorInfo) continue;
      const { baseSelector, pseudoCondition, pseudoElementKey } = selectorInfo;

      const matchedClasses = extractClassNames(baseSelector).filter(
        (cls: string) => elementClassSet.has(cls),
      );
      const uniqueMatchedClasses = Array.from(new Set<string>(matchedClasses));
      if (uniqueMatchedClasses.length === 0) continue;

      if (!baseSelector || !matchesSelector(element, baseSelector)) continue;

      const conditionParts: Array<string> = [];
      for (const entry of rule.conditions) {
        if (!conditionParts.includes(entry)) conditionParts.push(entry);
      }
      if (pseudoCondition && !conditionParts.includes(pseudoCondition)) {
        conditionParts.push(pseudoCondition);
      }
      const condition =
        conditionParts.length > 0 ? conditionParts.join(', ') : 'default';

      for (const cls of uniqueMatchedClasses) {
        const pseudoElementValue = pseudoElementKey || undefined;
        const declsWithCondition = decls.map((decl): $FlowFixMe => ({
          ...decl,
          condition,
          className: cls,
          ...((conditionParts.length > 0
            ? { conditions: conditionParts }
            : {}) as $FlowFixMe),
          ...((pseudoElementValue
            ? { pseudoElement: pseudoElementValue }
            : {}) as $FlowFixMe),
        }));
        const declList = classToDecls.get(cls);
        if (declList == null) {
          classToDecls.set(cls, [...declsWithCondition]);
        } else {
          declList.push(...declsWithCondition);
        }
        for (const decl of decls) {
          if (computed[decl.property] == null) {
            const value = computedStyle.getPropertyValue(decl.property);
            computed[decl.property] = value ? value.trim() : '';
          }
        }
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
    computed,
    atomicRules,
    overrides,
    applied: { classes },
  };
}
