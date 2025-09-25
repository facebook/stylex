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
      ORANGE: 'var(--orange-theme-color)',
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
          ORANGE: "var(--orange-theme-color)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
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
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-x1cmij7u",
            "padding-kmVPX3": "padding-xss17vw",
            "margin-kogj98": "margin-xymmreb",
            "float-kyUFMd": "float-x1kmio9f",
            $$css: "app/main.js:31"
          },
          overrideColor: {
            "--orange-theme-color": "--orange-theme-color-xufgesz",
            $$css: "app/main.js:58"
          },
          dynamic: color => [{
            "color-kMwMTN": color != null ? "color-x14rh7hd" : color,
            $$css: "app/main.js:61"
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
        :root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
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
          ORANGE: "var(--orange-theme-color)",
          mediaBig: "@media (max-width: 1000px)",
          mediaSmall: "@media (max-width: 500px)"
        };
        export const vars = {
          blue: "var(--blue-xpqh4lw)",
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
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-x1cmij7u",
            "padding-kmVPX3": "padding-xss17vw",
            "margin-kogj98": "margin-xymmreb",
            "float-kyUFMd": "float-x1kmio9f",
            $$css: "app/main.js:31"
          },
          overrideColor: {
            "--orange-theme-color": "--orange-theme-color-xufgesz",
            $$css: "app/main.js:58"
          },
          dynamic: color => [{
            "color-kMwMTN": color != null ? "color-x14rh7hd" : color,
            $$css: "app/main.js:61"
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
        :root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
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
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        @media (min-width:320px){.textShadow-x1cmij7u.textShadow-x1cmij7u{text-shadow:10px 20px 30px 40px green}}
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
            "backgroundColor-kWkggS": "backgroundColor-xrkmrrc",
            "borderColor-kVAM5u": "borderColor-x1bg2uv5 borderColor-x5ugf7c borderColor-xqiy1ys",
            "textShadow-kKMj4B": "textShadow-x1skrh0i textShadow-x1cmij7u",
            "padding-kmVPX3": "padding-xss17vw",
            "margin-kogj98": "margin-xymmreb",
            "float-kyUFMd": "float-x1kmio9f",
            $$css: "app/main.js:31"
          },
          overrideColor: {
            "--orange-theme-color": "--orange-theme-color-xufgesz",
            $$css: "app/main.js:58"
          },
          dynamic: color => [{
            "color-kMwMTN": color != null ? "color-x14rh7hd" : color,
            $$css: "app/main.js:61"
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
        :root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
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
        .textShadow-x1skrh0i{text-shadow:1px 2px 3px 4px red}
        @media (min-width:320px){.textShadow-x1cmij7u.textShadow-x1cmij7u{text-shadow:10px 20px 30px 40px green}}"
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
            "float-kyUFMd": "float-x1kmio9f",
            $$css: "app/main.js:23"
          }
        };"
      `);

      expect(
        stylexPlugin.processStylexRules(metadata, {
          useLayers: false,
          enableLTRRTLComments: true,
        }),
      ).toMatchInlineSnapshot(`
        ":root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
        /* @ltr begin */.float-x1kmio9f:not(#\\#){float:left}/* @ltr end */
        /* @rtl begin */.float-x1kmio9f:not(#\\#){float:right}/* @rtl end */
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
        ":root, .xsg933n{--blue-xpqh4lw:blue;}
        :root, .xbiwvf9{--small-x19twipt:2px;--medium-xypjos2:4px;--large-x1ec7iuc:8px;}
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
  });
});
