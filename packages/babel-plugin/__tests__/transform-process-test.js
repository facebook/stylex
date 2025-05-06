/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, opts = {}) {
  const { code, metadata } = transformSync(source, {
    filename: opts.filename || '/stylex/packages/test.stylex.js',
    parserOpts: {
      flow: 'all',
    },
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            rootDir: '/stylex/packages/',
            type: 'commonJS',
          },
          ...opts,
        },
      ],
    ],
  });
  return { code, metadata };
}

const fixture = `
import * as stylex from '@stylexjs/stylex';
export const constants = stylex.defineConsts({
  YELLOW: 'yellow',
  ORANGE: 'var(--orange)'
});

export const breakpoints = stylex.defineConsts({
  small: '@media (max-width: 500px)',
});

export const styles = stylex.create({
  root: {
    animationName: stylex.keyframes({
      '0%': {
        boxShadow: '1px 2px 3px 4px red',
        color: constants.YELLOW
      },
      '100%': {
        boxShadow: '10px 20px 30px 40px green',
        color: constants.ORANGE
      }
    }),
    backgroundColor: 'red',
    borderColor: {
      default: 'green',
      [breakpoints.small]: 'blue'
    },
    textShadow: {
      default: '1px 2px 3px 4px red',
      '@media (min-width:320px)': '10px 20px 30px 40px green'
    }
  }
});
`;

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylexPlugin.processStylexRules', () => {
    test('no rules', () => {
      const { metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
      `);

      expect(
        stylexPlugin.processStylexRules(metadata.stylex),
      ).toMatchInlineSnapshot('""');
    });

    test('all rules (useLayers:false)', () => {
      const { metadata } = transform(fixture);

      expect(stylexPlugin.processStylexRules(metadata.stylex))
        .toMatchInlineSnapshot(`
        "@keyframes xi07kvp-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange);}}
        @keyframes xi07kvp-B{0%{box-shadow:-1px 2px 3px 4px red;color:yellow;}100%{box-shadow:-10px 20px 30px 40px green;color:var(--orange);}}
        .x1bg2uv5:not(#\\#){border-color:green}
        @media (max-width: 500px){.xtlvosw.xtlvosw:not(#\\#){border-color:blue}}
        .xckgs0v:not(#\\#):not(#\\#){animation-name:xi07kvp-B}
        .xrkmrrc:not(#\\#):not(#\\#){background-color:red}
        html:not([dir='rtl']) .x1skrh0i:not(#\\#):not(#\\#){text-shadow:1px 2px 3px 4px red}
        html[dir='rtl'] .x1skrh0i:not(#\\#):not(#\\#){text-shadow:-1px 2px 3px 4px red}
        @media (min-width:320px){html:not([dir='rtl']) .x1cmij7u.x1cmij7u:not(#\\#):not(#\\#){text-shadow:10px 20px 30px 40px green}}
        @media (min-width:320px){html[dir='rtl'] .x1cmij7u.x1cmij7u:not(#\\#):not(#\\#){text-shadow:-10px 20px 30px 40px green}}"
      `);
    });

    test('all rules (useLayers:true)', () => {
      const useLayers = true;

      const { metadata } = transform(fixture);

      expect(stylexPlugin.processStylexRules(metadata.stylex, useLayers))
        .toMatchInlineSnapshot(`
        "
        @layer priority1, priority2, priority3;
        @layer priority1{
        @keyframes xi07kvp-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange);}}
        @keyframes xi07kvp-B{0%{box-shadow:-1px 2px 3px 4px red;color:yellow;}100%{box-shadow:-10px 20px 30px 40px green;color:var(--orange);}}
        }
        @layer priority2{
        .x1bg2uv5{border-color:green}
        @media (max-width: 500px){.xtlvosw.xtlvosw{border-color:blue}}
        }
        @layer priority3{
        .xckgs0v{animation-name:xi07kvp-B}
        .xrkmrrc{background-color:red}
        html:not([dir='rtl']) .x1skrh0i{text-shadow:1px 2px 3px 4px red}
        html[dir='rtl'] .x1skrh0i{text-shadow:-1px 2px 3px 4px red}
        @media (min-width:320px){html:not([dir='rtl']) .x1cmij7u.x1cmij7u{text-shadow:10px 20px 30px 40px green}}
        @media (min-width:320px){html[dir='rtl'] .x1cmij7u.x1cmij7u{text-shadow:-10px 20px 30px 40px green}}
        }"
      `);
    });
  });
});
