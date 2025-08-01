/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../../src/index');
const jsx = require('@babel/plugin-syntax-jsx');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: {
        all: true,
      },
    },
    plugins: [
      jsx,
      [
        stylexPlugin,
        {
          runtimeInjection: true,
          styleResolution: 'legacy-expand-shorthands',
          enableLogicalStylesPolyfill: opts.enableLogicalStylesPolyfill ?? true,
          ...opts,
        },
      ],
    ],
  }).code;
}

describe('legacy-shorthand-expansion style resolution (enableLogicalStylesPolyfill: true)', () => {
  describe('while using RN non-standard properties', () => {
    test('padding: with longhand property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingEnd: 10,
            },

            bar: {
              padding: 2,
              paddingStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        _inject2(".xe2zdcy{padding-left:10px}", 3000, ".xe2zdcy{padding-right:10px}");
        "x1nn3v0j x14vy60q x1120s5i xe2zdcy";"
      `);
    });

    test('padding: with null longhand property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingEnd: 10,
            },

            bar: {
              padding: 2,
              paddingStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        "x1nn3v0j x14vy60q x1120s5i";"
      `);
    });

    test('borderColor: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderColor: 'red blue green yellow'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1uu1fcu{border-top-color:red}", 4000);
        _inject2(".xcejqfc{border-right-color:blue}", 3000, ".xcejqfc{border-left-color:blue}");
        _inject2(".x1hnil3p{border-bottom-color:green}", 4000);
        _inject2(".xqzb60q{border-left-color:yellow}", 3000, ".xqzb60q{border-right-color:yellow}");
        "x1uu1fcu xcejqfc x1hnil3p xqzb60q";"
      `);
    });

    test('borderWidth: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderWidth: '1px 2px 3px 4px'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x178xt8z{border-top-width:1px}", 4000);
        _inject2(".x1alpsbp{border-right-width:2px}", 3000, ".x1alpsbp{border-left-width:2px}");
        _inject2(".x2x41l1{border-bottom-width:3px}", 4000);
        _inject2(".x56jcm7{border-left-width:4px}", 3000, ".x56jcm7{border-right-width:4px}");
        "x178xt8z x1alpsbp x2x41l1 x56jcm7";"
      `);
    });
  });

  describe('while using standard logical properties', () => {
    test('padding: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              padding: 5
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".x1gabggj{padding-right:5px}", 3000, ".x1gabggj{padding-left:5px}");
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        export const styles = {
          foo: {
            kLKAdn: "x123j3cw",
            kwRFfy: "x1gabggj",
            kGO01o: "xs9asl8",
            kZCmMZ: "xaso8d8",
            $$css: true
          }
        };
        "x123j3cw x1gabggj xs9asl8 xaso8d8";"
      `);
    });

    test('margin: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              margin: '10px 20px 30px 40px'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1anpbxc{margin-top:10px}", 4000);
        _inject2(".x3aesyq{margin-right:20px}", 3000, ".x3aesyq{margin-left:20px}");
        _inject2(".x4n8cb0{margin-bottom:30px}", 4000);
        _inject2(".x11hdunq{margin-left:40px}", 3000, ".x11hdunq{margin-right:40px}");
        "x1anpbxc x3aesyq x4n8cb0 x11hdunq";"
      `);
    });

    test('paddingInline: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              paddingInline: 5
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x1gabggj{padding-right:5px}", 3000, ".x1gabggj{padding-left:5px}");
        export const styles = {
          foo: {
            kZCmMZ: "xaso8d8",
            kwRFfy: "x1gabggj",
            kE3dHu: null,
            kpe85a: null,
            $$css: true
          }
        };
        "xaso8d8 x1gabggj";"
      `);
    });

    test('paddingInline: basic multivalue shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              paddingInline: "5px 10px"
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        export const styles = {
          foo: {
            kZCmMZ: "xaso8d8",
            kwRFfy: "x2vl965",
            kE3dHu: null,
            kpe85a: null,
            $$css: true
          }
        };
        "xaso8d8 x2vl965";"
      `);
    });

    test('padding: with longhand property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingInlineEnd: 10,
            },

            bar: {
              padding: 2,
              paddingInlineStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        _inject2(".xe2zdcy{padding-left:10px}", 3000, ".xe2zdcy{padding-right:10px}");
        "x1nn3v0j x14vy60q x1120s5i xe2zdcy";"
      `);
    });

    test('padding: with longhand directional and logical property collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingInlineEnd: 10,
            },

            bar: {
              padding: 2,
              paddingInlineStart: 10,
              paddingLeft: 22
            },
          });
          stylex(styles.foo, styles.bar)
          export const string = stylex(styles.foo, styles.bar, xstyle);
        `,
          { debug: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".paddingTop-x123j3cw{padding-top:5px}", 4000);
        _inject2(".paddingBottom-xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".paddingInlineStart-xaso8d8{padding-left:5px}", 3000, ".paddingInlineStart-xaso8d8{padding-right:5px}");
        _inject2(".paddingInlineEnd-x2vl965{padding-right:10px}", 3000, ".paddingInlineEnd-x2vl965{padding-left:10px}");
        _inject2(".paddingTop-x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".paddingBottom-x1120s5i{padding-bottom:2px}", 4000);
        _inject2(".paddingLeft-xnljgj5{padding-left:22px}", 4000);
        const styles = {
          foo: {
            "paddingTop-kLKAdn": "paddingTop-x123j3cw",
            "paddingBottom-kGO01o": "paddingBottom-xs9asl8",
            "paddingInlineStart-kZCmMZ": "paddingInlineStart-xaso8d8",
            "paddingInlineEnd-kwRFfy": "paddingInlineEnd-x2vl965",
            $$css: true
          },
          bar: {
            "paddingTop-kLKAdn": "paddingTop-x1nn3v0j",
            "paddingBottom-kGO01o": "paddingBottom-x1120s5i",
            "paddingLeft-kE3dHu": "paddingLeft-xnljgj5",
            "paddingInlineStart-kZCmMZ": null,
            "paddingInlineEnd-kwRFfy": null,
            $$css: true
          }
        };
        "paddingTop-x1nn3v0j paddingBottom-x1120s5i paddingLeft-xnljgj5";
        export const string = stylex(styles.foo, styles.bar, xstyle);"
      `);
    });

    test('padding: with null longhand property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingInlineEnd: 10,
            },

            bar: {
              padding: 2,
              paddingInlineStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-left:5px}", 3000, ".xaso8d8{padding-right:5px}");
        _inject2(".x2vl965{padding-right:10px}", 3000, ".x2vl965{padding-left:10px}");
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-right:2px}", 3000, ".x14vy60q{padding-left:2px}");
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        "x1nn3v0j x14vy60q x1120s5i";"
      `);
    });

    test('marginInline: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              marginInline: 5
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xpcyujq{margin-left:5px}", 3000, ".xpcyujq{margin-right:5px}");
        _inject2(".xf6vk7d{margin-right:5px}", 3000, ".xf6vk7d{margin-left:5px}");
        export const styles = {
          foo: {
            keTefX: "xpcyujq",
            k71WvV: "xf6vk7d",
            koQZXg: null,
            km5ZXQ: null,
            $$css: true
          }
        };
        "xpcyujq xf6vk7d";"
      `);
    });

    test('marginInline: basic multivalue shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              marginInline: "5px 10px"
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xpcyujq{margin-left:5px}", 3000, ".xpcyujq{margin-right:5px}");
        _inject2(".x1sa5p1d{margin-right:10px}", 3000, ".x1sa5p1d{margin-left:10px}");
        export const styles = {
          foo: {
            keTefX: "xpcyujq",
            k71WvV: "x1sa5p1d",
            koQZXg: null,
            km5ZXQ: null,
            $$css: true
          }
        };
        "xpcyujq x1sa5p1d";"
      `);
    });

    test('marginBlock: basic multivalue shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              marginBlock: "5px 10px"
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ok221b{margin-top:5px}", 4000);
        _inject2(".xyorhqc{margin-bottom:10px}", 4000);
        export const styles = {
          foo: {
            keoZOQ: "x1ok221b",
            k1K539: "xyorhqc",
            $$css: true
          }
        };
        "x1ok221b xyorhqc";"
      `);
    });

    test('margin: with longhand property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              margin: 5,
              marginInlineEnd: 10,
            },

            bar: {
              margin: 2,
              marginInlineStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ok221b{margin-top:5px}", 4000);
        _inject2(".xu06os2{margin-bottom:5px}", 4000);
        _inject2(".xpcyujq{margin-left:5px}", 3000, ".xpcyujq{margin-right:5px}");
        _inject2(".x1sa5p1d{margin-right:10px}", 3000, ".x1sa5p1d{margin-left:10px}");
        _inject2(".xr9ek0c{margin-top:2px}", 4000);
        _inject2(".xnnr8r{margin-right:2px}", 3000, ".xnnr8r{margin-left:2px}");
        _inject2(".xjpr12u{margin-bottom:2px}", 4000);
        _inject2(".x1hm9lzh{margin-left:10px}", 3000, ".x1hm9lzh{margin-right:10px}");
        "xr9ek0c xnnr8r xjpr12u x1hm9lzh";"
      `);
    });

    test('margin: with null longhand property collisions', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              margin: 5,
              marginInlineEnd: 10,
            },

            bar: {
              margin: 2,
              marginInlineStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ok221b{margin-top:5px}", 4000);
        _inject2(".xu06os2{margin-bottom:5px}", 4000);
        _inject2(".xpcyujq{margin-left:5px}", 3000, ".xpcyujq{margin-right:5px}");
        _inject2(".x1sa5p1d{margin-right:10px}", 3000, ".x1sa5p1d{margin-left:10px}");
        _inject2(".xr9ek0c{margin-top:2px}", 4000);
        _inject2(".xnnr8r{margin-right:2px}", 3000, ".xnnr8r{margin-left:2px}");
        _inject2(".xjpr12u{margin-bottom:2px}", 4000);
        "xr9ek0c xnnr8r xjpr12u";"
      `);
    });

    test('border: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              border: '1px solid red'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x122jhqu{border-top:1px solid red}", 2000);
        _inject2(".xcmqxwo{border-right:1px solid red}", 2000, ".xcmqxwo{border-left:1px solid red}");
        _inject2(".xql0met{border-bottom:1px solid red}", 2000);
        _inject2(".x1lsjq1p{border-left:1px solid red}", 2000, ".x1lsjq1p{border-right:1px solid red}");
        "x122jhqu xcmqxwo xql0met x1lsjq1p";"
      `);
    });

    test('borderInlineColor: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderInlineColor: 'red'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1777cdg{border-left-color:red}", 3000, ".x1777cdg{border-right-color:red}");
        _inject2(".x9cubbk{border-right-color:red}", 3000, ".x9cubbk{border-left-color:red}");
        "x1777cdg x9cubbk";"
      `);
    });

    test('borderInlineWidth: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderInlineWidth: 1
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xpilrb4{border-left-width:1px}", 3000, ".xpilrb4{border-right-width:1px}");
        _inject2(".x1lun4ml{border-right-width:1px}", 3000, ".x1lun4ml{border-left-width:1px}");
        "xpilrb4 x1lun4ml";"
      `);
    });

    test('inset: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              inset: 10
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1eu8d0j{top:10px}", 4000);
        _inject2(".xo2ifbc{right:10px}", 3000, ".xo2ifbc{left:10px}");
        _inject2(".x1jn9clo{bottom:10px}", 4000);
        _inject2(".xi5uv41{left:10px}", 3000, ".xi5uv41{right:10px}");
        "x1eu8d0j xo2ifbc x1jn9clo xi5uv41";"
      `);
    });

    test('inset: multivalue shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              inset: '10px 20px 30px 40px'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1eu8d0j{top:10px}", 4000);
        _inject2(".x2ss2xj{right:20px}", 3000, ".x2ss2xj{left:20px}");
        _inject2(".xwajptj{bottom:30px}", 4000);
        _inject2(".x9pwknu{left:40px}", 3000, ".x9pwknu{right:40px}");
        "x1eu8d0j x2ss2xj xwajptj x9pwknu";"
      `);
    });

    test('insetInline: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              insetInline: 10
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xi5uv41{left:10px}", 3000, ".xi5uv41{right:10px}");
        _inject2(".xo2ifbc{right:10px}", 3000, ".xo2ifbc{left:10px}");
        "xi5uv41 xo2ifbc";"
      `);
    });

    test('insetInline: multivalue shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              insetInline: '10px 20px'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xi5uv41{left:10px}", 3000, ".xi5uv41{right:10px}");
        _inject2(".x2ss2xj{right:20px}", 3000, ".x2ss2xj{left:20px}");
        "xi5uv41 x2ss2xj";"
      `);
    });

    test('insetBlock: basic shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              insetBlock: 10
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1eu8d0j{top:10px}", 4000);
        _inject2(".x1jn9clo{bottom:10px}", 4000);
        "x1eu8d0j x1jn9clo";"
      `);
    });

    test('insetBlock: multivalue shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              insetBlock: '10px 20px'
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1eu8d0j{top:10px}", 4000);
        _inject2(".xjnlgov{bottom:20px}", 4000);
        "x1eu8d0j xjnlgov";"
      `);
    });

    test('listStyle: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            none: {
              listStyle: 'none'
            },
            square: {
              listStyle: 'square'
            },
            inside: {
              listStyle: 'inside'
            },
            custom1: {
              listStyle: '"--"'
            },
            custom2: {
              listStyle: "'=='"
            }
          });
        `,
          { debug: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".listStyleType-x3ct3a4{list-style-type:none}", 3000);
        _inject2(".listStyleType-x152237o{list-style-type:square}", 3000);
        _inject2(".listStylePosition-x1cy9i3i{list-style-position:inside}", 3000);
        _inject2(".listStyleType-x1jzm7bx{list-style-type:\\"--\\"}", 3000);
        _inject2(".listStyleType-x1tpmu87{list-style-type:'=='}", 3000);
        export const styles = {
          none: {
            "listStyleType-kH6xsr": "listStyleType-x3ct3a4",
            "listStylePosition-kpqbRz": null,
            "listStyleImage-khnUzm": null,
            $$css: true
          },
          square: {
            "listStyleType-kH6xsr": "listStyleType-x152237o",
            "listStylePosition-kpqbRz": null,
            "listStyleImage-khnUzm": null,
            $$css: true
          },
          inside: {
            "listStyleType-kH6xsr": null,
            "listStylePosition-kpqbRz": "listStylePosition-x1cy9i3i",
            "listStyleImage-khnUzm": null,
            $$css: true
          },
          custom1: {
            "listStyleType-kH6xsr": "listStyleType-x1jzm7bx",
            "listStylePosition-kpqbRz": null,
            "listStyleImage-khnUzm": null,
            $$css: true
          },
          custom2: {
            "listStyleType-kH6xsr": "listStyleType-x1tpmu87",
            "listStylePosition-kpqbRz": null,
            "listStyleImage-khnUzm": null,
            $$css: true
          }
        };"
      `);
    });

    test('listStyle: multi-value shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            one: {
              listStyle: 'none inside'
            },
            two: {
              listStyle: 'none square'
            },
            three: {
              listStyle: 'simp-chinese-informal linear-gradient(90deg, white 100%)'
            },
            four: {
              listStyle: 'outside "+" linear-gradient(90deg, white 100%)'
            },
          });
        `,
          { debug: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".listStyleType-x3ct3a4{list-style-type:none}", 3000);
        _inject2(".listStylePosition-x1cy9i3i{list-style-position:inside}", 3000);
        _inject2(".listStyleType-x152237o{list-style-type:square}", 3000);
        _inject2(".listStyleImage-xnbnhf8{list-style-image:none}", 3000);
        _inject2(".listStyleType-xl2um64{list-style-type:simp-chinese-informal}", 3000);
        _inject2(".listStyleImage-x1qcowux{list-style-image:linear-gradient(90deg,white 100%)}", 3000);
        _inject2(".listStyleType-xqkogtj{list-style-type:\\"+\\"}", 3000);
        _inject2(".listStylePosition-x43c9pm{list-style-position:outside}", 3000);
        export const styles = {
          one: {
            "listStyleType-kH6xsr": "listStyleType-x3ct3a4",
            "listStylePosition-kpqbRz": "listStylePosition-x1cy9i3i",
            "listStyleImage-khnUzm": null,
            $$css: true
          },
          two: {
            "listStyleType-kH6xsr": "listStyleType-x152237o",
            "listStylePosition-kpqbRz": null,
            "listStyleImage-khnUzm": "listStyleImage-xnbnhf8",
            $$css: true
          },
          three: {
            "listStyleType-kH6xsr": "listStyleType-xl2um64",
            "listStylePosition-kpqbRz": null,
            "listStyleImage-khnUzm": "listStyleImage-x1qcowux",
            $$css: true
          },
          four: {
            "listStyleType-kH6xsr": "listStyleType-xqkogtj",
            "listStylePosition-kpqbRz": "listStylePosition-x43c9pm",
            "listStyleImage-khnUzm": "listStyleImage-x1qcowux",
            $$css: true
          }
        };"
      `);
    });

    test('listStyle: with longhand collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            one: {
              listStyle: 'none inside',
              listStyleType: 'square'
            },
            two: {
              listStyle: 'none georgian',
              listStylePosition: 'outside'
            },
            three: {
              listStyle: 'simp-chinese-informal linear-gradient(90deg, white 100%)',
              listStylePosition: 'outside',
              listStyleType: 'square',
            },
            four: {
              listStyle: 'inside "--" linear-gradient(90deg, white 100%)',
              listStylePosition: 'outside',
              listStyleType: 'square',
            },
          });
        `,
          { debug: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".listStylePosition-x1cy9i3i{list-style-position:inside}", 3000);
        _inject2(".listStyleType-x152237o{list-style-type:square}", 3000);
        _inject2(".listStyleType-x12kno0j{list-style-type:georgian}", 3000);
        _inject2(".listStyleImage-xnbnhf8{list-style-image:none}", 3000);
        _inject2(".listStylePosition-x43c9pm{list-style-position:outside}", 3000);
        _inject2(".listStyleImage-x1qcowux{list-style-image:linear-gradient(90deg,white 100%)}", 3000);
        export const styles = {
          one: {
            "listStylePosition-kpqbRz": "listStylePosition-x1cy9i3i",
            "listStyleImage-khnUzm": null,
            "listStyleType-kH6xsr": "listStyleType-x152237o",
            $$css: true
          },
          two: {
            "listStyleType-kH6xsr": "listStyleType-x12kno0j",
            "listStyleImage-khnUzm": "listStyleImage-xnbnhf8",
            "listStylePosition-kpqbRz": "listStylePosition-x43c9pm",
            $$css: true
          },
          three: {
            "listStyleImage-khnUzm": "listStyleImage-x1qcowux",
            "listStylePosition-kpqbRz": "listStylePosition-x43c9pm",
            "listStyleType-kH6xsr": "listStyleType-x152237o",
            $$css: true
          },
          four: {
            "listStyleImage-khnUzm": "listStyleImage-x1qcowux",
            "listStylePosition-kpqbRz": "listStylePosition-x43c9pm",
            "listStyleType-kH6xsr": "listStyleType-x152237o",
            $$css: true
          }
        };"
      `);
    });

    test('listStyle: invalid values', () => {
      expect(() =>
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            none: {
              listStyle: 'none inherit'
            },
          });
        `,
        ),
      ).toThrow();
      expect(() =>
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            none: {
              listStyle: 'none var(--image)'
            },
          });
        `,
        ),
      ).toThrow();
    });
  });
});

