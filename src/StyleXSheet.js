/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+comet_ui
 * @flow strict
 * @format
 */

'use strict';

import type {Theme} from './StyleXTypes';

import rtlDetect from 'rtl-detect';

import invariant from 'invariant';

const LIGHT_MODE_CLASS_NAME = '__fb-light-mode';
const DARK_MODE_CLASS_NAME = '__fb-dark-mode';

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
  tag.setAttribute('data-styled', 'true');

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
    window.CSS != null &&
    window.CSS.supports != null &&
    window.CSS.supports('--fake-var:0')
  );
}

// Regex to replace var(--foo) with an inlined version
const VARIABLE_MATCH = /var\(--(.*?)\)/g;

// Stylesheet options
type SheetOptions = $ReadOnly<{
  rootDarkTheme?: Theme,
  rootTheme: ?Theme,
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

    this.rootTheme = opts.rootTheme;
    this.rootDarkTheme = opts.rootDarkTheme;
    this.supportsVariables =
      opts.supportsVariables ?? doesSupportCSSVariables();
    this._isRTL = rtlDetect.isRtlLang(navigator?.language ?? 'es_US');
  }

  _isRTL: boolean;

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
    return this.tag == null || window?.document?.body == null;
  }

  /**
   * Get the stylesheet tag. Throw if none exists.
   */
  getTag(): HTMLStyleElement {
    const {tag} = this;
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
    if (window.document?.body == null) {
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
    const {rootTheme} = this;
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
      .filter(num => (num > priority ? 1 : 0));

    // If there's no priorities then place us at the start
    if (priorities.length === 0) {
      return this.getRuleCount();
    }

    // Place us next to the next highest priority
    const lastPriority = priorities.pop();
    return this.rules.indexOf(this.ruleForPriority.get(lastPriority));
  }

  /**
   * Insert a rule into the stylesheet.
   */
  insert(rawLTRRule: string, priority: number, rawRTLRule: ?string) {
    // Inject the stylesheet if it hasn't already been
    if (this.injected === false) {
      this.inject();
    }

    const rawRule = this._isRTL && rawRTLRule != null ? rawRTLRule : rawLTRRule;

    // Don't insert this rule if it already exists
    if (this.rules.includes(rawRule)) {
      return;
    }

    const rule = this.normalizeRule(rawRule);

    // Get the position where we should insert the rule
    const insertPos = this.getInsertPositionForPriority(priority);
    this.rules.splice(insertPos, 0, rule);

    // Set this rule as the end of the priority group
    this.ruleForPriority.set(priority, rule);

    if (this.isHeadless()) {
      return;
    }

    const tag = this.getTag();
    const sheet = tag.sheet;

    if (sheet != null) {
      try {
        sheet.insertRule(rule, insertPos);
      } catch {
        // Ignore: error likely due to inserting prefixed rules (e.g. `::-moz-range-thumb`).
      }
    }
    // Ignore the case where sheet == null. It's an edge-case Edge 17 bug.
  }
}

export const styleSheet: StyleXSheet = new StyleXSheet({
  supportsVariables: true,
  rootTheme: {},
  rootDarkTheme: {},
});
