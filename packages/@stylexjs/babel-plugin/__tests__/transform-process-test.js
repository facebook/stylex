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
  const pluginOpts = {
    debug: true,
    styleResolution: 'property-specificity',
    unstable_moduleResolution: {
      rootDir: '/src/app/',
      type: 'commonJS',
    },
    ...opts,
  };

  const tokens = transformSync(
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
      filename: '/src/app/tokens.stylex.js',
      parserOpts: { flow: 'all' },
      babelrc: false,
      plugins: [[stylexPlugin, pluginOpts]],
    },
  );

  const otherTokens = transformSync(
    `
    import * as stylex from '@stylexjs/stylex';
    export const spacing = stylex.defineVars({
      small: '2px',
      medium: '4px',
      large: '8px'
    });
    `,
    {
      filename: '/src/app/otherTokens.stylex.js',
      parserOpts: { flow: 'all' },
      babelrc: false,
      plugins: [[stylexPlugin, pluginOpts]],
    },
  );

  const main = transformSync(
    `
  ${tokens.code}
  ${otherTokens.code.replace("import * as stylex from '@stylexjs/stylex';", '')}
  ${source.replace("import * as stylex from '@stylexjs/stylex';", '')}
  `,
    {
      filename: '/src/app/main.js',
      parserOpts: { flow: 'all' },
      babelrc: false,
      plugins: [[stylexPlugin, pluginOpts]],
    },
  );

  const metadata = [
    ...(tokens.metadata.stylex || []),
    ...(otherTokens.metadata.stylex || []),
    ...(main.metadata.stylex || []),
  ];

  return { code: main.code, metadata };
}

const fixture = `
import * as stylex from '@stylexjs/stylex';
export const themeColor = stylex.createTheme(vars, {
  blue: 'lightblue'
});
export const themeSpacing = stylex.createTheme(spacing, {
  small: '5px',
  medium: '10px',
  large: '20px'
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
      [constants.mediaBig]: {
        default: vars.blue,
        [constants.mediaSmall]: 'yellow',
      }
    },
    textShadow: {
      default: '1px 2px 3px 4px red',
      '@media (min-width:320px)': '10px 20px 30px 40px green'
    },
    padding: spacing.large
  },
  dynamic: (color) => ({ color })
});
`;

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylexPlugin.processStylexRules', () => {
    test('no rules', () => {
      const { code, metadata } = transform('');
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const constants = {
          YELLOW: "yellow",
          ORANGE: "var(--orange)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          __themeName__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __themeName__: "xbiwvf9"
        };"
      `);
      expect(stylexPlugin.processStylexRules(metadata)).toMatchInlineSnapshot(`
        ":root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}"
      `);
    });

    test('all rules (useLayers:false)', () => {
      const { code, metadata } = transform(fixture);
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const constants = {
          YELLOW: "yellow",
          ORANGE: "var(--orange)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          __themeName__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __themeName__: "xbiwvf9"
        };
        export const themeColor = {
          xsg933n: "x6xqkwy xsg933n",
          $$css: true
        };
        export const themeSpacing = {
          xbiwvf9: "x57uvma xbiwvf9",
          $$css: true
        };
        export const styles = {
          root: {
            "animationName-kKVMdj": "animationName-xckgs0v",
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-x1cmij7u",
            "padding-kmVPX3": "padding-xss17vw",
            $$css: "app/main.js:31"
          },
          dynamic: color => [{
            "color-kMwMTN": "color-xfx01vb",
            $$css: "app/main.js:56"
          }, {
            "--color": color != null ? color : undefined
          }]
        };"
      `);
      expect(stylexPlugin.processStylexRules(metadata)).toMatchInlineSnapshot(`
        "@property --color { syntax: "*"; inherits: false;}
        @keyframes xi07kvp-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        .x6xqkwy, .x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma, .x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .padding-xss17vw:not(#\\#){padding:var(--large-x1ec7iuc)}
        .borderColor-x1bg2uv5:not(#\\#):not(#\\#){border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c:not(#\\#):not(#\\#){border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys:not(#\\#):not(#\\#){border-color:yellow}}}
        .animationName-xckgs0v:not(#\\#):not(#\\#):not(#\\#){animation-name:xi07kvp-B}
        .backgroundColor-xrkmrrc:not(#\\#):not(#\\#):not(#\\#){background-color:red}
        .color-xfx01vb:not(#\\#):not(#\\#):not(#\\#){color:var(--color)}
        .textShadow-x1skrh0i:not(#\\#):not(#\\#):not(#\\#){text-shadow:1px 2px 3px 4px red}
        @media (min-width:320px){.textShadow-x1cmij7u.textShadow-x1cmij7u:not(#\\#):not(#\\#):not(#\\#){text-shadow:10px 20px 30px 40px green}}"
      `);
    });

    test('all rules (useLayers:true)', () => {
      const { code, metadata } = transform(fixture, {
        useLayers: true,
      });
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const constants = {
          YELLOW: "yellow",
          ORANGE: "var(--orange)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          __themeName__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __themeName__: "xbiwvf9"
        };
        export const themeColor = {
          xsg933n: "x6xqkwy xsg933n",
          $$css: true
        };
        export const themeSpacing = {
          xbiwvf9: "x57uvma xbiwvf9",
          $$css: true
        };
        export const styles = {
          root: {
            "animationName-kKVMdj": "animationName-xckgs0v",
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-x1cmij7u",
            "padding-kmVPX3": "padding-xss17vw",
            $$css: "app/main.js:31"
          },
          dynamic: color => [{
            "color-kMwMTN": "color-xfx01vb",
            $$css: "app/main.js:56"
          }, {
            "--color": color != null ? color : undefined
          }]
        };"
      `);
      expect(stylexPlugin.processStylexRules(metadata, true))
        .toMatchInlineSnapshot(`
        "
        @layer priority1, priority2, priority3, priority4;
        @property --color { syntax: "*"; inherits: false;}
        @keyframes xi07kvp-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        .x6xqkwy, .x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma, .x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        @layer priority2{
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer priority4{
        .animationName-xckgs0v{animation-name:xi07kvp-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-xfx01vb{color:var(--color)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        @media (min-width:320px){.textShadow-x1cmij7u.textShadow-x1cmij7u{text-shadow:10px 20px 30px 40px green}}
        }"
      `);
    });
  });
});
