/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: {
        all: true,
      },
    },
    plugins: [[stylexPlugin, opts]],
  }).code;
}

describe('babel-plugin-transform-stylex', () => {
  /**
   * Legacy API
   */

  describe('[transform] legacy API', () => {
    describe('styles("foo")', () => {
      test('transforms plain stylex value call with strings', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                color: 'red',
              },
              default2: {
                backgroundColor: 'blue',
              }
            });
            styles('default', 'default2');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          \\"x1e2nbdu x1t391ir\\";"
        `);
      });

      test('transforms plain stylex value call with numbers', () => {
        expect(
          transform(`
            const styles = stylex.create({
              0: {
                color: 'red',
              },
              1: {
                backgroundColor: 'blue',
              }
            });
            styles(0, 1);
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          \\"x1e2nbdu x1t391ir\\";"
        `);
      });

      test('transforms plain stylex value call with computed numbers', () => {
        expect(
          transform(`
            const styles = stylex.create({
              [0]: {
                color: 'red',
              },
              [1]: {
                backgroundColor: 'blue',
              }
            });
            styles(0, 1);
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          \\"x1e2nbdu x1t391ir\\";"
        `);
      });

      test('triggers composition when values are exported', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                color: 'red',
              },
              default2: {
                backgroundColor: 'blue',
              }
            });
            styles('default', props && 'default2');
            const foo = styles;
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          const styles = {
            default: {
              color: \\"x1e2nbdu\\"
            },
            default2: {
              backgroundColor: \\"x1t391ir\\"
            }
          };
          stylex(styles.default, props && styles.default2);
          const foo = styles;"
        `);
      });

      test('transforms plain stylex value call with strings containing collisions', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },
              default2: {
                backgroundColor: 'blue',
              }
            });
            styles('default', 'default2');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xrkmrrc{background-color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          \\"x1t391ir\\";"
        `);
      });

      test('transforms plain stylex value call with conditions', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            styles('default', isActive && 'active');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xrkmrrc{background-color:red}\\", 1);
          stylex.inject(\\".xju2f9n{color:blue}\\", 1);
          \\"xrkmrrc\\" + (isActive ? \\" xju2f9n\\" : \\"\\");"
        `);
      });

      test('transforms plain stylex value call with a map of conditions', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            styles({
              default: true,
              active: isActive,
            });
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xrkmrrc{background-color:red}\\", 1);
          stylex.inject(\\".xju2f9n{color:blue}\\", 1);
          \\"xrkmrrc\\" + (isActive ? \\" xju2f9n\\" : \\"\\");"
        `);
      });

      test('transforms plain stylex value call with a map of colliding conditions', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                color: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            styles({
              default: true,
              active: isActive,
            });
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".xju2f9n{color:blue}\\", 1);
          stylex({
            \\"color-1\\": \\"x1e2nbdu\\"
          }, isActive ? {
            \\"color-1\\": \\"xju2f9n\\"
          } : null);"
        `);
      });

      test('ensure pseudo selector and base namespace styles are applied', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                color: 'blue',
                ':hover': {
                  backgroundColor: 'red',
                }
              }
            });
            styles('default');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xju2f9n{color:blue}\\", 1);
          stylex.inject(\\".x1gykpug:hover{background-color:red}\\", 8);
          \\"x1gykpug xju2f9n\\";"
        `);
      });

      test('correctly remove shadowed properties when using no conditions', () => {
        expect(
          transform(`
            const styles = stylex.create({
              foo: {
                padding: 5,
              },

              bar: {
                padding: 2,
                paddingStart: 10,
              },
            });
            styles('bar', 'foo');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x123j3cw{padding-top:5px}\\", 1);
          stylex.inject(\\".x1mpkggp{padding-right:5px}\\", 1, \\".x1mpkggp{padding-left:5px}\\");
          stylex.inject(\\".xs9asl8{padding-bottom:5px}\\", 1);
          stylex.inject(\\".x1t2a60a{padding-left:5px}\\", 1, \\".x1t2a60a{padding-right:5px}\\");
          stylex.inject(\\".x1nn3v0j{padding-top:2px}\\", 1);
          stylex.inject(\\".xg83lxy{padding-right:2px}\\", 1, \\".xg83lxy{padding-left:2px}\\");
          stylex.inject(\\".x1120s5i{padding-bottom:2px}\\", 1);
          stylex.inject(\\".x1sln4lm{padding-left:10px}\\", 1, \\".x1sln4lm{padding-right:10px}\\");
          \\"x1t2a60a xs9asl8 x1mpkggp x123j3cw\\";"
        `);
      });

      test('correctly remove shadowed properties when using no conditions with shadowed namespace styles', () => {
        expect(
          transform(`
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
            styles('bar', 'foo');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x123j3cw{padding-top:5px}\\", 1);
          stylex.inject(\\".xs9asl8{padding-bottom:5px}\\", 1);
          stylex.inject(\\".x1t2a60a{padding-left:5px}\\", 1, \\".x1t2a60a{padding-right:5px}\\");
          stylex.inject(\\".x1iji9kk{padding-right:10px}\\", 1, \\".x1iji9kk{padding-left:10px}\\");
          stylex.inject(\\".x1nn3v0j{padding-top:2px}\\", 1);
          stylex.inject(\\".xg83lxy{padding-right:2px}\\", 1, \\".xg83lxy{padding-left:2px}\\");
          stylex.inject(\\".x1120s5i{padding-bottom:2px}\\", 1);
          stylex.inject(\\".x1sln4lm{padding-left:10px}\\", 1, \\".x1sln4lm{padding-right:10px}\\");
          \\"x1iji9kk x1t2a60a xs9asl8 x123j3cw\\";"
        `);
      });

      test('transforms styles usage before declaration', () => {
        expect(
          transform(`
            function Component() {
              styles('default');
            }

            const styles = stylex.create({
              default: {
                color: 'red',
              },
            });
          `)
        ).toMatchInlineSnapshot(`
          "function Component() {
            \\"x1e2nbdu\\";
          }

          stylex.inject(\\".x1e2nbdu{color:red}\\", 1);"
        `);
      });

      test('auto-expands borderRadius shorthand', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                borderRadius: '8px 8px 0 0',
              },
              withCalc: {
                borderRadius: '8px 8px calc(100% - 2px) 0',
              }
            });
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1lq5wgf{border-top-left-radius:8px}\\", 1, \\".x1lq5wgf{border-top-right-radius:8px}\\");
          stylex.inject(\\".xgqcy7u{border-top-right-radius:8px}\\", 1, \\".xgqcy7u{border-top-left-radius:8px}\\");
          stylex.inject(\\".x5pf9jr{border-bottom-right-radius:0}\\", 1, \\".x5pf9jr{border-bottom-left-radius:0}\\");
          stylex.inject(\\".xo71vjh{border-bottom-left-radius:0}\\", 1, \\".xo71vjh{border-bottom-right-radius:0}\\");
          stylex.inject(\\".x1lq5wgf{border-top-left-radius:8px}\\", 1, \\".x1lq5wgf{border-top-right-radius:8px}\\");
          stylex.inject(\\".xgqcy7u{border-top-right-radius:8px}\\", 1, \\".xgqcy7u{border-top-left-radius:8px}\\");
          stylex.inject(\\".xjam8bt{border-bottom-right-radius:calc(100% - 2px)}\\", 1, \\".xjam8bt{border-bottom-left-radius:calc(100% - 2px)}\\");
          stylex.inject(\\".xo71vjh{border-bottom-left-radius:0}\\", 1, \\".xo71vjh{border-bottom-right-radius:0}\\");"
        `);
      });

      test('auto-expands border shorthands', () => {
        expect(
          transform(`
            const borderRadius = 2;
            const styles = stylex.create({
              default: {
                margin: 'calc((100% - 50px) * 0.5) 20px 0',
              },
              error: {
                borderColor: 'red blue',
                borderStyle: 'solid dashed',
                borderWidth: '0 0 2px 0',
              },
              root: {
                border: '1px solid var(--divider)',
                borderRadius: borderRadius * 2,
                borderBottom: '5px solid red',
              },
              short: {
                padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
                paddingTop: 0,
              },
              valid: {
                borderColor: 'green',
                borderStyle: 'solid',
                borderWidth: 1,
              }
            });
          `)
        ).toMatchInlineSnapshot(`
          "const borderRadius = 2;
          stylex.inject(\\".xxsse2n{margin-top:calc((100% - 50px) * .5)}\\", 1);
          stylex.inject(\\".x1h5jrl4{margin-right:20px}\\", 1, \\".x1h5jrl4{margin-left:20px}\\");
          stylex.inject(\\".xat24cr{margin-bottom:0}\\", 1);
          stylex.inject(\\".xmn8rco{margin-left:20px}\\", 1, \\".xmn8rco{margin-right:20px}\\");
          stylex.inject(\\".x1uu1fcu{border-top-color:red}\\", 0.4);
          stylex.inject(\\".xkwlhv9{border-right-color:blue}\\", 0.4, \\".xkwlhv9{border-left-color:blue}\\");
          stylex.inject(\\".xud65wk{border-bottom-color:red}\\", 0.4);
          stylex.inject(\\".x1z0yhbn{border-left-color:blue}\\", 0.4, \\".x1z0yhbn{border-right-color:blue}\\");
          stylex.inject(\\".x13fuv20{border-top-style:solid}\\", 0.4);
          stylex.inject(\\".x157eodl{border-right-style:dashed}\\", 0.4, \\".x157eodl{border-left-style:dashed}\\");
          stylex.inject(\\".x1q0q8m5{border-bottom-style:solid}\\", 0.4);
          stylex.inject(\\".x1q04ism{border-left-style:dashed}\\", 0.4, \\".x1q04ism{border-right-style:dashed}\\");
          stylex.inject(\\".x972fbf{border-top-width:0}\\", 0.4);
          stylex.inject(\\".xcfux6l{border-right-width:0}\\", 0.4, \\".xcfux6l{border-left-width:0}\\");
          stylex.inject(\\".xlxy82{border-bottom-width:2px}\\", 0.4);
          stylex.inject(\\".xm0m39n{border-left-width:0}\\", 0.4, \\".xm0m39n{border-right-width:0}\\");
          stylex.inject(\\".x1n2xptk{border-top:1px solid var(--divider)}\\", 0.3);
          stylex.inject(\\".xkbpzyx{border-right:1px solid var(--divider)}\\", 0.3, \\".xkbpzyx{border-left:1px solid var(--divider)}\\");
          stylex.inject(\\".x1rr5fae{border-left:1px solid var(--divider)}\\", 0.3, \\".x1rr5fae{border-right:1px solid var(--divider)}\\");
          stylex.inject(\\".x1lcm9me{border-top-left-radius:4px}\\", 1, \\".x1lcm9me{border-top-right-radius:4px}\\");
          stylex.inject(\\".x1yr5g0i{border-top-right-radius:4px}\\", 1, \\".x1yr5g0i{border-top-left-radius:4px}\\");
          stylex.inject(\\".xrt01vj{border-bottom-right-radius:4px}\\", 1, \\".xrt01vj{border-bottom-left-radius:4px}\\");
          stylex.inject(\\".x10y3i5r{border-bottom-left-radius:4px}\\", 1, \\".x10y3i5r{border-bottom-right-radius:4px}\\");
          stylex.inject(\\".xdwpb5{border-bottom:5px solid red}\\", 0.3);
          stylex.inject(\\".xcrpjku{padding-right:var(--rightpadding,20px)}\\", 1, \\".xcrpjku{padding-left:var(--rightpadding,20px)}\\");
          stylex.inject(\\".x18xuxqe{padding-bottom:calc((100% - 50px) * .5)}\\", 1);
          stylex.inject(\\".xyv1419{padding-left:var(--rightpadding,20px)}\\", 1, \\".xyv1419{padding-right:var(--rightpadding,20px)}\\");
          stylex.inject(\\".xexx8yu{padding-top:0}\\", 1);
          stylex.inject(\\".xb9njkq{border-top-color:green}\\", 0.4);
          stylex.inject(\\".x1plg3iu{border-right-color:green}\\", 0.4, \\".x1plg3iu{border-left-color:green}\\");
          stylex.inject(\\".x1hnil3p{border-bottom-color:green}\\", 0.4);
          stylex.inject(\\".x1s0fimb{border-left-color:green}\\", 0.4, \\".x1s0fimb{border-right-color:green}\\");
          stylex.inject(\\".x13fuv20{border-top-style:solid}\\", 0.4);
          stylex.inject(\\".xu3j5b3{border-right-style:solid}\\", 0.4, \\".xu3j5b3{border-left-style:solid}\\");
          stylex.inject(\\".x1q0q8m5{border-bottom-style:solid}\\", 0.4);
          stylex.inject(\\".x26u7qi{border-left-style:solid}\\", 0.4, \\".x26u7qi{border-right-style:solid}\\");
          stylex.inject(\\".x178xt8z{border-top-width:1px}\\", 0.4);
          stylex.inject(\\".xm81vs4{border-right-width:1px}\\", 0.4, \\".xm81vs4{border-left-width:1px}\\");
          stylex.inject(\\".xso031l{border-bottom-width:1px}\\", 0.4);
          stylex.inject(\\".xy80clv{border-left-width:1px}\\", 0.4, \\".xy80clv{border-right-width:1px}\\");"
        `);
      });

      test('correctly removes shadowed properties when using conditions with shadowed namespace styles', () => {
        expect(
          transform(`
            const styles = stylex.create({
              foo: {
                padding: 5,
                paddingStart: 15,
              },

              bar: {
                padding: 2,
                paddingStart: 10,
              },
            });

            styles({
              bar: true,
              foo: isFoo,
            });
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x123j3cw{padding-top:5px}\\", 1);
          stylex.inject(\\".x1mpkggp{padding-right:5px}\\", 1, \\".x1mpkggp{padding-left:5px}\\");
          stylex.inject(\\".xs9asl8{padding-bottom:5px}\\", 1);
          stylex.inject(\\".xvpee5o{padding-left:15px}\\", 1, \\".xvpee5o{padding-right:15px}\\");
          stylex.inject(\\".x1nn3v0j{padding-top:2px}\\", 1);
          stylex.inject(\\".xg83lxy{padding-right:2px}\\", 1, \\".xg83lxy{padding-left:2px}\\");
          stylex.inject(\\".x1120s5i{padding-bottom:2px}\\", 1);
          stylex.inject(\\".x1sln4lm{padding-left:10px}\\", 1, \\".x1sln4lm{padding-right:10px}\\");
          stylex({
            \\"padding-top-1\\": \\"x1nn3v0j\\",
            \\"padding-end-1\\": \\"xg83lxy\\",
            \\"padding-bottom-1\\": \\"x1120s5i\\",
            \\"padding-start-1\\": \\"x1sln4lm\\"
          }, isFoo ? {
            \\"padding-top-1\\": \\"x123j3cw\\",
            \\"padding-end-1\\": \\"x1mpkggp\\",
            \\"padding-bottom-1\\": \\"xs9asl8\\",
            \\"padding-start-1\\": \\"xvpee5o\\"
          } : null);"
        `);
      });

      test('converts factory calls to stylex calls when composing', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                color: 'red',
              },
              default2: {
                backgroundColor: 'blue',
              }
            });
            const x = styles('default');
            const y = styles('default', active && 'default2');
            const z = styles(props ? 'default2' : 'default');
            stylex(styles.default, styles.default2, props);
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          const styles = {
            default: {
              color: \\"x1e2nbdu\\"
            },
            default2: {
              backgroundColor: \\"x1t391ir\\"
            }
          };
          const x = stylex(styles.default);
          const y = stylex(styles.default, active && styles.default2);
          const z = stylex(props ? styles.default2 : styles.default);
          stylex(styles.default, styles.default2, props);"
        `);
      });

      test("don't rewrite shadowed styles", () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                color: 'blue',
              },
            });

            {
              let styles = function() {};
              styles();
            }
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xju2f9n{color:blue}\\", 1);
          {
            let styles = function () {};

            styles();
          }"
        `);
      });

      test("ensure multiple conditional namespaces don't cause excess whitespace", () => {
        expect(
          transform(`
            const styles = stylex.create({
              foo: {
                color: 'red',
              },
              bar: {
                backgroundColor: 'blue',
              },
            });

            styles({
              foo: isFoo,
              bar: isBar,
            });
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          (isFoo ? \\"x1e2nbdu\\" : \\"\\") + (isBar ? \\" x1t391ir\\" : \\"\\");"
        `);
      });

      test('correctly removes shadowed properties when using conditions', () => {
        expect(
          transform(`
            const styles = stylex.create({
              foo: {
                padding: 5,
              },

              bar: {
                padding: 2,
                paddingStart: 10,
              },
            });

            styles({
              bar: true,
              foo: isFoo,
            });
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x123j3cw{padding-top:5px}\\", 1);
          stylex.inject(\\".x1mpkggp{padding-right:5px}\\", 1, \\".x1mpkggp{padding-left:5px}\\");
          stylex.inject(\\".xs9asl8{padding-bottom:5px}\\", 1);
          stylex.inject(\\".x1t2a60a{padding-left:5px}\\", 1, \\".x1t2a60a{padding-right:5px}\\");
          stylex.inject(\\".x1nn3v0j{padding-top:2px}\\", 1);
          stylex.inject(\\".xg83lxy{padding-right:2px}\\", 1, \\".xg83lxy{padding-left:2px}\\");
          stylex.inject(\\".x1120s5i{padding-bottom:2px}\\", 1);
          stylex.inject(\\".x1sln4lm{padding-left:10px}\\", 1, \\".x1sln4lm{padding-right:10px}\\");
          stylex({
            \\"padding-top-1\\": \\"x1nn3v0j\\",
            \\"padding-end-1\\": \\"xg83lxy\\",
            \\"padding-bottom-1\\": \\"x1120s5i\\",
            \\"padding-start-1\\": \\"x1sln4lm\\"
          }, isFoo ? {
            \\"padding-top-1\\": \\"x123j3cw\\",
            \\"padding-end-1\\": \\"x1mpkggp\\",
            \\"padding-bottom-1\\": \\"xs9asl8\\",
            \\"padding-start-1\\": \\"x1t2a60a\\"
          } : null);"
        `);
      });

      test('transforms media queries', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
                '@media (min-width: 1000px)': {
                  backgroundColor: 'blue',
                },
                '@media (min-width: 2000px)': {
                  backgroundColor: 'purple',
                },
              },
            });
            styles('default');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xrkmrrc{background-color:red}\\", 1);
          stylex.inject(\\"@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}\\", 2);
          stylex.inject(\\"@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}\\", 2);
          \\"x1ssfqz5 xc445zv xrkmrrc\\";"
        `);
      });

      test('transforms supports queries', () => {
        expect(
          transform(`
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
                '@supports (hover: hover)': {
                  backgroundColor: 'blue',
                },
                '@supports not (hover: hover)': {
                  backgroundColor: 'purple',
                },
              },
            });
            styles('default');
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xrkmrrc{background-color:red}\\", 1);
          stylex.inject(\\"@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}\\", 2);
          stylex.inject(\\"@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}\\", 2);
          \\"x6um648 x6m3b6q xrkmrrc\\";"
        `);
      });

      test('ensure that the first argument of a stylex.dedupe object.assign call is an object', () => {
        expect(
          transform(`
            const styles = stylex.create({
              highLevel: {
                marginTop: 24,
              },
              lowLevel: {
                marginTop: 16,
              },
            });
            styles({
              highLevel: headingLevel === 1 || headingLevel === 2,
              lowLevel: headingLevel === 3 || headingLevel === 4,
            });
          `)
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xqui205{margin-top:24px}\\", 1);
          stylex.inject(\\".xw7yly9{margin-top:16px}\\", 1);
          stylex(headingLevel === 1 || headingLevel === 2 ? {
            \\"margin-top-1\\": \\"xqui205\\"
          } : {}, headingLevel === 3 || headingLevel === 4 ? {
            \\"margin-top-1\\": \\"xw7yly9\\"
          } : null);"
        `);
      });
    });

    describe('plugin options', () => {
      test('add dev class name to plain stylex value calls', () => {
        const options = {
          dev: true,
          filename: 'html/js/FooBar.react.js',
        };
        expect(
          transform(
            `
            const styles = stylex.create({
              default: {
                color: 'red',
              }
            });
            styles('default');
          `,
            options
          )
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          \\"FooBar__default x1e2nbdu\\";"
        `);
      });

      test('add dev class name to condition stylex value calls', () => {
        const options = {
          dev: true,
          filename: 'html/js/FooBar.react.js',
        };
        expect(
          transform(
            `
            const styles = stylex.create({
              default: {
                color: 'red',
              },
              active: {
                backgroundColor: 'blue',
              }
            });
            styles('default', isActive && 'active');
          `,
            options
          )
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          \\"FooBar__default x1e2nbdu\\" + (isActive ? \\" FooBar__active x1t391ir\\" : \\"\\");"
        `);
      });

      test('add dev class name to collision stylex value calls', () => {
        const options = {
          dev: true,
          filename: 'html/js/FooBar.react.js',
        };
        expect(
          transform(
            `
            const styles = stylex.create({
              default: {
                color: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            styles('default', isActive && 'active');
          `,
            options
          )
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".x1e2nbdu{color:red}\\", 1);
          stylex.inject(\\".xju2f9n{color:blue}\\", 1);
          stylex({
            \\"FooBar__default\\": \\"FooBar__default\\",
            \\"color-1\\": \\"x1e2nbdu\\"
          }, isActive ? {
            \\"FooBar__active\\": \\"FooBar__active\\",
            \\"color-1\\": \\"xju2f9n\\"
          } : null);"
        `);
      });

      test("don't output style classes when in test mode", () => {
        const options = {
          dev: true,
          filename: 'html/js/FooBar.react.js',
          test: true,
        };
        expect(
          transform(
            `
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },

              blue: {
                backgroundColor: 'blue',
              },
            });
            styles('default');
            styles('default', isBlue && 'blue');
            styles({
              default: true,
              blue: isBlue,
            });
          `,
            options
          )
        ).toMatchInlineSnapshot(`
          "stylex.inject(\\".xrkmrrc{background-color:red}\\", 1);
          stylex.inject(\\".x1t391ir{background-color:blue}\\", 1);
          \\"FooBar__default\\";
          stylex({
            \\"FooBar__default\\": \\"FooBar__default\\"
          }, isBlue ? {
            \\"FooBar__blue\\": \\"FooBar__blue\\"
          } : null);
          stylex({
            \\"FooBar__default\\": \\"FooBar__default\\"
          }, isBlue ? {
            \\"FooBar__blue\\": \\"FooBar__blue\\"
          } : null);"
        `);
      });
    });
  });
});
