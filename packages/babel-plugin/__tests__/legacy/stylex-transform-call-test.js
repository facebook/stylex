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
      flow: 'all',
    },
    plugins: [jsx, [stylexPlugin, { runtimeInjection: true, ...opts }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex() call', () => {
    test('empty stylex call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          stylex();
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        "";"
      `);
    });

    test('basic stylex call', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          stylex(styles.red);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });

    test('stylex call with number', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            0: {
              color: 'red',
            },
            1: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles[0], styles[1]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        "x1e2nbdu x1t391ir";"
      `);
    });

    test('stylex call with computed number', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            [0]: {
              color: 'red',
            },
            [1]: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles[0], styles[1]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        "x1e2nbdu x1t391ir";"
      `);
    });

    test('stylex call with computed number', () => {
      expect(
        transform(`
          import {create} from '@stylexjs/stylex';
          const styles = create({
            [0]: {
              color: 'red',
            },
            [1]: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles[0], styles[1]);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import { create } from '@stylexjs/stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          "0": {
            kMwMTN: "x1e2nbdu",
            $$css: true
          },
          "1": {
            kWkggS: "x1t391ir",
            $$css: true
          }
        };
        stylex(styles[0], styles[1]);"
      `);
    });

    test('stylex call with computed string', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            'default': {
              color: 'red',
            }
          });
          stylex(styles['default']);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });

    test('stylex call with multiple namespaces', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: 'red',
            },
          });
          const otherStyles = stylex.create({
            default: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles.default, otherStyles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        "x1e2nbdu x1t391ir";"
      `);
    });

    test('stylex call within variable declarations', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: { color: 'red' }
          });
          const a = function() {
            return stylex(styles.foo);
          }
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        const a = function () {
          return "x1e2nbdu";
        };"
      `);
    });

    test('stylex call with styles variable assignment', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              color: 'red',
            },
            bar: {
              backgroundColor: 'blue',
            }
          });
          stylex(styles.foo, styles.bar);
          const foo = styles;
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          foo: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          },
          bar: {
            kWkggS: "x1t391ir",
            $$css: true
          }
        };
        "x1e2nbdu x1t391ir";
        const foo = styles;"
      `);
    });

    test('stylex call within export declarations', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: { color: 'red' }
          });
          export default function MyExportDefault() {
            return stylex(styles.foo);
          }
          export function MyExport() {
            return stylex(styles.foo);
          }
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        export default function MyExportDefault() {
          return "x1e2nbdu";
        }
        export function MyExport() {
          return "x1e2nbdu";
        }"
      `);
    });

    test('stylex call with short-form properties', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
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
        _inject2(".x14odnwx{padding:5px}", 1000);
        "x14odnwx";"
      `);
    });

    test('stylex call with exported short-form properties', () => {
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
        _inject2(".x14odnwx{padding:5px}", 1000);
        export const styles = {
          foo: {
            kmVPX3: "x14odnwx",
            kg3NbH: null,
            kuDDbn: null,
            kE3dHu: null,
            kP0aTx: null,
            kpe85a: null,
            k8WAf4: null,
            kLKAdn: null,
            kGO01o: null,
            $$css: true
          }
        };
        "x14odnwx";"
      `);
    });

    test('stylex call keeps only the styles that are needed', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5
            },
            bar: {
              paddingBlock: 10,
            },
            baz: {
              paddingTop: 7,
            }
          });
          stylex(styles.foo);
          stylex(styles.foo, styles.bar);
          stylex(styles.bar, styles.foo);
          stylex(styles.foo, styles.bar, styles.baz);
          stylex(styles.foo, somethingElse);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x14odnwx{padding:5px}", 1000);
        _inject2(".xp59q4u{padding-block:10px}", 2000);
        _inject2(".xm7lytj{padding-top:7px}", 4000);
        const styles = {
          foo: {
            kmVPX3: "x14odnwx",
            $$css: true
          }
        };
        "x14odnwx";
        "x14odnwx xp59q4u";
        "x14odnwx";
        "x14odnwx xp59q4u xm7lytj";
        stylex(styles.foo, somethingElse);"
      `);
    });

    test('stylex keeps all null when applied after unknown', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5
            },
            bar: {
              paddingBlock: 10,
            },
            baz: {
              paddingTop: 7,
            }
          });
          stylex(styles.foo);
          stylex(styles.foo, styles.bar);
          stylex(styles.bar, styles.foo);
          stylex(styles.foo, styles.bar, styles.baz);
          stylex(somethingElse, styles.foo);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x14odnwx{padding:5px}", 1000);
        _inject2(".xp59q4u{padding-block:10px}", 2000);
        _inject2(".xm7lytj{padding-top:7px}", 4000);
        const styles = {
          foo: {
            kmVPX3: "x14odnwx",
            kg3NbH: null,
            kuDDbn: null,
            kE3dHu: null,
            kP0aTx: null,
            kpe85a: null,
            k8WAf4: null,
            kLKAdn: null,
            kGO01o: null,
            $$css: true
          }
        };
        "x14odnwx";
        "x14odnwx xp59q4u";
        "x14odnwx";
        "x14odnwx xp59q4u xm7lytj";
        stylex(somethingElse, styles.foo);"
      `);
    });

    test('stylex call keeps only the nulls that are needed', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5
            },
            bar: {
              paddingBlock: 10,
            },
            baz: {
              paddingTop: 7,
            }
          });
          stylex(styles.foo);
          stylex(styles.foo, styles.bar);
          stylex(styles.bar, styles.foo);
          stylex(styles.foo, styles.bar, styles.baz);
          stylex(styles.baz, styles.foo, somethingElse);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x14odnwx{padding:5px}", 1000);
        _inject2(".xp59q4u{padding-block:10px}", 2000);
        _inject2(".xm7lytj{padding-top:7px}", 4000);
        const styles = {
          foo: {
            kmVPX3: "x14odnwx",
            kLKAdn: null,
            $$css: true
          },
          baz: {
            kLKAdn: "xm7lytj",
            $$css: true
          }
        };
        "x14odnwx";
        "x14odnwx xp59q4u";
        "x14odnwx";
        "x14odnwx xp59q4u xm7lytj";
        stylex(styles.baz, styles.foo, somethingElse);"
      `);
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              padding: 5
            },
            bar: {
              paddingBlock: 10,
            },
            baz: {
              paddingTop: 7,
            }
          });
          stylex(styles.foo);
          stylex(styles.foo, styles.bar);
          stylex(styles.bar, styles.foo);
          stylex(styles.foo, styles.bar, styles.baz);
          stylex(styles.bar, styles.foo, somethingElse);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x14odnwx{padding:5px}", 1000);
        _inject2(".xp59q4u{padding-block:10px}", 2000);
        _inject2(".xm7lytj{padding-top:7px}", 4000);
        const styles = {
          foo: {
            kmVPX3: "x14odnwx",
            k8WAf4: null,
            $$css: true
          },
          bar: {
            k8WAf4: "xp59q4u",
            $$css: true
          }
        };
        "x14odnwx";
        "x14odnwx xp59q4u";
        "x14odnwx";
        "x14odnwx xp59q4u xm7lytj";
        stylex(styles.bar, styles.foo, somethingElse);"
      `);
    });

    test('stylex call using styles with pseudo selectors', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: 'red',
              ':hover': {
                color: 'blue',
              }
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        "x1e2nbdu x17z2mba";"
      `);
    });

    test('stylex call using styles with pseudo selectors within property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: {
                default: 'red',
                ':hover': 'blue',
              }
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        "x1e2nbdu x17z2mba";"
      `);
    });

    test('stylex call using styles with Media Queries', () => {
      expect(
        transform(`
          import stylex from 'stylex';
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
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
        "xrkmrrc xc445zv x1ssfqz5";"
      `);
    });

    test('stylex call using styles with Media Queries within property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: {
                default:'red',
                '@media (min-width: 1000px)': 'blue',
                '@media (min-width: 2000px)': 'purple',
              },
            },
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        _inject2("@media (min-width: 2000px){.x1ssfqz5.x1ssfqz5{background-color:purple}}", 3200);
        "xrkmrrc xc445zv x1ssfqz5";"
      `);
    });

    test('stylex call using styles with Support Queries', () => {
      expect(
        transform(`
          import stylex from 'stylex';
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
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
        _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
        "xrkmrrc x6m3b6q x6um648";"
      `);
    });

    test('stylex call using styles with Support Queries within property', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              backgroundColor: {
                default:'red',
                '@supports (hover: hover)': 'blue',
                '@supports not (hover: hover)': 'purple',
              },
            },
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2("@supports (hover: hover){.x6m3b6q.x6m3b6q{background-color:blue}}", 3030);
        _inject2("@supports not (hover: hover){.x6um648.x6um648{background-color:purple}}", 3030);
        "xrkmrrc x6m3b6q x6um648";"
      `);
    });

    describe('with conditional styles and collisions', () => {
      test('stylex call with conditions', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            stylex(styles.default, isActive && styles.active);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          ({
            0: "xrkmrrc",
            1: "xrkmrrc xju2f9n"
          })[!!isActive << 0];"
        `);
      });

      test('stylex call with conditions - skip conditional', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                backgroundColor: 'red',
              },
              active: {
                color: 'blue',
              }
            });
            stylex(styles.default, isActive && styles.active);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".xrkmrrc{background-color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          const styles = {
            default: {
              kWkggS: "xrkmrrc",
              $$css: true
            },
            active: {
              kMwMTN: "xju2f9n",
              $$css: true
            }
          };
          stylex(styles.default, isActive && styles.active);"
        `);
      });

      test('stylex call with property collisions', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: 'blue',
              }
            });
            stylex(styles.red, styles.blue);
            stylex(styles.blue, styles.red);
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          "xju2f9n";
          "x1e2nbdu";"
        `);
      });

      test('stylex call with reverting by null', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              revert: {
                color: null,
              }
            });
            stylex(styles.red, styles.revert);
            stylex(styles.revert, styles.red);
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          "";
          "x1e2nbdu";"
        `);
      });

      test('stylex call with short-form property collisions', () => {
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
          _inject2(".x14odnwx{padding:5px}", 1000);
          _inject2(".x2vl965{padding-inline-end:10px}", 3000);
          _inject2(".x1i3ajwb{padding:2px}", 1000);
          _inject2(".xe2zdcy{padding-inline-start:10px}", 3000);
          "x2vl965 x1i3ajwb xe2zdcy";"
        `);
      });

      test('stylex call with short-form property collisions with null', () => {
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
          _inject2(".x14odnwx{padding:5px}", 1000);
          _inject2(".x2vl965{padding-inline-end:10px}", 3000);
          _inject2(".x1i3ajwb{padding:2px}", 1000);
          "x2vl965 x1i3ajwb";"
        `);
      });

      test('stylex call with conditions and collisions', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: 'blue',
              }
            });
            stylex(styles.red, isActive && styles.blue);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          ({
            0: "x1e2nbdu",
            1: "xju2f9n"
          })[!!isActive << 0];"
        `);
      });

      test('stylex call with conditions and collisions - skip conditional', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: 'blue',
              }
            });
            stylex(styles.red, isActive && styles.blue);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".xju2f9n{color:blue}", 3000);
          const styles = {
            red: {
              kMwMTN: "x1e2nbdu",
              $$css: true
            },
            blue: {
              kMwMTN: "xju2f9n",
              $$css: true
            }
          };
          stylex(styles.red, isActive && styles.blue);"
        `);
      });

      test('stylex call with conditions and null collisions', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: null,
              }
            });
            stylex(styles.red, isActive && styles.blue);
          `,
            { genConditionalClasses: true },
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          ({
            0: "x1e2nbdu",
            1: ""
          })[!!isActive << 0];"
        `);
      });

      test('stylex call with conditions and null collisions - skip conditional', () => {
        expect(
          transform(
            `
            import stylex from 'stylex';
            const styles = stylex.create({
              red: {
                color: 'red',
              },
              blue: {
                color: null,
              }
            });
            stylex(styles.red, isActive && styles.blue);
            `,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x1e2nbdu{color:red}", 3000);
          const styles = {
            red: {
              kMwMTN: "x1e2nbdu",
              $$css: true
            },
            blue: {
              kMwMTN: null,
              $$css: true
            }
          };
          stylex(styles.red, isActive && styles.blue);"
        `);
      });
    });

    // COMPOSITION
    describe('with plugin options', () => {
      test('dev:true', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
        };
        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
              });
              stylex(styles.default);
            `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          "color-x1e2nbdu";"
        `);

        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
              });
              const otherStyles = stylex.create({
                default: {
                  backgroundColor: 'blue',
                }
              });
              stylex(styles.default, isActive && otherStyles.default);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              "color-kMwMTN": "color-x1e2nbdu",
              $$css: "js/FooBar.react.js:4"
            }
          };
          _inject2(".backgroundColor-x1t391ir{background-color:blue}", 3000);
          const otherStyles = {
            default: {
              "backgroundColor-kWkggS": "backgroundColor-x1t391ir",
              $$css: "js/FooBar.react.js:9"
            }
          };
          stylex(styles.default, isActive && otherStyles.default);"
        `);

        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
                active: {
                  color: 'blue',
                }
              });
              stylex(styles.default, isActive && styles.active);
            `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          _inject2(".color-xju2f9n{color:blue}", 3000);
          const styles = {
            default: {
              "color-kMwMTN": "color-x1e2nbdu",
              $$css: "js/FooBar.react.js:4"
            },
            active: {
              "color-kMwMTN": "color-xju2f9n",
              $$css: "js/FooBar.react.js:7"
            }
          };
          stylex(styles.default, isActive && styles.active);"
        `);
      });

      test('dev:true and genConditionalClasses:true', () => {
        const options = {
          filename: '/html/js/FooBar.react.js',
          dev: true,
          genConditionalClasses: true,
        };
        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
              });
              const otherStyles = stylex.create({
                default: {
                  backgroundColor: 'blue',
                }
              });
              stylex(styles.default, isActive && otherStyles.default);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          _inject2(".backgroundColor-x1t391ir{background-color:blue}", 3000);
          ({
            0: "color-x1e2nbdu",
            1: "color-x1e2nbdu backgroundColor-x1t391ir"
          })[!!isActive << 0];"
        `);

        expect(
          transform(
            `
              import stylex from 'stylex';
              const styles = stylex.create({
                default: {
                  color: 'red',
                },
                active: {
                  color: 'blue',
                }
              });
              stylex(styles.default, isActive && styles.active);
          `,
            options,
          ),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".color-x1e2nbdu{color:red}", 3000);
          _inject2(".color-xju2f9n{color:blue}", 3000);
          ({
            0: "color-x1e2nbdu",
            1: "color-xju2f9n"
          })[!!isActive << 0];"
        `);
      });
    });
  });
  describe('Keep stylex.create when needed', () => {
    test('stylex call with computed key access', () => {
      expect(
        transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              [0]: {
                color: 'red',
              },
              [1]: {
                backgroundColor: 'blue',
              }
            });
            stylex(styles[variant]);
          `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        _inject2(".x1t391ir{background-color:blue}", 3000);
        const styles = {
          "0": {
            kMwMTN: "x1e2nbdu",
            $$css: true
          },
          "1": {
            kWkggS: "x1t391ir",
            $$css: true
          }
        };
        stylex(styles[variant]);"
      `);
    });

    test('stylex keeps spaces around operators', () => {
      expect(
        transform(`
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            default: {
              margin: 'max(0px, (48px - var(--x16dnrjz)) / 2)',
            },
          });
          stylex(styles.default, props);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".x1d6cl6p{margin:max(0px,(48px - var(--x16dnrjz)) / 2)}", 1000);
        const styles = {
          default: {
            kogj98: "x1d6cl6p",
            $$css: true
          }
        };
        stylex(styles.default, props);"
      `);
    });

    test('stylex call with composition of external styles', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            default: {
              color: 'red',
            },
          });
          stylex(styles.default, props);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x1e2nbdu{color:red}", 3000);
        const styles = {
          default: {
            kMwMTN: "x1e2nbdu",
            $$css: true
          }
        };
        stylex(styles.default, props);"
      `);
    });

    test('stylex call using exported styles with pseudo selectors, and queries', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: {
              ':hover': {
                color: 'blue',
              },
              '@media (min-width: 1000px)': {
                backgroundColor: 'blue',
              },
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        export const styles = {
          default: {
            kDPRdz: "x17z2mba",
            ksQ81T: "xc445zv",
            $$css: true
          }
        };
        "x17z2mba xc445zv";"
      `);
    });

    test('stylex call using exported styles with pseudo selectors, and queries within props', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            default: {
              color: {
                ':hover': 'blue',
              },
              backgroundColor: {
                '@media (min-width: 1000px)': 'blue'
              },
            }
          });
          stylex(styles.default);
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'stylex';
        _inject2(".x17z2mba:hover{color:blue}", 3130);
        _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
        export const styles = {
          default: {
            kMwMTN: "x17z2mba",
            kWkggS: "xc445zv",
            $$css: true
          }
        };
        "x17z2mba xc445zv";"
      `);
    });

    describe('even when stylex calls come first', () => {
      test('stylex call with computed key access', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex(styles[variant]);
            const styles = stylex.create({
              [0]: {
                color: 'red',
              },
              [1]: {
                backgroundColor: 'blue',
              }
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          stylex(styles[variant]);
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".x1t391ir{background-color:blue}", 3000);
          const styles = {
            "0": {
              kMwMTN: "x1e2nbdu",
              $$css: true
            },
            "1": {
              kWkggS: "x1t391ir",
              $$css: true
            }
          };"
        `);
      });

      test('stylex call with mixed access', () => {
        expect(
          transform(`
            import stylex from 'stylex';

            function MyComponent() {
              return (
                <>
                  <div className={stylex(styles.foo)} />
                  <div className={stylex(styles.bar)} />
                  <CustomComponent xstyle={styles.foo} />
                  <div className={stylex(styles.foo, styles.bar)} />
                </>
              );
            }

            const styles = stylex.create({
              foo: {
                color: 'red',
              },
              bar: {
                backgroundColor: 'blue',
              }
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          function MyComponent() {
            return <>
                            <div className={"x1e2nbdu"} />
                            <div className={"x1t391ir"} />
                            <CustomComponent xstyle={styles.foo} />
                            <div className={"x1e2nbdu x1t391ir"} />
                          </>;
          }
          _inject2(".x1e2nbdu{color:red}", 3000);
          _inject2(".x1t391ir{background-color:blue}", 3000);
          const styles = {
            foo: {
              kMwMTN: "x1e2nbdu",
              $$css: true
            }
          };"
        `);
      });
      test('stylex call with composition of external styles', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex(styles.default, props);
            const styles = stylex.create({
              default: {
                color: 'red',
              },
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          stylex(styles.default, props);
          _inject2(".x1e2nbdu{color:red}", 3000);
          const styles = {
            default: {
              kMwMTN: "x1e2nbdu",
              $$css: true
            }
          };"
        `);
      });

      test('stylex call with composition border shorthands with external styles', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            const styles = stylex.create({
              default: {
                borderTop: '5px solid blue',
                borderLeft: '5px solid blue',
                borderRight: '5px solid blue',
                borderBottom: '5px solid blue',
              },
            });
            stylex(styles.default, props);
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          _inject2(".x16gpukw{border-top:5px solid blue}", 2000);
          _inject2(".x13nwy86{border-left:5px solid blue}", 2000);
          _inject2(".x2ekbea{border-right:5px solid blue}", 2000);
          _inject2(".x1o3008b{border-bottom:5px solid blue}", 2000);
          const styles = {
            default: {
              kX8ASl: "x16gpukw",
              kLDBTA: "x13nwy86",
              km2aEK: "x2ekbea",
              k4EQJz: "x1o3008b",
              $$css: true
            }
          };
          stylex(styles.default, props);"
        `);
      });

      test('stylex call using exported styles with pseudo selectors, and queries', () => {
        expect(
          transform(`
            import stylex from 'stylex';
            stylex(styles.default);
            export const styles = stylex.create({
              default: {
                ':hover': {
                  color: 'blue',
                },
                '@media (min-width: 1000px)': {
                  backgroundColor: 'blue',
                },
              }
            });
          `),
        ).toMatchInlineSnapshot(`
          "import _inject from "@stylexjs/stylex/lib/stylex-inject";
          var _inject2 = _inject;
          import stylex from 'stylex';
          "x17z2mba xc445zv";
          _inject2(".x17z2mba:hover{color:blue}", 3130);
          _inject2("@media (min-width: 1000px){.xc445zv.xc445zv{background-color:blue}}", 3200);
          export const styles = {
            default: {
              kDPRdz: "x17z2mba",
              ksQ81T: "xc445zv",
              $$css: true
            }
          };"
        `);
      });
    });
  });
  describe('Setting custom import paths', () => {
    test('Basic stylex call', () => {
      expect(
        transform(
          `
          import stylex from 'custom-stylex-path';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          stylex(styles.red);
        `,
          { importSources: ['custom-stylex-path'] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import stylex from 'custom-stylex-path';
        _inject2(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });
    test('Named import from custom source', () => {
      expect(
        transform(
          `
          import {css as stylex} from 'custom-stylex-path';
          const styles = stylex.create({
            red: {
              color: 'red',
            }
          });
          stylex(styles.red);
        `,
          { importSources: [{ from: 'custom-stylex-path', as: 'css' }] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import { css as stylex } from 'custom-stylex-path';
        _inject2(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });
    test('Named import with other name from custom source', () => {
      expect(
        transform(
          `
          import {css} from 'custom-stylex-path';
          const styles = css.create({
            red: {
              color: 'red',
            }
          });
          css(styles.red);
        `,
          { importSources: [{ from: 'custom-stylex-path', as: 'css' }] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import { css } from 'custom-stylex-path';
        _inject2(".x1e2nbdu{color:red}", 3000);
        "x1e2nbdu";"
      `);
    });
  });
  describe('Extreme use-cases', () => {
    test('Basic stylex call', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            sidebar: {
              boxSizing: 'border-box',
              gridArea: 'sidebar',
            },
            content: {
              gridArea: 'content',
            },
            root: {
              display: 'grid',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"content"',
            },
            withSidebar: {
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"sidebar content"',
              '@media (max-width: 640px)': {
                gridTemplateRows: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"content" "sidebar"',
                gridTemplateColumns: '100%',
              },
            },
            noSidebar: {
              gridTemplateColumns: 'minmax(0, 1fr)',
            },
          });
          stylex(
            styles.root,
            sidebar == null ? styles.noSidebar : styles.withSidebar,
          );
        `,
          {
            dev: true,
            filename: 'src/js/components/Foo.react.js',
            genConditionalClasses: true,
          },
        ),
      ).toMatchInlineSnapshot(`
        ""use strict";

        var _stylexInject = _interopRequireDefault(require("@stylexjs/stylex/lib/stylex-inject"));
        var stylex = _interopRequireWildcard(require("@stylexjs/stylex"));
        function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
        function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
        function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
        var _inject2 = _stylexInject.default;
        _inject2(".boxSizing-x9f619{box-sizing:border-box}", 3000);
        _inject2(".gridArea-x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".gridArea-x1fdo2jl{grid-area:content}", 1000);
        _inject2(".display-xrvj5dj{display:grid}", 3000);
        _inject2(".gridTemplateRows-x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".gridTemplateAreas-x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".gridTemplateColumns-x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".gridTemplateAreas-x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.gridTemplateRows-xmr4b4k.gridTemplateRows-xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.gridTemplateAreas-xesbpuc.gridTemplateAreas-xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.gridTemplateColumns-x15nfgh4.gridTemplateColumns-x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".gridTemplateColumns-x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        ({
          0: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4",
          1: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x"
        })[!!(sidebar == null) << 0];"
      `);
    });
    test('Basic exported stylex.create call', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            sidebar: {
              boxSizing: 'border-box',
              gridArea: 'sidebar',
            },
            content: {
              gridArea: 'content',
            },
            root: {
              display: 'grid',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"content"',
            },
            withSidebar: {
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"sidebar content"',
              '@media (max-width: 640px)': {
                gridTemplateRows: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"content" "sidebar"',
                gridTemplateColumns: '100%',
              },
            },
            noSidebar: {
              gridTemplateColumns: 'minmax(0, 1fr)',
            },
          });
          stylex(
            styles.root,
            sidebar == null ? styles.noSidebar : styles.withSidebar,
          );
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".boxSizing-x9f619{box-sizing:border-box}", 3000);
        _inject2(".gridArea-x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".gridArea-x1fdo2jl{grid-area:content}", 1000);
        _inject2(".display-xrvj5dj{display:grid}", 3000);
        _inject2(".gridTemplateRows-x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".gridTemplateAreas-x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".gridTemplateColumns-x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".gridTemplateAreas-x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.gridTemplateRows-xmr4b4k.gridTemplateRows-xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.gridTemplateAreas-xesbpuc.gridTemplateAreas-xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.gridTemplateColumns-x15nfgh4.gridTemplateColumns-x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".gridTemplateColumns-x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        export const styles = {
          sidebar: {
            "boxSizing-kB7OPa": "boxSizing-x9f619",
            "gridArea-kJuA4N": "gridArea-x1yc5d2u",
            "gridRow-kbNqZ1": null,
            "gridRowStart-k1lYIM": null,
            "gridRowEnd-kpJH7q": null,
            "gridColumn-kBCFzs": null,
            "gridColumnStart-kEXP64": null,
            "gridColumnEnd-kWZpDQ": null,
            $$css: true
          },
          content: {
            "gridArea-kJuA4N": "gridArea-x1fdo2jl",
            "gridRow-kbNqZ1": null,
            "gridRowStart-k1lYIM": null,
            "gridRowEnd-kpJH7q": null,
            "gridColumn-kBCFzs": null,
            "gridColumnStart-kEXP64": null,
            "gridColumnEnd-kWZpDQ": null,
            $$css: true
          },
          root: {
            "display-k1xSpc": "display-xrvj5dj",
            "gridTemplateRows-k9llMU": "gridTemplateRows-x7k18q3",
            "gridTemplateAreas-kC13JO": "gridTemplateAreas-x5gp9wm",
            $$css: true
          },
          withSidebar: {
            "gridTemplateColumns-kumcoG": "gridTemplateColumns-x1rkzygb",
            "gridTemplateRows-k9llMU": "gridTemplateRows-x7k18q3",
            "gridTemplateAreas-kC13JO": "gridTemplateAreas-x17lh93j",
            "@media (max-width: 640px)_gridTemplateRows-k9pwkU": "gridTemplateRows-xmr4b4k",
            "@media (max-width: 640px)_gridTemplateAreas-kOnEH4": "gridTemplateAreas-xesbpuc",
            "@media (max-width: 640px)_gridTemplateColumns-k1JLwA": "gridTemplateColumns-x15nfgh4",
            $$css: true
          },
          noSidebar: {
            "gridTemplateColumns-kumcoG": "gridTemplateColumns-x1mkdm3x",
            $$css: true
          }
        };
        ({
          0: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4",
          1: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x"
        })[!!(sidebar == null) << 0];"
      `);
    });

    test('Basic stylex call - skip conditional', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          export const styles = stylex.create({
            sidebar: {
              boxSizing: 'border-box',
              gridArea: 'sidebar',
            },
            content: {
              gridArea: 'content',
            },
            root: {
              display: 'grid',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"content"',
            },
            withSidebar: {
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"sidebar content"',
              '@media (max-width: 640px)': {
                gridTemplateRows: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"content" "sidebar"',
                gridTemplateColumns: '100%',
              },
            },
            noSidebar: {
              gridTemplateColumns: 'minmax(0, 1fr)',
            },
          });
          stylex(
            styles.root,
            sidebar == null ? styles.noSidebar : styles.withSidebar,
          );
        `,
          { dev: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".boxSizing-x9f619{box-sizing:border-box}", 3000);
        _inject2(".gridArea-x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".gridArea-x1fdo2jl{grid-area:content}", 1000);
        _inject2(".display-xrvj5dj{display:grid}", 3000);
        _inject2(".gridTemplateRows-x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".gridTemplateAreas-x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".gridTemplateColumns-x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".gridTemplateAreas-x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.gridTemplateRows-xmr4b4k.gridTemplateRows-xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.gridTemplateAreas-xesbpuc.gridTemplateAreas-xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.gridTemplateColumns-x15nfgh4.gridTemplateColumns-x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".gridTemplateColumns-x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        export const styles = {
          sidebar: {
            "boxSizing-kB7OPa": "boxSizing-x9f619",
            "gridArea-kJuA4N": "gridArea-x1yc5d2u",
            "gridRow-kbNqZ1": null,
            "gridRowStart-k1lYIM": null,
            "gridRowEnd-kpJH7q": null,
            "gridColumn-kBCFzs": null,
            "gridColumnStart-kEXP64": null,
            "gridColumnEnd-kWZpDQ": null,
            $$css: true
          },
          content: {
            "gridArea-kJuA4N": "gridArea-x1fdo2jl",
            "gridRow-kbNqZ1": null,
            "gridRowStart-k1lYIM": null,
            "gridRowEnd-kpJH7q": null,
            "gridColumn-kBCFzs": null,
            "gridColumnStart-kEXP64": null,
            "gridColumnEnd-kWZpDQ": null,
            $$css: true
          },
          root: {
            "display-k1xSpc": "display-xrvj5dj",
            "gridTemplateRows-k9llMU": "gridTemplateRows-x7k18q3",
            "gridTemplateAreas-kC13JO": "gridTemplateAreas-x5gp9wm",
            $$css: true
          },
          withSidebar: {
            "gridTemplateColumns-kumcoG": "gridTemplateColumns-x1rkzygb",
            "gridTemplateRows-k9llMU": "gridTemplateRows-x7k18q3",
            "gridTemplateAreas-kC13JO": "gridTemplateAreas-x17lh93j",
            "@media (max-width: 640px)_gridTemplateRows-k9pwkU": "gridTemplateRows-xmr4b4k",
            "@media (max-width: 640px)_gridTemplateAreas-kOnEH4": "gridTemplateAreas-xesbpuc",
            "@media (max-width: 640px)_gridTemplateColumns-k1JLwA": "gridTemplateColumns-x15nfgh4",
            $$css: true
          },
          noSidebar: {
            "gridTemplateColumns-kumcoG": "gridTemplateColumns-x1mkdm3x",
            $$css: true
          }
        };
        stylex(styles.root, sidebar == null ? styles.noSidebar : styles.withSidebar);"
      `);
    });

    test('Basic stylex call', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            sidebar: {
              boxSizing: 'border-box',
              gridArea: 'sidebar',
            },
            content: {
              gridArea: 'content',
            },
            root: {
              display: 'grid',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"content"',
            },
            withSidebar: {
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: '100%',
              gridTemplateAreas: '"sidebar content"',
              '@media (max-width: 640px)': {
                gridTemplateRows: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"content" "sidebar"',
                gridTemplateColumns: '100%',
              },
            },
            noSidebar: {
              gridTemplateColumns: 'minmax(0, 1fr)',
            },
          });
          const complex = stylex(
            styles.root,
            sidebar == null && !isSidebar ? styles.noSidebar : styles.withSidebar,
            isSidebar && styles.sidebar,
            isContent && styles.content,
          );
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".boxSizing-x9f619{box-sizing:border-box}", 3000);
        _inject2(".gridArea-x1yc5d2u{grid-area:sidebar}", 1000);
        _inject2(".gridArea-x1fdo2jl{grid-area:content}", 1000);
        _inject2(".display-xrvj5dj{display:grid}", 3000);
        _inject2(".gridTemplateRows-x7k18q3{grid-template-rows:100%}", 3000);
        _inject2(".gridTemplateAreas-x5gp9wm{grid-template-areas:\\"content\\"}", 2000);
        _inject2(".gridTemplateColumns-x1rkzygb{grid-template-columns:auto minmax(0,1fr)}", 3000);
        _inject2(".gridTemplateAreas-x17lh93j{grid-template-areas:\\"sidebar content\\"}", 2000);
        _inject2("@media (max-width: 640px){.gridTemplateRows-xmr4b4k.gridTemplateRows-xmr4b4k{grid-template-rows:minmax(0,1fr) auto}}", 3200);
        _inject2("@media (max-width: 640px){.gridTemplateAreas-xesbpuc.gridTemplateAreas-xesbpuc{grid-template-areas:\\"content\\" \\"sidebar\\"}}", 2200);
        _inject2("@media (max-width: 640px){.gridTemplateColumns-x15nfgh4.gridTemplateColumns-x15nfgh4{grid-template-columns:100%}}", 3200);
        _inject2(".gridTemplateColumns-x1mkdm3x{grid-template-columns:minmax(0,1fr)}", 3000);
        const complex = {
          0: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4",
          4: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x",
          2: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 boxSizing-x9f619 gridArea-x1yc5d2u",
          6: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x boxSizing-x9f619 gridArea-x1yc5d2u",
          1: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 gridArea-x1fdo2jl",
          5: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x gridArea-x1fdo2jl",
          3: "display-xrvj5dj gridTemplateColumns-x1rkzygb gridTemplateRows-x7k18q3 gridTemplateAreas-x17lh93j gridTemplateRows-xmr4b4k gridTemplateAreas-xesbpuc gridTemplateColumns-x15nfgh4 boxSizing-x9f619 gridArea-x1fdo2jl",
          7: "display-xrvj5dj gridTemplateRows-x7k18q3 gridTemplateAreas-x5gp9wm gridTemplateColumns-x1mkdm3x boxSizing-x9f619 gridArea-x1fdo2jl"
        }[!!(sidebar == null && !isSidebar) << 2 | !!isSidebar << 1 | !!isContent << 0];"
      `);
    });
  });
  describe('Accounts for edge-cases', () => {
    test('Using stylex() in a for loop', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          function test(colors, obj) {
            for (const color of colors) {
              obj[color.key] = stylex(color.style);
            }
          }
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        function test(colors, obj) {
          for (const color of colors) {
            obj[color.key] = stylex(color.style);
          }
        }"
      `);
    });
    test('Using stylex.props() in a for loop', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          function test(colors, obj) {
            for (const color of colors) {
              obj[color.key] = stylex.props(color.style);
            }
          }
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        function test(colors, obj) {
          for (const color of colors) {
            obj[color.key] = stylex.props(color.style);
          }
        }"
      `);
    });
    test('trying to use an unknown style in stylex()', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            tileHeading: {
              marginRight: 12,
            },
          });
          stylex(styles.unknown);
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".marginRight-x1wsuqlk{margin-right:12px}", 4000);
        const styles = {};
        stylex(styles.unknown);"
      `);
    });
    test('trying to use an unknown style in stylex.props()', () => {
      expect(
        transform(
          `
          import * as stylex from '@stylexjs/stylex';
          const styles = stylex.create({
            tileHeading: {
              marginRight: 12,
            },
          });
          stylex.props(styles.unknown);
        `,
          { dev: true, genConditionalClasses: true },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        var _inject2 = _inject;
        import * as stylex from '@stylexjs/stylex';
        _inject2(".marginRight-x1wsuqlk{margin-right:12px}", 4000);
        const styles = {};
        stylex.props(styles.unknown);"
      `);
    });
  });
});
