/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+comet_ui
 * @flow strict
 * @format
 * @has-side-effects_DO_NOT_USE
 */

'use strict';

import type {
  Keyframes,
  NestedCSSPropTypes,
  Stylex$Create,
  StyleXArray,
} from './StyleXTypes';

import {styleSheet} from './StyleXSheet';

type DedupeStyles = $ReadOnly<{
  [key: string]: string | $ReadOnly<{[key: string]: string, ...}>,
  ...
}>;

let warnedOnInject = false;

function stylexPrepare<TObj: {}>(
  rawStyles: Array<StyleXArray<?TObj | boolean>>,
): TObj {
  // rawStyles is already a new array so we can reverse it inline;
  const workingStack = rawStyles.reverse();

  // When flow creates an empty object, it doesn't like for it to have
  // the type of an exact object. This is just a local override that
  // uses the correct types and overrides the problems of Flow.
  // eslint-disable-next-line fb-www/no-flowfixme-in-flow-strict
  const baseObject: TObj = ({}: $FlowFixMe);
  // const nestedObjects: {[string]: {[string]: string}} = {};
  while (workingStack.length) {
    const next = workingStack.pop();
    if (Array.isArray(next)) {
      // reverse push onto the stack;
      for (let i = next.length - 1; i >= 0; i--) {
        workingStack.push(next[i]);
      }
      continue;
    }
    const styleObj = next;
    if (styleObj != null && typeof styleObj === 'object') {
      for (const key in styleObj) {
        const value = styleObj[key];
        if (typeof value === 'string') {
          baseObject[key] = value;
        } else if (typeof value === 'object') {
          baseObject[key] = baseObject[key] ?? {};
          Object.assign(baseObject[key], value);
        }
      }
    }
  }

  return baseObject;
}

function stylex(
  ...rawStyles: Array<StyleXArray<?DedupeStyles | boolean>>
): string {
  // stylexPrepare has more generic types than `stylex` this is why we need
  // the FlowFixMe. This isn't ideal, but the FlowFixMe is local only and
  // the exported types are correctly exported.
  // eslint-disable-next-line fb-www/no-flowfixme-in-flow-strict
  const baseObject = stylexPrepare((rawStyles: $FlowFixMe));

  let baseClassString = '';
  for (const key in baseObject) {
    if (Boolean(baseObject[key])) {
      if (typeof baseObject[key] === 'string') {
        baseClassString += baseClassString
          ? ' ' + baseObject[key]
          : baseObject[key];
      } else if (typeof baseObject[key] === 'object') {
        const pseudoObj = baseObject[key];
        for (const key in pseudoObj) {
          const val = pseudoObj[key];
          baseClassString += baseClassString ? ' ' + val : val;
        }
      }
    }
  }

  return baseClassString;
}

stylex.compose = function stylexCompose(
  ...styles: Array<StyleXArray<?NestedCSSPropTypes | boolean>>
): NestedCSSPropTypes {
  // Similar reasons as above.
  // eslint-disable-next-line fb-www/no-flowfixme-in-flow-strict
  return stylexPrepare((styles: $FlowFixMe));
};

function stylexCreate(_styles: {...}) {
  throw new Error(
    'stylex.create should never be called. It should be compiled away.'
  );
}

/**
 * WARNING!
 * If you add another method to stylex make sure to update
 * CommonJSParser::getStylexPrefixSearchConf().
 *
 * Otherwise any callsites will fatal.
 */
stylex.create = (stylexCreate: Stylex$Create);

stylex.keyframes = (_keyframes: Keyframes): string => {
  throw new Error(
    'stylex.keyframes should never be called'
  );
};

stylex.inject = (
  ltrRule: string,
  priority: number,
  rtlRule: ?string = null,
): void => {
  styleSheet.insert(ltrRule, priority, rtlRule);
};

stylex.dedupe = (...styles: $ReadOnlyArray<DedupeStyles>): string => {
  return stylex(...styles);
};

// actual styles are defined in the compiler
type AbsoluteFill = $ReadOnly<{
  bottom: 0,
  boxSizing: 'border-box',
  end: 0,
  position: 'absolute',
  start: 0,
  top: 0,
}>;
stylex.absoluteFill = {
  bottom: 0,
  boxSizing: 'border-box',
  end: 0,
  position: 'absolute',
  start: 0,
  top: 0,
};

type AbsoluteCenter = $ReadOnly<{
  boxSizing: 'border-box',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}>;
stylex.absoluteCenter = {
  boxSizing: 'border-box',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
};

type BlockBase = $ReadOnly<{
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'block',
  flexGrow: 1,
  flexShrink: 1,
  margin: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
}>;
stylex.blockBase = {
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'block',
  flexGrow: 1,
  flexShrink: 1,
  margin: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
};

type InlineBase = $ReadOnly<{
  ...BlockBase,
  display: 'inline',
}>;
stylex.inlineBase = {
  ...stylex.blockBase,
  display: 'inline',
};

type ButtonBase = $ReadOnly<{
  appearance: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'inherit',
  zIndex: 0,
}>;
stylex.buttonBase = {
  appearance: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'inherit',
  zIndex: 0,
};

type FlexBase = $ReadOnly<{
  alignItems: 'stretch',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 1,
  justifyContent: 'space-between',
  margin: 0,
  minHeight: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
}>;
stylex.flexBase = {
  alignItems: 'stretch',
  borderStyle: 'solid',
  borderWidth: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 1,
  justifyContent: 'space-between',
  margin: 0,
  minHeight: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
};

type FlexInlineBase = $ReadOnly<{
  ...FlexBase,
  display: 'inline-flex',
}>;
stylex.flexInlineBase = {
  ...stylex.flexBase,
  display: 'inline-flex',
};

type LinkBase = $ReadOnly<{
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxSizing: 'border-box',
  color: 'inherit',
  cursor: 'pointer',
  position: 'relative',
  textDecoration: 'none',
  zIndex: 0,
}>;
stylex.linkBase = {
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxSizing: 'border-box',
  color: 'inherit',
  cursor: 'pointer',
  position: 'relative',
  textDecoration: 'none',
  zIndex: 0,
};

type ListBase = $ReadOnly<{
  boxSizing: 'border-box',
  listStyle: 'none',
  marginBottom: 0,
  marginTop: 0,
  paddingStart: 0,
}>;
stylex.listBase = {
  boxSizing: 'border-box',
  listStyle: 'none',
  marginBottom: 0,
  marginTop: 0,
  paddingStart: 0,
};

// Shorthand for making an element visible only to screen readers
type VisuallyHidden = $ReadOnly<{
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  width: 1,
}>;
stylex.visuallyHidden = {
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  width: 1,
};

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?DedupeStyles | boolean>>): string,
  visuallyHidden: VisuallyHidden,
  absoluteCenter: AbsoluteCenter,
  absoluteFill: AbsoluteFill,
  blockBase: BlockBase,
  buttonBase: ButtonBase,
  compose: (
    ...styles: $ReadOnlyArray<StyleXArray<?NestedCSSPropTypes | boolean>>
  ) => NestedCSSPropTypes,
  create: Stylex$Create,
  dedupe: (...styles: $ReadOnlyArray<DedupeStyles>) => string,
  flexBase: FlexBase,
  flexInlineBase: FlexInlineBase,
  inject: (ltrRule: string, priority: number, rtlRule: ?string) => void,
  inlineBase: InlineBase,
  keyframes: (keyframes: Keyframes) => string,
  linkBase: LinkBase,
  listBase: ListBase,
  ...
};

export default (stylex: IStyleX);
