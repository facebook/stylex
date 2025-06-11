/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import path from 'path';
import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, opts = {}) {
  const fixturesDir = path.join(__dirname, '__fixtures__');

  const pluginOpts = {
    ...opts,
    unstable_moduleResolution: {
      rootDir: fixturesDir,
      type: 'commonJS',
    },
  };

  const main = transformSync(source, {
    filename: path.join(fixturesDir, 'main.js'),
    parserOpts: { sourceType: 'module' },
    babelrc: false,
    plugins: [[stylexPlugin, pluginOpts]],
  });

  const consts = transformSync(
    `
    import * as stylex from '@stylexjs/stylex';
    export const constants = stylex.defineConsts({
      YELLOW: 'yellow',
      ORANGE: 'var(--orange)',
      mediaBig: '@media (max-width: 1000px)',
      mediaSmall: '@media (max-width: 500px)'
    });
    export const vars = stylex.defineVars({
      blue: 'blue'
    });
    `,
    {
      filename: path.join(fixturesDir, 'constants.stylex.js'),
      parserOpts: { sourceType: 'module' },
      babelrc: false,
      plugins: [[stylexPlugin, pluginOpts]],
    },
  );

  const metadata = [
    ...(main.metadata.stylex || []),
    ...(consts.metadata.stylex || []),
  ];

  return { code: main.code, metadata };
}

const fixture = `
import * as stylex from '@stylexjs/stylex';
import { constants, vars } from './constants.stylex';
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
      [constants.mediaBig]: {
        default: vars.blue,
        [constants.mediaSmall]: 'yellow',
      }
    },
    textShadow: {
      default: '1px 2px 3px 4px red',
      '@media (min-width:320px)': '10px 20px 30px 40px green'
    }
  },
  dynamic: (color) => ({ color })
});
`;

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylexPlugin.processStylexRules', () => {
    test('no rules', async () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
      `);
      expect(code).toMatchInlineSnapshot(
        '"import * as stylex from \'@stylexjs/stylex\';"',
      );
      expect(
        await stylexPlugin.processStylexRules(metadata),
      ).toMatchInlineSnapshot('":root, .x1nqdfg0{--x1i1e39s:blue;}"');
    });

    test('all rules (useLayers:false)', async () => {
      const { code, metadata } = transform(fixture);
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        import { constants, vars } from './constants.stylex';
        export const styles = {
          root: {
            kKVMdj: "xdmqw5o",
            kWkggS: "xrkmrrc",
            kVAM5u: "x1bg2uv5 xwguixi x5i7zo",
            kzOINU: null,
            kGJrpR: null,
            kaZRDh: null,
            kBCPoo: null,
            k26BEO: null,
            k5QoK5: null,
            kLZC3w: null,
            kL6WhQ: null,
            kKMj4B: "x1skrh0i x1cmij7u",
            $$css: true
          },
          dynamic: color => [{
            kMwMTN: "xfx01vb",
            $$css: true
          }, {
            "--color": color != null ? color : undefined
          }]
        };"
      `);
      expect(await stylexPlugin.processStylexRules(metadata))
        .toMatchInlineSnapshot(`
        "@property --color { syntax: "*"; inherits: false;}
        @keyframes x4ssjuf-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange);}}
        @keyframes x4ssjuf-B{0%{box-shadow:-1px 2px 3px 4px red;color:yellow;}100%{box-shadow:-10px 20px 30px 40px green;color:var(--orange);}}:root, .x1nqdfg0{--x1i1e39s:blue;}
        .x1bg2uv5:not(#\\#){border-color:green}
        .xdmqw5o:not(#\\#):not(#\\#){animation-name:x4ssjuf-B}
        .xrkmrrc:not(#\\#):not(#\\#){background-color:red}
        .xfx01vb:not(#\\#):not(#\\#){color:var(--color)}
        html:not([dir='rtl']):not(#\\#):not(#\\#) .x1skrh0i{text-shadow:1px 2px 3px 4px red}
        html[dir='rtl']:not(#\\#):not(#\\#) .x1skrh0i{text-shadow:-1px 2px 3px 4px red}
        @media (min-width:320px){html:not([dir='rtl']):not(#\\#):not(#\\#) .x1cmij7u.x1cmij7u{text-shadow:10px 20px 30px 40px green}}
        @media (min-width:320px){html[dir='rtl']:not(#\\#):not(#\\#) .x1cmij7u.x1cmij7u{text-shadow:-10px 20px 30px 40px green}}
        @media (max-width: 1000px){.xwguixi.xwguixi:not(#\\#):not(#\\#):not(#\\#){border-color:var(--x1i1e39s)}}
        @media (max-width: 500px){@media (max-width: 1000px){.x5i7zo.x5i7zo.x5i7zo:not(#\\#):not(#\\#):not(#\\#):not(#\\#){border-color:yellow}}}"
      `);
    });

    test('all rules (useLayers:true)', async () => {
      const { code, metadata } = transform(fixture, {
        useLayers: true,
      });
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        import { constants, vars } from './constants.stylex';
        export const styles = {
          root: {
            kKVMdj: "xdmqw5o",
            kWkggS: "xrkmrrc",
            kVAM5u: "x1bg2uv5 xwguixi x5i7zo",
            kzOINU: null,
            kGJrpR: null,
            kaZRDh: null,
            kBCPoo: null,
            k26BEO: null,
            k5QoK5: null,
            kLZC3w: null,
            kL6WhQ: null,
            kKMj4B: "x1skrh0i x1cmij7u",
            $$css: true
          },
          dynamic: color => [{
            kMwMTN: "xfx01vb",
            $$css: true
          }, {
            "--color": color != null ? color : undefined
          }]
        };"
      `);
      expect(await stylexPlugin.processStylexRules(metadata, true))
        .toMatchInlineSnapshot(`
        "
        @layer priority1, priority2, priority3, priority4, priority5;
        @property --color { syntax: "*"; inherits: false;}
        @keyframes x4ssjuf-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange);}}
        @keyframes x4ssjuf-B{0%{box-shadow:-1px 2px 3px 4px red;color:yellow;}100%{box-shadow:-10px 20px 30px 40px green;color:var(--orange);}}
        :root, .x1nqdfg0{--x1i1e39s:blue;}
        @layer priority2{
        .x1bg2uv5{border-color:green}
        }
        @layer priority3{
        .xdmqw5o{animation-name:x4ssjuf-B}
        .xrkmrrc{background-color:red}
        .xfx01vb{color:var(--color)}
        html:not([dir='rtl']) .x1skrh0i{text-shadow:1px 2px 3px 4px red}
        html[dir='rtl'] .x1skrh0i{text-shadow:-1px 2px 3px 4px red}
        @media (min-width:320px){html:not([dir='rtl']) .x1cmij7u.x1cmij7u{text-shadow:10px 20px 30px 40px green}}
        @media (min-width:320px){html[dir='rtl'] .x1cmij7u.x1cmij7u{text-shadow:-10px 20px 30px 40px green}}
        }
        @layer priority4{
        @media (max-width: 1000px){.xwguixi.xwguixi{border-color:var(--x1i1e39s)}}
        }
        @layer priority5{
        @media (max-width: 500px){@media (max-width: 1000px){.x5i7zo.x5i7zo.x5i7zo{border-color:yellow}}}
        }"
      `);
    });
  });
});