describe('legacy-shorthand-expansion resolution (enableLogicalStylesPolyfill: false)', () => {
  describe('while using RN non-standard properties', () => {
    test('padding: with longhand property collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingEnd: 10,
            },

            bar: {
              padding: 2,
              paddingStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-inline-start:5px}", 3000);
        _inject2(".x2vl965{padding-inline-end:10px}", 3000);
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-inline-end:2px}", 3000);
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        _inject2(".xe2zdcy{padding-inline-start:10px}", 3000);
        "x1nn3v0j x14vy60q x1120s5i xe2zdcy";"
      `);
    });

    test('padding: with null longhand property collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingEnd: 10,
            },

            bar: {
              padding: 2,
              paddingStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-inline-start:5px}", 3000);
        _inject2(".x2vl965{padding-inline-end:10px}", 3000);
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-inline-end:2px}", 3000);
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        "x1nn3v0j x14vy60q x1120s5i";"
      `);
    });

    test('borderColor: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderColor: 'red blue green yellow'
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1uu1fcu{border-top-color:red}", 4000);
        _inject2(".xcejqfc{border-inline-end-color:blue}", 3000);
        _inject2(".x1hnil3p{border-bottom-color:green}", 4000);
        _inject2(".xqzb60q{border-inline-start-color:yellow}", 3000);
        "x1uu1fcu xcejqfc x1hnil3p xqzb60q";"
      `);
    });

    test('borderWidth: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderWidth: '1px 2px 3px 4px'
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x178xt8z{border-top-width:1px}", 4000);
        _inject2(".x1alpsbp{border-inline-end-width:2px}", 3000);
        _inject2(".x2x41l1{border-bottom-width:3px}", 4000);
        _inject2(".x56jcm7{border-inline-start-width:4px}", 3000);
        "x178xt8z x1alpsbp x2x41l1 x56jcm7";"
      `);
    });
  });

  describe('while using standard logical properties', () => {
    test('padding: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              padding: 5
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".x1gabggj{padding-inline-end:5px}", 3000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-inline-start:5px}", 3000);
        export const styles = {
          foo: {
            kLKAdn: "x123j3cw",
            kwRFfy: "x1gabggj",
            kGO01o: "xs9asl8",
            kZCmMZ: "xaso8d8",
            $$css: true
          }
        };
        "x123j3cw x1gabggj xs9asl8 xaso8d8";"
      `);
    });

    test('margin: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              margin: '10px 20px 30px 40px'
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1anpbxc{margin-top:10px}", 4000);
        _inject2(".x3aesyq{margin-inline-end:20px}", 3000);
        _inject2(".x4n8cb0{margin-bottom:30px}", 4000);
        _inject2(".x11hdunq{margin-inline-start:40px}", 3000);
        "x1anpbxc x3aesyq x4n8cb0 x11hdunq";"
      `);
    });

    test('paddingInline: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              paddingInline: 5
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xaso8d8{padding-inline-start:5px}", 3000);
        _inject2(".x1gabggj{padding-inline-end:5px}", 3000);
        export const styles = {
          foo: {
            kZCmMZ: "xaso8d8",
            kwRFfy: "x1gabggj",
            kE3dHu: null,
            kpe85a: null,
            $$css: true
          }
        };
        "xaso8d8 x1gabggj";"
      `);
    });

    test('padding: with longhand property collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingInlineEnd: 10,
            },

            bar: {
              padding: 2,
              paddingInlineStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-inline-start:5px}", 3000);
        _inject2(".x2vl965{padding-inline-end:10px}", 3000);
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-inline-end:2px}", 3000);
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        _inject2(".xe2zdcy{padding-inline-start:10px}", 3000);
        "x1nn3v0j x14vy60q x1120s5i xe2zdcy";"
      `);
    });

    test('paddingBlock: basic multivalue shorthand', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              paddingBlock: "5px 10px"
            }
          });
          stylex(styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".x1a8lsjc{padding-bottom:10px}", 4000);
        export const styles = {
          foo: {
            kLKAdn: "x123j3cw",
            kGO01o: "x1a8lsjc",
            $$css: true
          }
        };
        "x123j3cw x1a8lsjc";"
      `);
    });

    test('padding: with null longhand property collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5,
              paddingInlineEnd: 10,
            },

            bar: {
              padding: 2,
              paddingInlineStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x123j3cw{padding-top:5px}", 4000);
        _inject2(".xs9asl8{padding-bottom:5px}", 4000);
        _inject2(".xaso8d8{padding-inline-start:5px}", 3000);
        _inject2(".x2vl965{padding-inline-end:10px}", 3000);
        _inject2(".x1nn3v0j{padding-top:2px}", 4000);
        _inject2(".x14vy60q{padding-inline-end:2px}", 3000);
        _inject2(".x1120s5i{padding-bottom:2px}", 4000);
        "x1nn3v0j x14vy60q x1120s5i";"
      `);
    });

    test('marginInline: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              marginInline: 5
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xpcyujq{margin-inline-start:5px}", 3000);
        _inject2(".xf6vk7d{margin-inline-end:5px}", 3000);
        export const styles = {
          foo: {
            keTefX: "xpcyujq",
            k71WvV: "xf6vk7d",
            koQZXg: null,
            km5ZXQ: null,
            $$css: true
          }
        };
        "xpcyujq xf6vk7d";"
      `);
    });

    test('margin: with longhand property collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              margin: 5,
              marginInlineEnd: 10,
            },

            bar: {
              margin: 2,
              marginInlineStart: 10,
            },
          });
          stylex(styles.foo, styles.bar);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ok221b{margin-top:5px}", 4000);
        _inject2(".xu06os2{margin-bottom:5px}", 4000);
        _inject2(".xpcyujq{margin-inline-start:5px}", 3000);
        _inject2(".x1sa5p1d{margin-inline-end:10px}", 3000);
        _inject2(".xr9ek0c{margin-top:2px}", 4000);
        _inject2(".xnnr8r{margin-inline-end:2px}", 3000);
        _inject2(".xjpr12u{margin-bottom:2px}", 4000);
        _inject2(".x1hm9lzh{margin-inline-start:10px}", 3000);
        "xr9ek0c xnnr8r xjpr12u x1hm9lzh";"
      `);
    });

    test('margin: with null longhand property collisions', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              margin: 5,
              marginInlineEnd: 10,
            },

            bar: {
              margin: 2,
              marginInlineStart: null,
            },
          });
          stylex(styles.foo, styles.bar);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1ok221b{margin-top:5px}", 4000);
        _inject2(".xu06os2{margin-bottom:5px}", 4000);
        _inject2(".xpcyujq{margin-inline-start:5px}", 3000);
        _inject2(".x1sa5p1d{margin-inline-end:10px}", 3000);
        _inject2(".xr9ek0c{margin-top:2px}", 4000);
        _inject2(".xnnr8r{margin-inline-end:2px}", 3000);
        _inject2(".xjpr12u{margin-bottom:2px}", 4000);
        "xr9ek0c xnnr8r xjpr12u";"
      `);
    });

    test('border: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              border: '1px solid red'
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x122jhqu{border-top:1px solid red}", 2000);
        _inject2(".xcmqxwo{border-inline-end:1px solid red}", 2000);
        _inject2(".xql0met{border-bottom:1px solid red}", 2000);
        _inject2(".x1lsjq1p{border-inline-start:1px solid red}", 2000);
        "x122jhqu xcmqxwo xql0met x1lsjq1p";"
      `);
    });

    test('borderInlineColor: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderInlineColor: 'red'
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1777cdg{border-inline-start-color:red}", 3000);
        _inject2(".x9cubbk{border-inline-end-color:red}", 3000);
        "x1777cdg x9cubbk";"
      `);
    });

    test('borderInlineWidth: basic shorthand', () => {
      expect(
        transform(
          `
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              borderInlineWidth: 1
            }
          });
          stylex(styles.foo);
        `,
          { enableLogicalStylesPolyfill: false },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xpilrb4{border-inline-start-width:1px}", 3000);
        _inject2(".x1lun4ml{border-inline-end-width:1px}", 3000);
        "xpilrb4 x1lun4ml";"
      `);
    });
  });
});
