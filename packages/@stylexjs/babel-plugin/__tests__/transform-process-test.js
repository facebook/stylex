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
    enableDebugClassNames: true,
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
      ORANGE: 'var(--orange-theme-color)',
      mediaBig: '@media (max-width: 1000px)',
      mediaSmall: '@media (max-width: 500px)'
    });
    export const vars = stylex.defineVars({
      blue: 'blue',
      marginTokens: {
        default: "10px",
        "@media (min-width: 600px)": "20px"
      },
      colorTokens: {
        default: 'red',
        '@media (prefers-color-scheme: dark)': {
          default: 'lightblue',
          '@supports (color: oklab(0 0 0))': 'oklab(0.7 -0.3 -0.4)',
        }
      },
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
      filename: opts.filename ?? '/src/app/main.js',
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
    backgroundColor: {
      default: 'red',
      ':hover': 'blue',
      [stylex.when.ancestor(':focus')]: 'green',
      '@media (max-width: 1000px)': {
        default: 'yellow',
        [stylex.when.descendant(':focus')]: 'purple',
        [stylex.when.anySibling(':active')]: 'orange',
      }
    },
    margin: vars.marginTokens,
    borderColor: {
      default: 'green',
      [constants.mediaBig]: {
        default: vars.blue,
        [constants.mediaSmall]: 'yellow',
      }
    },
    outlineColor: vars.colorTokens,
    textShadow: {
      default: '1px 2px 3px 4px red',
      '@media (min-width:320px)': '10px 20px 30px 40px green'
    },
    padding: spacing.large,
    margin: '10px 20px',
    float: 'inline-start'
  },
  overrideColor: {
    [constants.ORANGE]: 'red'
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
          ORANGE: "var(--orange-theme-color)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          marginTokens: "var(--marginTokens-x8nt2k2)",
          colorTokens: "var(--colorTokens-xkxfyv)",
          __varGroupHash__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __varGroupHash__: "xbiwvf9"
        };"
      `);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        ":root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}"
      `);
    });

    test('all rules (useLayers:false)', () => {
      const { code, metadata } = transform(fixture, {
        filename: '/src/app/components/main.js',
      });
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const constants = {
          YELLOW: "yellow",
          ORANGE: "var(--orange-theme-color)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          marginTokens: "var(--marginTokens-x8nt2k2)",
          colorTokens: "var(--colorTokens-xkxfyv)",
          __varGroupHash__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __varGroupHash__: "xbiwvf9"
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
            "animationName-kKVMdj": "animationName-x13ah0pd",
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc backgroundColor-xbrh7vm backgroundColor-xfy810d backgroundColor-xahc4vn backgroundColor-x1t4kl4c backgroundColor-x975j7z",
            "margin-kogj98": "margin-xymmreb",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "outlineColor-kjBf7l": "outlineColor-x184ctg8",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-xtj17id",
            "padding-kmVPX3": "padding-xss17vw",
            "float-kyUFMd": "float-x1kmio9f",
            $$css: "components/main.js:33"
          },
          overrideColor: {
            "--orange-theme-color": "--orange-theme-color-xufgesz",
            $$css: "components/main.js:71"
          },
          dynamic: color => [{
            "color-kMwMTN": color != null ? "color-x14rh7hd" : color,
            $$css: "components/main.js:74"
          }, {
            "--x-color": color != null ? color : undefined
          }]
        };"
      `);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "@property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        .margin-xymmreb:not(#\\#){margin:10px 20px}
        .padding-xss17vw:not(#\\#){padding:var(--large-x1ec7iuc)}
        .borderColor-x1bg2uv5:not(#\\#):not(#\\#){border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c:not(#\\#):not(#\\#){border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys:not(#\\#):not(#\\#){border-color:yellow}}}
        .animationName-x13ah0pd:not(#\\#):not(#\\#):not(#\\#){animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc:not(#\\#):not(#\\#):not(#\\#){background-color:red}
        .color-x14rh7hd:not(#\\#):not(#\\#):not(#\\#){color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f:not(#\\#):not(#\\#):not(#\\#){float:left}
        html[dir='rtl'] .float-x1kmio9f:not(#\\#):not(#\\#):not(#\\#){float:right}
        .outlineColor-x184ctg8:not(#\\#):not(#\\#):not(#\\#){outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i:not(#\\#):not(#\\#):not(#\\#){text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *):not(#\\#):not(#\\#):not(#\\#){background-color:green}
        .backgroundColor-xbrh7vm:hover:not(#\\#):not(#\\#):not(#\\#){background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn:not(#\\#):not(#\\#):not(#\\#){background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id:not(#\\#):not(#\\#):not(#\\#){text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)):not(#\\#):not(#\\#):not(#\\#){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)):not(#\\#):not(#\\#):not(#\\#){background-color:orange}}"
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
          ORANGE: "var(--orange-theme-color)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          marginTokens: "var(--marginTokens-x8nt2k2)",
          colorTokens: "var(--colorTokens-xkxfyv)",
          __varGroupHash__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __varGroupHash__: "xbiwvf9"
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
            "animationName-kKVMdj": "animationName-x13ah0pd",
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc backgroundColor-xbrh7vm backgroundColor-xfy810d backgroundColor-xahc4vn backgroundColor-x1t4kl4c backgroundColor-x975j7z",
            "margin-kogj98": "margin-xymmreb",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "outlineColor-kjBf7l": "outlineColor-x184ctg8",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-xtj17id",
            "padding-kmVPX3": "padding-xss17vw",
            "float-kyUFMd": "float-x1kmio9f",
            $$css: "main.js:33"
          },
          overrideColor: {
            "--orange-theme-color": "--orange-theme-color-xufgesz",
            $$css: "main.js:71"
          },
          dynamic: color => [{
            "color-kMwMTN": color != null ? "color-x14rh7hd" : color,
            $$css: "main.js:74"
          }, {
            "--x-color": color != null ? color : undefined
          }]
        };"
      `);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: true,
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer priority1, priority2, priority3, priority4;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('useLayers with before option', () => {
      const { metadata } = transform(fixture);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: {
            before: ['reset', 'typography'],
          },
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer reset, typography, priority1, priority2, priority3, priority4;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('useLayers with after option', () => {
      const { metadata } = transform(fixture);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: {
            after: ['overrides', 'xds.theme'],
          },
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer priority1, priority2, priority3, priority4, overrides, xds.theme;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('useLayers with both before and after', () => {
      const { metadata } = transform(fixture);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: {
            before: ['reset'],
            after: ['xds.theme'],
          },
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer reset, priority1, priority2, priority3, priority4, xds.theme;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('useLayers with prefix option', () => {
      const { metadata } = transform(fixture);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: {
            prefix: 'stylex',
          },
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer stylex.priority1, stylex.priority2, stylex.priority3, stylex.priority4;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer stylex.priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer stylex.priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer stylex.priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('useLayers with prefix, before, and after combined', () => {
      const { metadata } = transform(fixture);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: {
            prefix: 'stylex',
            before: ['reset', 'typography'],
            after: ['xds.theme'],
          },
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer reset, typography, stylex.priority1, stylex.priority2, stylex.priority3, stylex.priority4, xds.theme;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer stylex.priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer stylex.priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer stylex.priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('useLayers with multi-segment dot-notated prefix (XDS use case)', () => {
      const { metadata } = transform(fixture);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: {
            prefix: 'xds.base',
            before: ['xds.reset', 'xds.typography'],
            after: ['xds.theme'],
          },
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer xds.reset, xds.typography, xds.base.priority1, xds.base.priority2, xds.base.priority3, xds.base.priority4, xds.theme;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer xds.base.priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer xds.base.priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer xds.base.priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('empty before/after produce standard layer declaration', () => {
      const { metadata } = transform(fixture);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: {
            before: [],
            after: [],
          },
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        "
        @layer priority1, priority2, priority3, priority4;
        @property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        @layer priority2{
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        }
        @layer priority3{
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        }
        @layer priority4{
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}
        }"
      `);
    });

    test('all rules (legacyDisableLayers:true)', () => {
      const { code, metadata } = transform(fixture);
      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const constants = {
          YELLOW: "yellow",
          ORANGE: "var(--orange-theme-color)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          marginTokens: "var(--marginTokens-x8nt2k2)",
          colorTokens: "var(--colorTokens-xkxfyv)",
          __varGroupHash__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __varGroupHash__: "xbiwvf9"
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
            "animationName-kKVMdj": "animationName-x13ah0pd",
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc backgroundColor-xbrh7vm backgroundColor-xfy810d backgroundColor-xahc4vn backgroundColor-x1t4kl4c backgroundColor-x975j7z",
            "margin-kogj98": "margin-xymmreb",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "outlineColor-kjBf7l": "outlineColor-x184ctg8",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-xtj17id",
            "padding-kmVPX3": "padding-xss17vw",
            "float-kyUFMd": "float-x1kmio9f",
            $$css: "main.js:33"
          },
          overrideColor: {
            "--orange-theme-color": "--orange-theme-color-xufgesz",
            $$css: "main.js:71"
          },
          dynamic: color => [{
            "color-kMwMTN": color != null ? "color-x14rh7hd" : color,
            $$css: "main.js:74"
          }, {
            "--x-color": color != null ? color : undefined
          }]
        };"
      `);
      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: false,
          legacyDisableLayers: true,
        }),
      ).toMatchInlineSnapshot(`
        "@property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}
        .--orange-theme-color-xufgesz{--orange-theme-color:red}
        .margin-xymmreb{margin:10px 20px}
        .padding-xss17vw{padding:var(--large-x1ec7iuc)}
        .borderColor-x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.borderColor-x5ugf7c.borderColor-x5ugf7c{border-color:var(--blue-xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.borderColor-xqiy1ys.borderColor-xqiy1ys.borderColor-xqiy1ys{border-color:yellow}}}
        .animationName-x13ah0pd{animation-name:x35atj5-B}
        .backgroundColor-xrkmrrc{background-color:red}
        .color-x14rh7hd{color:var(--x-color)}
        html:not([dir='rtl']) .float-x1kmio9f{float:left}
        html[dir='rtl'] .float-x1kmio9f{float:right}
        .outlineColor-x184ctg8{outline-color:var(--colorTokens-xkxfyv)}
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .backgroundColor-xfy810d.backgroundColor-xfy810d:where(.x-default-marker:focus *){background-color:green}
        .backgroundColor-xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.backgroundColor-xahc4vn.backgroundColor-xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.textShadow-xtj17id.textShadow-xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c.backgroundColor-x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.backgroundColor-x975j7z.backgroundColor-x975j7z.backgroundColor-x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}"
      `);
    });

    test('legacy-expand-shorthands with logical styles polyfill', () => {
      const { code, metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const styles = stylex.create({
          container: {
            margin: '10px 20px',
            padding: '5px 15px',
            float: 'inline-start'
          }
        });
      `,
        {
          styleResolution: 'legacy-expand-shorthands',
          enableLogicalStylesPolyfill: true,
        },
      );

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        export const constants = {
          YELLOW: "yellow",
          ORANGE: "var(--orange-theme-color)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
          marginTokens: "var(--marginTokens-x8nt2k2)",
          colorTokens: "var(--colorTokens-xkxfyv)",
          __varGroupHash__: "xsg933n"
        };
        export const spacing = {
          small: "var(--small-x19twipt)",
          medium: "var(--medium-xypjos2)",
          large: "var(--large-x1ec7iuc)",
          __varGroupHash__: "xbiwvf9"
        };
        export const styles = {
          container: {
            "marginTop-keoZOQ": "marginTop-x1anpbxc",
            "marginInlineEnd-k71WvV": "marginInlineEnd-x3aesyq",
            "marginBottom-k1K539": "marginBottom-xyorhqc",
            "marginInlineStart-keTefX": "marginInlineStart-xqsn43r",
            "paddingTop-kLKAdn": "paddingTop-x123j3cw",
            "paddingInlineEnd-kwRFfy": "paddingInlineEnd-x1q3ajuy",
            "paddingBottom-kGO01o": "paddingBottom-xs9asl8",
            "paddingInlineStart-kZCmMZ": "paddingInlineStart-x1gx403c",
            "float-kyUFMd": "float-xj87blo",
            $$css: "main.js:25"
          }
        };"
      `);

      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: true,
        }),
      ).toMatchInlineSnapshot(`
        ":root, [dir="ltr"] {
          --stylex-logical-start: left;
          --stylex-logical-end: right;
        }
        [dir="rtl"] {
          --stylex-logical-start: right;
          --stylex-logical-end: left;
        }
        :root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .float-xj87blo:not(#\\#){float:var(--stylex-logical-start)}
        /* @ltr begin */.marginInlineStart-xqsn43r:not(#\\#){margin-left:20px}/* @ltr end */
        /* @rtl begin */.marginInlineStart-xqsn43r:not(#\\#){margin-right:20px}/* @rtl end */
        /* @ltr begin */.marginInlineEnd-x3aesyq:not(#\\#){margin-right:20px}/* @ltr end */
        /* @rtl begin */.marginInlineEnd-x3aesyq:not(#\\#){margin-left:20px}/* @rtl end */
        /* @ltr begin */.paddingInlineStart-x1gx403c:not(#\\#){padding-left:15px}/* @ltr end */
        /* @rtl begin */.paddingInlineStart-x1gx403c:not(#\\#){padding-right:15px}/* @rtl end */
        /* @ltr begin */.paddingInlineEnd-x1q3ajuy:not(#\\#){padding-right:15px}/* @ltr end */
        /* @rtl begin */.paddingInlineEnd-x1q3ajuy:not(#\\#){padding-left:15px}/* @rtl end */
        .marginBottom-xyorhqc:not(#\\#):not(#\\#){margin-bottom:10px}
        .marginTop-x1anpbxc:not(#\\#):not(#\\#){margin-top:10px}
        .paddingBottom-xs9asl8:not(#\\#):not(#\\#){padding-bottom:5px}
        .paddingTop-x123j3cw:not(#\\#):not(#\\#){padding-top:5px}"
      `);
    });

    test('legacy-expand-shorthands duplicates theme selectors for higher precedence', () => {
      const { _code, metadata } = transform(
        `
        import * as stylex from '@stylexjs/stylex';
        export const themeColor = stylex.createTheme(vars, {
          blue: 'lightblue'
        });
        export const themeSpacing = stylex.createTheme(spacing, {
          small: '5px',
          medium: '10px',
          large: '20px'
        });
      `,
        {
          styleResolution: 'legacy-expand-shorthands',
        },
      );

      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: false,
        }),
      ).toMatchInlineSnapshot(`
        ":root, .xsg933n{--blue-xpqh4lw:blue;--marginTokens-x8nt2k2:10px;--colorTokens-xkxfyv:red;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--marginTokens-x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--colorTokens-xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x6xqkwy.x6xqkwy, .x6xqkwy.x6xqkwy:root{--blue-xpqh4lw:lightblue;}
        .x57uvma.x57uvma, .x57uvma.x57uvma:root{--large-x1ec7iuc:20px;--medium-xypjos2:10px;--small-x19twipt:5px;}"
      `);
    });

    test('no mutation of rules', () => {
      const { metadata } = transform(fixture);

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#deep_freezing
      function deepFreeze(object) {
        const propNames = Reflect.ownKeys(object);

        for (const name of propNames) {
          const value = object[name];

          if (
            (value && typeof value === 'object') ||
            typeof value === 'function'
          ) {
            deepFreeze(value);
          }
        }

        return Object.freeze(object);
      }

      deepFreeze(metadata);

      expect(() => {
        stylexPlugin.processStylexRules(metadata);
      }).not.toThrow();
    });

    test('useLegacyClassnamesSort: false (default behavior)', () => {
      const { _code, metadata } = transform(fixture, {
        enableDebugClassNames: false,
      });

      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: true,
          useLegacyClassnamesSort: false,
          legacyDisableLayers: true,
        }),
      ).toMatchInlineSnapshot(`
        "@property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xbiwvf9{--x19twipt:2px;--xypjos2:4px;--x1ec7iuc:8px;}
        :root, .xsg933n{--xpqh4lw:blue;--x8nt2k2:10px;--xkxfyv:red;}
        @media (min-width: 600px){:root, .xsg933n{--x8nt2k2:20px;}}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--xkxfyv:lightblue;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x4hn0rr.x4hn0rr, .x4hn0rr.x4hn0rr:root{--x1ec7iuc:20px;--xypjos2:10px;--x19twipt:5px;}
        .x1coplze.x1coplze, .x1coplze.x1coplze:root{--xpqh4lw:lightblue;}
        .xufgesz{--orange-theme-color:red}
        .xymmreb{margin:10px 20px}
        .x1s2izit{padding:var(--x1ec7iuc)}
        .x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.xio2edn.xio2edn{border-color:var(--xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.xqiy1ys.xqiy1ys.xqiy1ys{border-color:yellow}}}
        .x13ah0pd{animation-name:x35atj5-B}
        .xrkmrrc{background-color:red}
        .x14rh7hd{color:var(--x-color)}
        /* @ltr begin */.x1kmio9f{float:left}/* @ltr end */
        /* @rtl begin */.x1kmio9f{float:right}/* @rtl end */
        .x18abd1y{outline-color:var(--xkxfyv)}
        .x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .xfy810d.xfy810d:where(.x-default-marker:focus *){background-color:green}
        .xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.xahc4vn.xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.xtj17id.xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.x1t4kl4c.x1t4kl4c.x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.x975j7z.x975j7z.x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}"
      `);
    });

    test('useLegacyClassnamesSort: true (legacy behavior)', () => {
      const { _code, metadata } = transform(fixture, {
        enableDebugClassNames: false,
      });

      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: true,
          useLegacyClassnamesSort: true,
          legacyDisableLayers: true,
        }),
      ).toMatchInlineSnapshot(`
        "@property --x-color { syntax: "*"; inherits: false;}
        @keyframes x35atj5-B{0%{box-shadow:1px 2px 3px 4px red;color:yellow;}100%{box-shadow:10px 20px 30px 40px green;color:var(--orange-theme-color);}}
        :root, .xbiwvf9{--x19twipt:2px;--xypjos2:4px;--x1ec7iuc:8px;}
        :root, .xsg933n{--xpqh4lw:blue;--x8nt2k2:10px;--xkxfyv:red;}
        @media (prefers-color-scheme: dark){:root, .xsg933n{--xkxfyv:lightblue;}}
        @media (min-width: 600px){:root, .xsg933n{--x8nt2k2:20px;}}
        @supports (color: oklab(0 0 0)){@media (prefers-color-scheme: dark){:root, .xsg933n{--xkxfyv:oklab(0.7 -0.3 -0.4);}}}
        .x1coplze.x1coplze, .x1coplze.x1coplze:root{--xpqh4lw:lightblue;}
        .x4hn0rr.x4hn0rr, .x4hn0rr.x4hn0rr:root{--x1ec7iuc:20px;--xypjos2:10px;--x19twipt:5px;}
        .xufgesz{--orange-theme-color:red}
        .x1s2izit{padding:var(--x1ec7iuc)}
        .xymmreb{margin:10px 20px}
        .x1bg2uv5{border-color:green}
        @media (max-width: 1000px){.xio2edn.xio2edn{border-color:var(--xpqh4lw)}}
        @media (max-width: 500px){@media (max-width: 1000px){.xqiy1ys.xqiy1ys.xqiy1ys{border-color:yellow}}}
        .x13ah0pd{animation-name:x35atj5-B}
        .x14rh7hd{color:var(--x-color)}
        .x18abd1y{outline-color:var(--xkxfyv)}
        /* @ltr begin */.x1kmio9f{float:left}/* @ltr end */
        /* @rtl begin */.x1kmio9f{float:right}/* @rtl end */
        .x1skrh0i{text-shadow:1px 2px 3px 4px red}
        .xrkmrrc{background-color:red}
        .xfy810d.xfy810d:where(.x-default-marker:focus *){background-color:green}
        .xbrh7vm:hover{background-color:blue}
        @media (max-width: 1000px){.xahc4vn.xahc4vn{background-color:yellow}}
        @media (min-width: 320px){.xtj17id.xtj17id{text-shadow:10px 20px 30px 40px green}}
        @media (max-width: 1000px){.x1t4kl4c.x1t4kl4c.x1t4kl4c:where(:has(.x-default-marker:focus)){background-color:purple}}
        @media (max-width: 1000px){.x975j7z.x975j7z.x975j7z:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:orange}}"
      `);
    });

    test('sort is deterministic regardless of input order', () => {
      // These rules mix @media, @container, @starting-style, var()-wrapped,
      // and plain pseudo-element rules at the same priority.
      // The old comparator had a transitivity violation when comparing across
      // these categories, causing different input orders to produce different
      // output orders.
      const rules = [
        // @media rule
        [
          'xMedia1',
          {
            ltr: '@media (min-width: 48rem){.xMedia1{display:none}}',
            rtl: null,
          },
          6000,
        ],
        // @container rule
        [
          'xContainer1',
          {
            ltr: '@container card (min-width: 31.25rem){.xContainer1{display:flex}}',
            rtl: null,
          },
          6000,
        ],
        // @starting-style rule
        [
          'xStarting1',
          {
            ltr: '@starting-style{.xStarting1{opacity:0}}',
            rtl: null,
          },
          6000,
        ],
        // var()-wrapped rule (generated by StyleX for responsive vars)
        [
          'xVar1',
          {
            ltr: 'var(--x10fi87w){.xVar1.xVar1{grid-template-columns:repeat(2,1fr)}}',
            rtl: null,
          },
          6000,
        ],
        // Plain pseudo-element rule
        ['xPseudo1', { ltr: '.xPseudo1::before{inset:0}', rtl: null }, 6000],
        // Another @media rule with same property as pseudo-element
        [
          'xMedia2',
          {
            ltr: '@media (min-width: 64rem){.xMedia2{inset:0}}',
            rtl: null,
          },
          6000,
        ],
        // Plain rule with same property as @media rule
        ['xPlain1', { ltr: '.xPlain1{display:none}', rtl: null }, 6000],
      ];

      // Process in original order
      const output1 = stylexPlugin.processStylexRules(rules, {
        useLayers: false,
        legacyDisableLayers: true,
      });

      // Process in reversed order
      const reversed = [...rules].reverse();
      const output2 = stylexPlugin.processStylexRules(reversed, {
        useLayers: false,
        legacyDisableLayers: true,
      });

      // Process in a shuffled order
      const shuffled = [
        rules[4], // xPseudo1
        rules[0], // xMedia1
        rules[3], // xVar1
        rules[6], // xPlain1
        rules[2], // xStarting1
        rules[5], // xMedia2
        rules[1], // xContainer1
      ];
      const output3 = stylexPlugin.processStylexRules(shuffled, {
        useLayers: false,
        legacyDisableLayers: true,
      });

      expect(output1).toMatchInlineSnapshot(`
        "@container card (min-width: 31.25rem){.xContainer1{display:flex}}
        .xPlain1{display:none}
        @media (min-width: 48rem){.xMedia1{display:none}}
        var(--x10fi87w){.xVar1.xVar1{grid-template-columns:repeat(2,1fr)}}
        .xPseudo1::before{inset:0}
        @media (min-width: 64rem){.xMedia2{inset:0}}
        @starting-style{.xStarting1{opacity:0}}"
      `);
      expect(output2).toMatchInlineSnapshot(`
        "@container card (min-width: 31.25rem){.xContainer1{display:flex}}
        .xPlain1{display:none}
        @media (min-width: 48rem){.xMedia1{display:none}}
        var(--x10fi87w){.xVar1.xVar1{grid-template-columns:repeat(2,1fr)}}
        .xPseudo1::before{inset:0}
        @media (min-width: 64rem){.xMedia2{inset:0}}
        @starting-style{.xStarting1{opacity:0}}"
      `);
      expect(output3).toMatchInlineSnapshot(`
        "@container card (min-width: 31.25rem){.xContainer1{display:flex}}
        .xPlain1{display:none}
        @media (min-width: 48rem){.xMedia1{display:none}}
        var(--x10fi87w){.xVar1.xVar1{grid-template-columns:repeat(2,1fr)}}
        .xPseudo1::before{inset:0}
        @media (min-width: 64rem){.xMedia2{inset:0}}
        @starting-style{.xStarting1{opacity:0}}"
      `);
    });

    test('sort is deterministic with duplicate rules in different input orders', () => {
      // When the same rule appears multiple times (e.g. from multiple modules
      // importing the same component), the sort must still be deterministic.
      const ruleA = [
        'xA',
        { ltr: '@media (min-width: 48rem){.xA{display:flex}}', rtl: null },
        6000,
      ];
      const ruleB = ['xB', { ltr: '.xB::after{inset:0}', rtl: null }, 6000];
      const ruleC = [
        'xC',
        { ltr: '@starting-style{.xC{opacity:0}}', rtl: null },
        6000,
      ];

      // Order 1: A, B, B, C
      const output1 = stylexPlugin.processStylexRules(
        [ruleA, ruleB, ruleB, ruleC],
        { useLayers: false, legacyDisableLayers: true },
      );

      // Order 2: C, B, A, B
      const output2 = stylexPlugin.processStylexRules(
        [ruleC, ruleB, ruleA, ruleB],
        { useLayers: false, legacyDisableLayers: true },
      );

      // Order 3: B, C, B, A
      const output3 = stylexPlugin.processStylexRules(
        [ruleB, ruleC, ruleB, ruleA],
        { useLayers: false, legacyDisableLayers: true },
      );

      expect(output1).toMatchInlineSnapshot(`
        "@media (min-width: 48rem){.xA{display:flex}}
        .xB::after{inset:0}
        @starting-style{.xC{opacity:0}}"
      `);
      expect(output2).toMatchInlineSnapshot(`
        "@media (min-width: 48rem){.xA{display:flex}}
        .xB::after{inset:0}
        @starting-style{.xC{opacity:0}}"
      `);
      expect(output3).toMatchInlineSnapshot(`
        "@media (min-width: 48rem){.xA{display:flex}}
        .xB::after{inset:0}
        @starting-style{.xC{opacity:0}}"
      `);
    });
  });

  describe('[transform] processStylexRules constant substitution', () => {
    const constRule = (key, constVal) => [key, { constKey: key, constVal }, 0];
    const cssRule = (className, ltr) => [className, { ltr, rtl: null }, 3000];

    test('substitutes referenced constants and ignores unreferenced ones', () => {
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('a', 'red'),
            constRule('b', 'blue'),
            cssRule('x1', '.x1{color:var(--a)}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:red}"');
    });

    test('resolves a const aliasing an external var to that var reference', () => {
      // The real-world pattern: a const aliasing a CSS variable defined outside
      // StyleX (e.g. a design-system var). It stays a `var()` the browser reads
      // at runtime -- StyleX never defines `--color-primary` itself.
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('primary', 'var(--color-primary)'),
            cssRule('x1', '.x1{color:var(--primary)}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:var(--color-primary)}"');
    });

    test('resolves a bare-ref chain through to the terminal value', () => {
      // resolveConstant pre-collapses bare-ref chains, so this resolves in one hop.
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('a', 'var(--b)'),
            constRule('b', 'green'),
            cssRule('x1', '.x1{color:var(--a)}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:green}"');
    });

    test('leaves a fallback-form chain at the first hop', () => {
      // Atypical (real consts alias one external var, see above) -- a const
      // aliasing another const via a fallback form. resolveConstant doesn't
      // collapse fallback refs, so it stops at the first hop, the shape the
      // override tests below exercise.
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('a', 'var(--b, blue)'),
            constRule('b', 'green'),
            cssRule('x1', '.x1{color:var(--a)}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:var(--b, blue)}"');
    });

    test('rewrites a const-key declaration to the var it aliases', () => {
      // A const used as a property key emits `--orange:`, rewritten to the var
      // it aliases. Also guards that the scan matches a bare `--key:`, not only
      // `var(--key)`.
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('orange', 'var(--orange-theme-color)'),
            cssRule('cls', '.cls{--orange:red}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".cls{--orange-theme-color:red}"');
    });

    test('substitutes a const used as both value and declaration in one rule', () => {
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('orange', 'var(--orange-theme-color)'),
            cssRule('cls', '.cls{color:var(--orange);--orange:red}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot(
        '".cls{color:var(--orange-theme-color);--orange-theme-color:red}"',
      );
    });

    test('parses the target var from an alias with a fallback', () => {
      // `--orange` aliases `--orange-theme-color` (with a `blue` fallback). As a
      // declaration key it rewrites to that var name alone -- `--orange-theme-color:`,
      // dropping the fallback (a `--x, blue:` property would be nonsense).
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('orange', 'var(--orange-theme-color, blue)'),
            cssRule('cls', '.cls{--orange:red}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".cls{--orange-theme-color:red}"');
    });

    test('rewrites a chained const-key declaration a single step', () => {
      // Atypical multi-hop const->const->const chain (real consts alias one
      // external var). `--primary` aliases `--brandPrimary` aliases `--blue500`;
      // the value resolves one link (to `var(--brandPrimary, …)`), so the key
      // rewrite lands one link too -- on `--brandPrimary`, the var the value
      // reads. Setting `--blue500` would be a no-op.
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('blue500', '#3b82f6'),
            constRule('brandPrimary', 'var(--blue500, #3b82f6)'),
            constRule('primary', 'var(--brandPrimary, #3b82f6)'),
            cssRule('cls', '.cls{color:var(--primary);--primary:transparent}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot(
        '".cls{color:var(--brandPrimary, #3b82f6);--brandPrimary:transparent}"',
      );
    });

    test('const-key declaration rewrite is independent of constant order', () => {
      // Either order resolves `--primary` to `--brandPrimary` (the var its value
      // reads), never on to `--blue500`.
      const blue500 = constRule('blue500', '#3b82f6');
      const brandPrimary = constRule('brandPrimary', 'var(--blue500, #3b82f6)');
      const primary = constRule('primary', 'var(--brandPrimary, #3b82f6)');
      const rule = cssRule('cls', '.cls{--primary:transparent}');

      const leafFirst = stylexPlugin.processStylexRules(
        [blue500, brandPrimary, primary, rule],
        { useLayers: false },
      );
      const aliasFirst = stylexPlugin.processStylexRules(
        [primary, brandPrimary, blue500, rule],
        { useLayers: false },
      );
      expect(leafFirst).toBe(aliasFirst);
      expect(leafFirst).toMatchInlineSnapshot(
        '".cls{--brandPrimary:transparent}"',
      );
    });

    test('rewrites each declaration in a multi-declaration rule one step', () => {
      // Each declaration resolves one step (--primary -> --brandPrimary,
      // --brandPrimary -> --blue500); a cascade would multi-hop --primary all
      // the way to --blue500.
      const consts = [
        constRule('primary', 'var(--brandPrimary, 0)'),
        constRule('brandPrimary', 'var(--blue500, 0)'),
        constRule('blue500', 'z'),
      ];
      expect(
        stylexPlugin.processStylexRules(
          [...consts, cssRule('x', '.x{--primary:red;--brandPrimary:blue}')],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x{--brandPrimary:red;--blue500:blue}"');
      // same declarations, reversed text order -> each still resolves one step
      expect(
        stylexPlugin.processStylexRules(
          [...consts, cssRule('x', '.x{--brandPrimary:blue;--primary:red}')],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x{--blue500:blue;--brandPrimary:red}"');
    });

    test('substitutes a non-ASCII constant key', () => {
      // `--`-prefixed keys are kept verbatim and may be non-ASCII; the scan must
      // match them, not just an ASCII charset.
      expect(
        stylexPlugin.processStylexRules(
          [constRule('café', 'red'), cssRule('x1', '.x1{color:var(--café)}')],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:red}"');
    });

    test('does not resolve a non-ASCII alias chain (one step only)', () => {
      // resolveConstant's pre-collapse regex is ASCII-only, so a non-ASCII
      // const->const chain stops after one step (`--a` -> `var(--café)`), not
      // through to `red`. Terminal non-ASCII keys still resolve (test above).
      expect(
        stylexPlugin.processStylexRules(
          [
            constRule('a', 'var(--café)'),
            constRule('café', 'red'),
            cssRule('x1', '.x1{color:var(--a)}'),
          ],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:var(--café)}"');
    });

    test('leaves a rule with no constant references unchanged', () => {
      expect(
        stylexPlugin.processStylexRules(
          [constRule('a', 'red'), cssRule('x1', '.x1{color:blue}')],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:blue}"');
    });

    test('leaves rules unchanged when there are no constants', () => {
      expect(
        stylexPlugin.processStylexRules(
          [cssRule('x1', '.x1{color:var(--a)}')],
          { useLayers: false },
        ),
      ).toMatchInlineSnapshot('".x1{color:var(--a)}"');
    });

    test('substitutes a cross-file const end-to-end through transform', () => {
      // defineConsts in its own .stylex module, consumed from a separate
      // component module via a real `import`, as in a real app.
      const tokensPath = '/src/app/tokens.stylex.js';
      const opts = {
        parserOpts: { flow: 'all' },
        babelrc: false,
        plugins: [
          [
            stylexPlugin,
            {
              unstable_moduleResolution: {
                type: 'custom',
                filePathResolver: () => tokensPath,
                getCanonicalFilePath: (p) => p,
              },
            },
          ],
        ],
      };
      const tokens = transformSync(
        `import * as stylex from '@stylexjs/stylex';
         export const bp = stylex.defineConsts({ small: '@media (max-width: 600px)' });`,
        { filename: tokensPath, ...opts },
      );
      const app = transformSync(
        `import * as stylex from '@stylexjs/stylex';
         import { bp } from './tokens.stylex';
         export const styles = stylex.create({
           box: { color: { default: 'red', [bp.small]: 'blue' } },
         });
         export const out = stylex.props(styles.box);`,
        { filename: '/src/app/App.js', ...opts },
      );
      const metadata = [
        ...(tokens.metadata.stylex || []),
        ...(app.metadata.stylex || []),
      ];
      // The const rule for `small` plus a `var(--…){…color:blue}` placeholder
      // rule -- processStylexRules drops the @media string into the selector.
      expect(metadata).toMatchInlineSnapshot(`
        [
          [
            "xy5rbqd",
            {
              "constKey": "xy5rbqd",
              "constVal": "@media (max-width: 600px)",
              "ltr": "",
              "rtl": null,
            },
            0,
          ],
          [
            "x1e2nbdu",
            {
              "ltr": ".x1e2nbdu{color:red}",
              "rtl": null,
            },
            3000,
          ],
          [
            "xcoj4fz",
            {
              "ltr": "var(--xy5rbqd){.xcoj4fz.xcoj4fz{color:blue}}",
              "rtl": null,
            },
            6000,
          ],
        ]
      `);
      expect(stylexPlugin.processStylexRules(metadata, { useLayers: false }))
        .toMatchInlineSnapshot(`
        ".x1e2nbdu{color:red}
        @media (max-width: 600px){.xcoj4fz.xcoj4fz:not(#\\#){color:blue}}"
      `);
    });
  });
});
