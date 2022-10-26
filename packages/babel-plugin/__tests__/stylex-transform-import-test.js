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

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] stylex imports', () => {
    test('ignores valid imports', () => {
      expect(
        transform(`
          import stylex from 'stylex';
          import {foo, bar} from 'other';
        `)
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
        `)
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        export const styles = {
          foo: {
            color: "x1e2nbdu"
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
        `)
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        const styles = {
          foo: {
            color: "x1e2nbdu"
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        export default {
          foo: {
            color: "x1e2nbdu"
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
        `)
      ).toMatchInlineSnapshot(`
        "import stylex from 'stylex';
        stylex.inject(".x1e2nbdu{color:red}", 1);
        const styles = {
          foo: {
            color: "x1e2nbdu"
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
        `)
      ).toMatchInlineSnapshot(`
        "import foobar from 'stylex';
        foobar.inject(".xrkmrrc{background-color:red}", 1);
        foobar.inject(".xju2f9n{color:blue}", 1);
        foobar.inject(".x123j3cw{padding-top:5px}", 1);
        foobar.inject(".x1mpkggp{padding-right:5px}", 1, ".x1mpkggp{padding-left:5px}");
        foobar.inject(".xs9asl8{padding-bottom:5px}", 1);
        foobar.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            paddingTop: "x123j3cw",
            paddingEnd: "x1mpkggp",
            paddingBottom: "xs9asl8",
            paddingStart: "x1t2a60a"
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
        `)
      ).toMatchInlineSnapshot(`
        "import * as foobar from 'stylex';
        foobar.inject(".xrkmrrc{background-color:red}", 1);
        foobar.inject(".xju2f9n{color:blue}", 1);
        foobar.inject(".x123j3cw{padding-top:5px}", 1);
        foobar.inject(".x1mpkggp{padding-right:5px}", 1, ".x1mpkggp{padding-left:5px}");
        foobar.inject(".xs9asl8{padding-bottom:5px}", 1);
        foobar.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            paddingTop: "x123j3cw",
            paddingEnd: "x1mpkggp",
            paddingBottom: "xs9asl8",
            paddingStart: "x1t2a60a"
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
        `)
      ).toMatchInlineSnapshot(`
        "import { create } from 'stylex';
        import __stylex__ from "stylex";
        __stylex__.inject(".xrkmrrc{background-color:red}", 1);
        __stylex__.inject(".xju2f9n{color:blue}", 1);
        __stylex__.inject(".x123j3cw{padding-top:5px}", 1);
        __stylex__.inject(".x1mpkggp{padding-right:5px}", 1, ".x1mpkggp{padding-left:5px}");
        __stylex__.inject(".xs9asl8{padding-bottom:5px}", 1);
        __stylex__.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            paddingTop: "x123j3cw",
            paddingEnd: "x1mpkggp",
            paddingBottom: "xs9asl8",
            paddingStart: "x1t2a60a"
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
        `)
      ).toMatchInlineSnapshot(`
        "import { create as css } from 'stylex';
        import __stylex__ from "stylex";
        __stylex__.inject(".xrkmrrc{background-color:red}", 1);
        __stylex__.inject(".xju2f9n{color:blue}", 1);
        __stylex__.inject(".x123j3cw{padding-top:5px}", 1);
        __stylex__.inject(".x1mpkggp{padding-right:5px}", 1, ".x1mpkggp{padding-left:5px}");
        __stylex__.inject(".xs9asl8{padding-bottom:5px}", 1);
        __stylex__.inject(".x1t2a60a{padding-left:5px}", 1, ".x1t2a60a{padding-right:5px}");
        const styles = {
          default: {
            backgroundColor: "xrkmrrc",
            color: "xju2f9n",
            paddingTop: "x123j3cw",
            paddingEnd: "x1mpkggp",
            paddingBottom: "xs9asl8",
            paddingStart: "x1t2a60a"
          }
        };
        styles;"
      `);
    });
  });
});
