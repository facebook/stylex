/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const stylexPlugin = require('../src/index');

function transform(source, opts = {}) {
  return transformSync(source, {
    filename: opts.filename,
    parserOpts: {
      flow: 'all',
    },
    plugins: [[stylexPlugin, { runtimeInjection: true, ...opts }]],
  }).code;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex imports', () => {
    test('ignores valid imports', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          import {foo, bar} from 'other';
        `),
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        import { foo, bar } from 'other';"
      `);
    });

    test('ignores valid requires', () => {
      expect(
        transform(`
          const stylex = require('stylex');
          const {foo, bar} = require('other');
        `),
      ).toMatchInlineSnapshot(`
        "const stylex = require('stylex');
        const {
          foo,
          bar
        } = require('other');"
      `);
    });

    test('named declaration export', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export const styles = stylex.create({
            foo: {
              color: 'red'
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        export const styles = {
          foo: {
            color: "x1e2nbdu",
            $$css: true
          }
        };"
      `);
    });

    test('Does nothing when stylex not imported', () => {
      expect(
        transform(`
          export const styles = stylex.create({
            foo: {
              color: 'red'
            },
          });
        `),
      ).toMatchInlineSnapshot(`
        "export const styles = stylex.create({
          foo: {
            color: 'red'
          }
        });"
      `);
    });

    test('named property export', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              color: 'red'
            },
          });
          export {styles}
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        const styles = {
          foo: {
            color: "x1e2nbdu",
            $$css: true
          }
        };
        export { styles };"
      `);
    });

    test('default export', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          export default (stylex.create({
            foo: {
              color: 'red'
            },
          }));
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        export default {
          foo: {
            color: "x1e2nbdu",
            $$css: true
          }
        };"
      `);
    });

    test('module.export', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          const styles = stylex.create({
            foo: {
              color: 'red'
            },
          });
          module.export = styles;
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'stylex';
        var _inject2 = _inject;
        _inject2(".x1e2nbdu{color:red}", 3000);
        const styles = {
          foo: {
            color: "x1e2nbdu",
            $$css: true
          }
        };
        module.export = styles;"
      `);
    });
  });

  describe('[transform] import aliases', () => {
    test('can import with a different name ', () => {
      expect(
        transform(`
          import foobar from 'stylex';

          const styles = foobar.create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
              padding: 5
            }
          });
          styles;
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import foobar from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);
        _inject2(".x14odnwx{padding:5px}", 1000);
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            padding: "x14odnwx",
            paddingInline: null,
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingBlock: null,
            paddingTop: null,
            paddingBottom: null,
            $$css: true
          }
        };
        styles;"
      `);
    });

    test('can import wildcard', () => {
      expect(
        transform(`
          import * as foobar from 'stylex';

          const styles = foobar.create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
              padding: 5
            }
          });
          styles;
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import * as foobar from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);
        _inject2(".x14odnwx{padding:5px}", 1000);
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            padding: "x14odnwx",
            paddingInline: null,
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingBlock: null,
            paddingTop: null,
            paddingBottom: null,
            $$css: true
          }
        };
        styles;"
      `);
    });

    test('can import just {create}', () => {
      expect(
        transform(`
          import {create} from 'stylex';

          const styles = create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
              padding: 5
            }
          });
          styles;
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import { create } from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);
        _inject2(".x14odnwx{padding:5px}", 1000);
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            padding: "x14odnwx",
            paddingInline: null,
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingBlock: null,
            paddingTop: null,
            paddingBottom: null,
            $$css: true
          }
        };
        styles;"
      `);
    });

    test('can import just {create} with alias', () => {
      expect(
        transform(`
          import {create as css} from 'stylex';

          const styles = css({
            default: {
              backgroundColor: 'red',
              color: 'blue',
              padding: 5
            }
          });
          styles;
        `),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import { create as css } from 'stylex';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);
        _inject2(".x14odnwx{padding:5px}", 1000);
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            padding: "x14odnwx",
            paddingInline: null,
            paddingStart: null,
            paddingLeft: null,
            paddingEnd: null,
            paddingRight: null,
            paddingBlock: null,
            paddingTop: null,
            paddingBottom: null,
            $$css: true
          }
        };
        styles;"
      `);
    });
  });

  describe('[transform] With custom imports', () => {
    test('Handles custom default imports', () => {
      expect(
        transform(
          `
          import stylex from 'foo-bar';
          const styles = stylex.create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `,
          { importSources: ['foo-bar'] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import stylex from 'foo-bar';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
      `);
    });

    test('Handles custom * as imports', () => {
      expect(
        transform(
          `
          import * as stylex from 'foo-bar';
          const styles = stylex.create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `,
          { importSources: ['foo-bar'] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import * as stylex from 'foo-bar';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
      `);
    });

    test('Handles custom named imports', () => {
      expect(
        transform(
          `
          import {css} from 'react-strict-dom';
          const styles = css.create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `,
          { importSources: [{ from: 'react-strict-dom', as: 'css' }] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import { css } from 'react-strict-dom';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
      `);
    });

    test('Handles custom named imports with other named imports', () => {
      expect(
        transform(
          `
          import {html, css} from 'react-strict-dom';
          const styles = css.create({
            default: {
              backgroundColor: 'red',
              color: 'blue',
            }
          });
        `,
          { importSources: [{ from: 'react-strict-dom', as: 'css' }] },
        ),
      ).toMatchInlineSnapshot(`
        "import _inject from "@stylexjs/stylex/lib/stylex-inject";
        import { html, css } from 'react-strict-dom';
        var _inject2 = _inject;
        _inject2(".xrkmrrc{background-color:red}", 3000);
        _inject2(".xju2f9n{color:blue}", 3000);"
      `);
    });
  });
});
