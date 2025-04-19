/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { LegacyThemeStyles as Theme } from './StyleXTypes';

// import rtlDetect from 'rtl-detect';

import invariant from 'invariant';

const LIGHT_MODE_CLASS_NAME = '__fb-light-mode';
const DARK_MODE_CLASS_NAME = '__fb-dark-mode';

declare var globalThis: {
  CSS?: { supports: (string) => boolean },
  document?: {
    body?: {},
  },
};

/**
 * Take a theme and generate it's accompanying CSS variables
 */
function buildTheme(selector: string, theme: Theme): string {
  const lines = [];
  lines.push(`${selector} {`);

  for (const key in theme) {
    const value = theme[key];
    lines.push(`  --${key}: ${value};`);
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Create a <style> tag and add it to the head.
 */
function makeStyleTag(): HTMLStyleElement {
  const tag = document.createElement('style');
  tag.setAttribute('type', 'text/css');
  tag.setAttribute('data-stylex', 'true');

  const head = document.head || document.getElementsByTagName('head')[0];
  invariant(head, 'expected head');
  head.appendChild(tag);

  return tag;
}

/**
 * Check if the browser supports CSS variables
 */
function doesSupportCSSVariables() {
  return (
    globalThis.CSS != null &&
    globalThis.CSS.supports != null &&
    globalThis.CSS.supports('--fake-var:0')
  );
}

// Regex to replace var(--foo) with an inlined version
const VARIABLE_MATCH = /var\(--(.*?)\)/g;

// Stylesheet options
type SheetOptions = $ReadOnly<{
  rootDarkTheme?: Theme,
  rootTheme?: Theme,
  supportsVariables?: boolean,
}>;

/**
 * This class manages the CSS stylesheet for the page and the injection of new
 * CSS rules.
 */
export class StyleXSheet {
  static LIGHT_MODE_CLASS_NAME: string = LIGHT_MODE_CLASS_NAME;
  static DARK_MODE_CLASS_NAME: string = DARK_MODE_CLASS_NAME;

  constructor(opts: SheetOptions) {
    this.tag = null;
    this.injected = false;
    this.ruleForPriority = new Map();
    this.rules = [];
    this.constantsCache = new Map();

    this.rootTheme = opts.rootTheme;
    this.rootDarkTheme = opts.rootDarkTheme;
    this.supportsVariables =
      opts.supportsVariables ?? doesSupportCSSVariables();
  }

  constantsCache: Map<
    string,
    {|
      value: string | number,
      rules: Array<number | string>,
    |},
  >;

  rootTheme: ?Theme;
  rootDarkTheme: ?Theme;

  supportsVariables: boolean;

  // This is an array containing all the rules we've injected. We use this to
  // keep track of the indexes of all of our rules in the stylesheet.
  rules: Array<string>;

  // Whether we've inserted the style tag into the document.
  injected: boolean;

  // Style element to inject rules into
  tag: ?HTMLStyleElement;

  // In order to support priorities, we need to store the rule that appears
  // at the start of a priority.
  ruleForPriority: Map<number, string>;

  getVariableMatch(): RegExp {
    return VARIABLE_MATCH;
  }

  /**
   * Check if we have don't have access to the dom
   */
  isHeadless(): boolean {
    return this.tag == null || globalThis?.document?.body == null;
  }

  /**
   * Get the stylesheet tag. Throw if none exists.
   */
  getTag(): HTMLStyleElement {
    const { tag } = this;
    invariant(tag != null, 'expected tag');
    return tag;
  }

  /**
   * Get the current stylesheet CSS.
   */
  getCSS(): string {
    return this.rules.join('\n');
  }

  /**
   * Get the position of the rule in the stylesheet.
   */
  getRulePosition(rule: string): number {
    return this.rules.indexOf(rule);
  }

  /**
   * Count of the current rules in the stylesheet. Used in tests.
   */
  getRuleCount(): number {
    return this.rules.length;
  }

  /**
   * Inject a style tag into the document head
   */
  inject() {
    if (this.injected) {
      return;
    }

    this.injected = true;

    // Running in a server environment
    if (globalThis.document?.body == null) {
      this.injectTheme();
      return;
    }

    // Create style tag if in browser
    this.tag = makeStyleTag();
    this.injectTheme();
  }

  /**
   * Inject the theme styles
   */
  injectTheme() {
    if (this.rootTheme != null) {
      this.insert(
        buildTheme(`:root, .${LIGHT_MODE_CLASS_NAME}`, this.rootTheme),
        0,
      );
    }
    if (this.rootDarkTheme != null) {
      this.insert(
        buildTheme(
          `.${DARK_MODE_CLASS_NAME}:root, .${DARK_MODE_CLASS_NAME}`,
          this.rootDarkTheme,
        ),
        0,
      );
    }
  }

  /**
   * Inject custom theme styles (only for internal testing)
   */
  __injectCustomThemeForTesting(selector: string, theme: Theme) {
    if (theme != null) {
      this.insert(buildTheme(selector, theme), 0);
    }
  }

  /**
   * Delete the requested rule from the stylesheet
   */
  delete(rule: string) {
    // Get the index of this rule
    const index = this.rules.indexOf(rule);
    invariant(index >= 0, "Couldn't find the index for rule %s", rule);

    // Remove the rule from our index
    this.rules.splice(index, 1);

    if (this.isHeadless()) {
      return;
    }

    const tag = this.getTag();
    const sheet = tag.sheet;
    invariant(sheet, 'expected sheet');
    sheet.deleteRule(index);
  }

  /**
   *
   */
  normalizeRule(rule: string): string {
    const { rootTheme } = this;
    if (this.supportsVariables || rootTheme == null) {
      return rule;
    }

    return rule.replace(VARIABLE_MATCH, (_match, name) => {
      return rootTheme[name];
    });
  }

  /**
   * Get the rule position a rule should be inserted at according to the
   * specified priority.
   */
  getInsertPositionForPriority(priority: number): number {
    // If there's an end rule associated with this priority, then get the next
    // rule which will belong to the next priority
    // The rule will be inserted before it and assigned to the current priority
    const priorityRule = this.ruleForPriority.get(priority);
    if (priorityRule != null) {
      return this.rules.indexOf(priorityRule) + 1;
    }

    // If we've never created this priority before, then let's find the highest
    // priority to target
    const priorities = Array.from(this.ruleForPriority.keys())
      .sort((a, b) => b - a)
      .filter((num) => (num > priority ? 1 : 0));

    // If there's no priorities then place us at the start
    if (priorities.length === 0) {
      return this.getRuleCount();
    }

    // Place us next to the next highest priority
    const lastPriority = priorities.pop();
    // If there's no priorities then place us at the start
    if (lastPriority == null) {
      return this.getRuleCount();
    }
    return this.rules.indexOf(this.ruleForPriority.get(lastPriority));
  }

  /**
   * Insert a rule into the stylesheet.
   */
  insert(
    rawLTRRule: string,
    priority: number,
    rawRTLRule: ?string,
    metadata?: ?{|
      constKey?: string,
      constVal?: string | number,
    |},
  ): void {
    // 1) ensure the stylesheet exists
    if (!this.injected) {
      this.inject();
    }

    // 2) defineConsts update: patch or register constant values
    if (
      rawLTRRule === '' &&
      metadata?.constKey != null &&
      metadata.constVal != null
    ) {
      const key: string = (metadata.constKey: any);
      const newVal: string = String((metadata.constVal: any));
      console.log(`[defineConsts] invoked with key=${key}, constVal=${newVal}`);
      console.log('[defineConsts] cache before:', this.constantsCache);

      let entry = this.constantsCache.get(key);
      if (!entry) {
        // first defineConsts for this key nothing recorded yet
        console.log(`[defineConsts] first define for key=${key}, recording value only`);
        entry = { value: newVal, rules: [] };
        this.constantsCache.set(key, entry);
        console.log('[defineConsts] cache after adding entry:', this.constantsCache);
      } else if (entry.value !== newVal) {
        // update existing entry patch recorded rules
        const oldVal = entry.value;
        console.log(
          `[defineConsts] updating key=${key} from oldVal=${oldVal} to newVal=${newVal}`,
        );
        entry.value = newVal;
        this.constantsCache.set(key, entry);
        console.log('[defineConsts] cache after updating value:', this.constantsCache);

        for (const idx of entry.rules) {
          const before = this.rules[idx];
          this.rules[idx] = before.replaceAll(oldVal, newVal);
          console.log(
            `[defineConsts] patched rule index=${idx}`,
            `before="${before}"`,
            `after="${this.rules[idx]}"`,
          );
        }
      } else {
        console.log(`[defineConsts] key=${key} value unchanged (${entry.value}), nothing to do`);
      }
      return;
    }

    // 3) RTL variants
    if (rawLTRRule != null && rawRTLRule != null) {
      this.insert(
        addAncestorSelector(rawLTRRule, "html:not([dir='rtl'])"),
        priority,
      );
      this.insert(
        addAncestorSelector(rawRTLRule, "html[dir='rtl']"),
        priority,
      );
      return;
    }

    // 4) normal rule insertion (stylex.create)
    const rawRule = rawLTRRule;
    if (this.rules.includes(rawRule)) {
      return;
    }

    const rule = this.normalizeRule(
      addSpecificityLevel(rawRule, Math.floor(priority / 1000)),
    );
    const insertPos = this.getInsertPositionForPriority(priority);
    this.rules.splice(insertPos, 0, rule);
    this.ruleForPriority.set(priority, rule);
    console.log(`[stylex.create] inserted rule at index=${insertPos}:`, rule);
    console.log('[stylex.create] cache before scanning for constants:', this.constantsCache);

    // track usage of existing constants in this new rule
    const CONST_REGEX = /var\(--([A-Za-z0-9_-]+)\)/g;
    let m;
    while ((m = CONST_REGEX.exec(rule))) {
      const key = m[1];
      const varCall = `var(--${key})`;
      console.log(`[stylex.create] found ${varCall} in rule index=${insertPos}`);

      let entry = this.constantsCache.get(key);
      if (!entry) {
        console.log(`[stylex.create] no existing cache entry for key=${key}, creating one`);
        entry = { value: null, rules: [] };
      }
      entry.rules.push(insertPos);
      console.log(`[stylex.create] recording rule index=${insertPos} under key=${key}, rules now:`, entry.rules);
      this.constantsCache.set(key, entry);
      console.log('[stylex.create] cache after mutation:', this.constantsCache);
    }

    // 5) finally, insert into the actual CSSOM
    if (this.isHeadless()) {
      return;
    }
    const tag = this.getTag();
    const sheet = tag.sheet;
    if (sheet != null) {
      try {
        sheet.insertRule(rule, Math.min(insertPos, sheet.cssRules.length));
      } catch (err) {
        console.error('insertRule error', err, rule, insertPos);
      }
    }
  }
}

/**
 * Adds an ancestor selector in a media-query-aware way.
 */
function addAncestorSelector(selector: string, ancestorSelector: string) {
  if (!selector.startsWith('@')) {
    return `${ancestorSelector} ${selector}`;
  }

  const firstBracketIndex = selector.indexOf('{');
  const mediaQueryPart = selector.slice(0, firstBracketIndex + 1);
  const rest = selector.slice(firstBracketIndex + 1);
  return `${mediaQueryPart}${ancestorSelector} ${rest}`;
}

/**
 * Adds :not(#\#) to bump up specificity. as a polyfill for @layer
 */
function addSpecificityLevel(selector: string, index: number): string {
  if (selector.startsWith('@keyframes')) {
    return selector;
  }
  const pseudo = Array.from({ length: index })
    .map(() => ':not(#\\#)')
    .join('');

  const lastOpenCurly = selector.includes('::')
    ? selector.indexOf('::')
    : selector.lastIndexOf('{');
  const beforeCurly = selector.slice(0, lastOpenCurly);
  const afterCurly = selector.slice(lastOpenCurly);

  return `${beforeCurly}${pseudo}${afterCurly}`;
}

export const styleSheet: StyleXSheet = new StyleXSheet({
  supportsVariables: true,
  rootTheme: {},
  rootDarkTheme: {},
});
