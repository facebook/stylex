/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export function isCSSStyleRule(rule: CSSRule): implies rule is CSSStyleRule {
  // $FlowExpectedError[incompatible-type-guard]
  return rule.type === 1;
}

export function isCSSMediaRule(rule: CSSRule): implies rule is CSSMediaRule {
  // $FlowExpectedError[incompatible-type-guard]
  return rule.type === 4;
}

export function isCSSSupportsRule(
  rule: CSSRule,
): implies rule is CSSSupportsRule {
  // $FlowExpectedError[incompatible-type-guard]
  return rule.type === 12;
}

// CSSRule.STYLE_RULE	1
// CSSRule.CHARSET_RULE	2
// CSSRule.IMPORT_RULE	3
// CSSRule.MEDIA_RULE	4
// CSSRule.FONT_FACE_RULE	5
// CSSRule.PAGE_RULE	6
// CSSRule.KEYFRAMES_RULE	7
// CSSRule.KEYFRAME_RULE	8
// CSSRule.NAMESPACE_RULE	10
// CSSRule.COUNTER_STYLE_RULE	11
// CSSRule.SUPPORTS_RULE	12
// CSSRule.FONT_FEATURE_VALUES_RULE	14
// CSSRule.VIEWPORT_RULE	15
// CSSRule.MARGIN_RULE	16
