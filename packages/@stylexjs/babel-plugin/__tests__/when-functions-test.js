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
  const result = transformSync(source, {
    filename: opts.filename ?? 'test.js',
    parserOpts: {
      flow: 'all',
    },
    babelrc: false,
    plugins: [[stylexPlugin, { ...opts }]],
  });

  return result;
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] when functions', () => {
    test('when.ancestor function', () => {
      const { code, metadata } = transform(`
        import { when, create } from '@stylexjs/stylex';
        
        const styles = create({
            container: {
            [when.ancestor(':hover')]: {
                backgroundColor: 'red',
            },
            },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { when, create } from '@stylexjs/stylex';
        const styles = {
          container: {
            ktED7Z: "x26ppzc",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x26ppzc",
            {
              "ltr": ".x26ppzc:where(.stylex-target:hover *){background-color:red}",
              "rtl": null,
            },
            3040,
          ],
        ]
      `);
    });

    test('when.prevSibling function', () => {
      const { code, metadata } = transform(`
        import { when, create } from '@stylexjs/stylex';
        
        const styles = create({
          container: {
            [when.prevSibling(':focus')]: {
              backgroundColor: 'blue',
            },
          },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { when, create } from '@stylexjs/stylex';
        const styles = {
          container: {
            kBya5t: "x16bwp6f",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x16bwp6f",
            {
              "ltr": ".x16bwp6f:where(.stylex-target:focus ~ *){background-color:blue}",
              "rtl": null,
            },
            3040,
          ],
        ]
      `);
    });

    test('namespace imports', () => {
      const { code, metadata } = transform(`
        import * as stylex from '@stylexjs/stylex';
        
        const styles = stylex.create({
          container: {
            [stylex.when.ancestor(':hover')]: {
              backgroundColor: 'red',
            },
            [stylex.when.prevSibling(':focus')]: {
              backgroundColor: 'blue',
            },
          },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const styles = {
          container: {
            ktED7Z: "x26ppzc",
            kBya5t: "x16bwp6f",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x26ppzc",
            {
              "ltr": ".x26ppzc:where(.stylex-target:hover *){background-color:red}",
              "rtl": null,
            },
            3040,
          ],
          [
            "x16bwp6f",
            {
              "ltr": ".x16bwp6f:where(.stylex-target:focus ~ *){background-color:blue}",
              "rtl": null,
            },
            3040,
          ],
        ]
      `);
    });

    test('aliased imports', () => {
      const { code, metadata } = transform(`
        import { when as w, create } from '@stylexjs/stylex';
        
        const styles = create({
          container: {
            [w.ancestor(':hover')]: {
              backgroundColor: 'red',
            },
            [w.prevSibling(':focus')]: {
              backgroundColor: 'blue',
            },
          },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { when as w, create } from '@stylexjs/stylex';
        const styles = {
          container: {
            ktED7Z: "x26ppzc",
            kBya5t: "x16bwp6f",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x26ppzc",
            {
              "ltr": ".x26ppzc:where(.stylex-target:hover *){background-color:red}",
              "rtl": null,
            },
            3040,
          ],
          [
            "x16bwp6f",
            {
              "ltr": ".x16bwp6f:where(.stylex-target:focus ~ *){background-color:blue}",
              "rtl": null,
            },
            3040,
          ],
        ]
      `);
    });
  });

  describe('[validation] when functions', () => {
    test('validates pseudo selector format', () => {
      expect(() =>
        transform(`
          import { when, create } from '@stylexjs/stylex';
          
          const styles = create({
            container: {
              [when.ancestor('hover')]: {
                backgroundColor: 'red',
              },
            },
          });
        `),
      ).toThrow('Pseudo selector must start with ":"');
    });

    test('rejects pseudo-elements', () => {
      expect(() =>
        transform(`
          import { when, create } from '@stylexjs/stylex';
          
          const styles = create({
            container: {
              [when.ancestor('::before')]: {
                backgroundColor: 'red',
              },
            },
          });
        `),
      ).toThrow('Pseudo selector cannot start with "::"');
    });
  });
});
