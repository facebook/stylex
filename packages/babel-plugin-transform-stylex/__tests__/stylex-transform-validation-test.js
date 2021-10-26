/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+jsinfra
 * @format
 */

'use strict';

jest.autoMockOff();

const messages = require('../src/messages');
const { transformSync: babelTransform } = require('@babel/core');
const TestUtil = require('fb-babel-plugin-utils/TestUtil');

function transform(source, opts = {}) {
  return babelTransform(source, {
    plugins: [
      require('@babel/plugin-proposal-object-rest-spread'),
      [require('../src/index'), opts],
    ],
  }).code;
}

const testData = {
  'ignore non-stylex imports': {
    input: `
      import classnames from 'classnames';
    `,
    throws: false,
  },
  'disallow binding require(stylex) to anything but stylex': {
    input: `
      const foo = require('stylex');
    `,
    throws: messages.ILLEGAL_REQUIRE,
  },
  'disallow binding import "stylex" to anything but stylex': {
    input: `
      import foo from 'stylex';
    `,
    throws: messages.ILLEGAL_IMPORT,
  },
  'disallow destructuring require(stylex)': {
    input: `
      const {stylex} = require('stylex');
    `,
    throws: messages.ILLEGAL_REQUIRE,
  },
  'disallow destructuring import of stylex': {
    input: `
      import {stylex} from 'stylex';
    `,
    throws: messages.ILLEGAL_IMPORT,
  },
  'allow binding require(stylex) to stylex': {
    input: `
      const stylex = require('stylex');
    `,
    throws: false,
  },
  'allow binding import "stylex" to stylex': {
    input: `
      import stylex from 'stylex';
    `,
    throws: false,
  },
  'allow named export of stylex.create()': {
    input: `
      export const styles = stylex.create({});
    `,
    throws: false,
  },
  'allow default export of stylex.create()': {
    input: `
      export default stylex.create({});
    `,
    throws: false,
  },
  'allow only one argument to stylex.create()': {
    input: `
      const styles = stylex.create({});
    `,
    throws: false,
  },
  'disallow anything but an object to stylex': {
    input: 'const styles = stylex.create(genStyles());',
    throws: messages.NON_OBJECT_FOR_STYLEX_CALL,
  },
  'disallow unbound stylex calls': {
    input: 'stylex.create({});',
    throws: messages.UNBOUND_STYLEX_CALL_VALUE,
  },
  'disallow one argument to stylex.create()': {
    input: `
      const styles = stylex.create();
    `,
    throws: messages.ILLEGAL_ARGUMENT_LENGTH,
  },
  'disallow multiple arguments to stylex.create()': {
    input: `
      const styles = stylex.create({}, {});
    `,
    throws: messages.ILLEGAL_ARGUMENT_LENGTH,
  },
  'disallows referring to an unknown string namespace': {
    input: `
      const styles = stylex.create({});
      styles('foo');
    `,
    throws: messages.UNKNOWN_NAMESPACE,
  },
  'disallows referring to an unknown object namespace': {
    input: `
      const styles = stylex.create({});
      styles({foo: true});
    `,
    throws: messages.UNKNOWN_NAMESPACE,
  },
  'allow uncomputed properties to stylex value call': {
    input: `
      const styles = stylex.create({foo: {}, bar: {}});
      styles({
        foo: true,
        bar: true,
      });
    `,
    throws: false,
  },
  'disallow computed properties to stylex value call': {
    input: `
      const styles = stylex.create({});
      styles({
        [foo]: true,
      });
    `,
    throws: messages.NON_STATIC_VALUE,
  },
  'disallow object spread to stylex value call': {
    input: `
      const styles = stylex.create({});
      styles({
        ...foo,
      });
    `,
    throws: messages.NON_STATIC_VALUE,
  },
  'allow static strings to stylex value call': {
    input: `
      const styles = stylex.create({foo: {}, bar: {}});
      styles('foo', 'bar');
    `,
    throws: false,
  },
  'allow static strings to stylex.create value call': {
    input: `
      const styles = stylex.create({foo: {}, bar: {}});
      styles('foo', 'bar');
    `,
    throws: false,
  },
  'allow conditional strings to stylex value call': {
    input: `
      const styles = stylex.create({foo: {}, bar: {}, yes: {}});
      styles('foo', true ? 'bar' : 'yes');
    `,
    throws: false,
  },
  'disallow call expression to stylex value call': {
    input: `
      const styles = stylex.create({});
      styles(foo());
    `,
    throws: messages.ILLEGAL_NAMESPACE_TYPE,
  },
  'allow numeric values to stylex.create()': {
    input: `
      const styles = stylex.create({
        root: {
          padding: 5,
        }
      });
    `,
    throws: false,
  },
  'allow string values to stylex.create()': {
    input: `
      const styles = stylex.create({
        root: {
          backgroundColor: 'red',
        }
      });
    `,
    throws: false,
  },
  'disallow computed props to stylex.create()': {
    input: `
      const styles = stylex.create({
        root: {
          [backgroundColor]: 'red',
        }
      });
    `,
    throws: messages.NON_STATIC_VALUE,
  },
  'disallow references to stylex.create()': {
    input: `
      const styles = stylex.create({
        root: {
          backgroundColor: backgroundColor,
        }
      });
    `,
    throws: messages.NON_STATIC_VALUE,
  },
  'disallow calls in stylex.create()': {
    input: `
      const styles = stylex.create({
        root: {
          backgroundColor: generateBg(),
        }
      });
    `,
    throws: messages.NON_STATIC_VALUE,
  },
  'allow references to local bindings in stylex.create()': {
    input: `
      const bg = '#eee';
      const styles = stylex.create({
        root: {
          backgroundColor: bg,
        }
      });
    `,
    throws: false,
  },
  'allow pure complex expressions in stylex.create()': {
    input: `
      const borderRadius = 2;
      const styles = stylex.create({
        root: {
          borderRadius: borderRadius * 2,
        }
      });
    `,
    throws: false,
  },
  'allow template literal expressions in stylex.create()': {
    input: `
      const borderSize = 2;
      const styles = stylex.create({
        root: {
          border: \`1px solid \${borderSize * 2}px\`,
        }
      });
    `,
    throws: false,
  },
  'allow stylex call at the root': {
    input: `
      const styles = stylex.create({});
    `,
    throws: false,
  },
  'disallow stylex call outside of the root': {
    input: `
      if (bar) {
        const styles = stylex.create({});
      }
    `,
    throws: messages.ONLY_TOP_LEVEL,
  },

  'disallow using a pseudo selector that does not start with a :': {
    input: `
      const styles = stylex.create({
        default: {
          'hover': {},
        },
      });
    `,
    throws: messages.INVALID_PSEUDO,
  },
  'disallow nested pseudo objects': {
    input: `
      const styles = stylex.create({
        default: {
          ':hover': {
            ':active': {},
          },
        },
      });
    `,
    throws: messages.ILLEGAL_NESTED_PSEUDO,
  },
  'allow arrays as style values': {
    input: `
      const styles = stylex.create({
        default: {
          transitionDuration: [500],
        },
      });
    `,
    throws: false,
  },
  'disallow non-strings/numbers as elements of a style value array': {
    input: `
      const styles = stylex.create({
        default: {
          transitionDuration: [[], {}],
        },
      });
    `,
    throws: messages.ILLEGAL_PROP_ARRAY_VALUE,
  },
  'disallow non-strings/numbers as style values': {
    input: `
      const styles = stylex.create({
        default: {
          color: true,
        },
      });
    `,
    throws: messages.ILLEGAL_PROP_VALUE,
  },
  'disallow non-objects as stylex namespace values': {
    input: `
      const styles = stylex.create({
        namespace: false,
      });
    `,
    throws: messages.ILLEGAL_NAMESPACE_VALUE,
  },
  'allows only objects inside of stylex.keyframes': {
    input: `const name = stylex.keyframes({
      from: {},
      to: {},
    });`,
    throws: false,
  },
  'disallows non-objects inside of stylex.keyframes': {
    input: `const name = stylex.keyframes({
      from: false,
    });`,
    throws: messages.ILLEGAL_NAMESPACE_VALUE,
  },
  'disallows non-objects as an arg to stylex.keyframes': {
    input: 'const name = stylex.keyframes(null);',
    throws: messages.NON_OBJECT_FOR_STYLEX_CALL,
  },
  'disallow unclosed style value functions': {
    input: "const styles = stylex.create({default: {color: 'var(--bar'}})",
    options: { definedStylexCSSVariables: { bar: 1 } },
    throws: messages.LINT_UNCLOSED_FUNCTION,
  },
  'allow only defined CSS variables': {
    input: "const styles = stylex.create({foo: { color: 'var(--bar)' }});",
    options: { definedStylexCSSVariables: { bar: 1 } },
    throws: false,
  },
  'allow undefined CSS variables': {
    input: "const styles = stylex.create({foo: { color: 'var(--foobar)' }});",
    options: { definedStylexCSSVariables: { bar: 1 } },
    throws: false,
  },
  'allow only defined CSS variables 2': {
    input: `
      const styles = stylex.create({
        foo: {
          border: 'var(--bar) var(--baz)',
        },
      });
    `,
    options: { definedStylexCSSVariables: { bar: 1, baz: 1 } },
    throws: false,
  },
  'allow undefined CSS variables 2': {
    input: `
      const styles = stylex.create({
        foo: {
          border: 'var(--bar) var(--foobaz)',
        },
      });
    `,
    options: { definedStylexCSSVariables: { bar: 1, baz: 1 } },
    throws: false,
  },
  'allow only defined CSS variables in keyframes': {
    input: `
      const styles = stylex.keyframes({
        from: {
          border: '1px solid var(--bar)',
        },
      });
    `,
    options: { definedStylexCSSVariables: { bar: 1 } },
    throws: false,
  },
  'allow undefined CSS variables in keyframes': {
    input: `
      const styles = stylex.keyframes({
        from: {
          border: '1px solid var(--foobar)',
        },
      });
    `,
    options: { definedStylexCSSVariables: { bar: 1 } },
    throws: false,
  },
  'allow undefined CSS variables, if the list of defined vars is undefined': {
    input: "const styles = stylex.create({foo: { color: 'var(--bar)' }});",
    options: { definedStylexCSSVariables: undefined },
    throws: false,
  },
  'allow undefined CSS variables, if the list of defined vars is null': {
    input: "const styles = stylex.create({foo: { color: 'var(--bar)' }});",
    options: { definedStylexCSSVariables: null },
    throws: false,
  },
  'ignore undefined CSS variables without leading --': {
    input: "const styles = stylex.create({foo: { color: 'var(bar)' }});",
    options: { definedStylexCSSVariables: { baz: 1 } },
    throws: false,
  },
};

describe('stylex-validation', () => {
  TestUtil.testSection(testData, transform);
});
