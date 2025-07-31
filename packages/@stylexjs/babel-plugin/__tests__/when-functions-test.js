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
              backgroundColor: {
                default: 'blue',
                [when.ancestor(':hover')]: 'red',
              },
            },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { when, create } from '@stylexjs/stylex';
        const styles = {
          container: {
            kWkggS: "x1t391ir x26ppzc",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1t391ir",
            {
              "ltr": ".x1t391ir{background-color:blue}",
              "rtl": null,
            },
            3000,
          ],
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

    test('when.siblingBefore function', () => {
      const { code, metadata } = transform(`
        import { when, create } from '@stylexjs/stylex';
        
        const styles = create({
          container: {
            backgroundColor: {
              default: 'blue',
              [when.siblingBefore(':focus')]: 'red',
            },
          },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { when, create } from '@stylexjs/stylex';
        const styles = {
          container: {
            kWkggS: "x1t391ir xeb64px",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1t391ir",
            {
              "ltr": ".x1t391ir{background-color:blue}",
              "rtl": null,
            },
            3000,
          ],
          [
            "xeb64px",
            {
              "ltr": ".xeb64px:where(.stylex-target:focus ~ *){background-color:red}",
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
            backgroundColor: {
              default: 'blue',
              [stylex.when.ancestor(':hover')]: 'red',
              [stylex.when.siblingBefore(':focus')]: 'green',
            },
          },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const styles = {
          container: {
            kWkggS: "x1t391ir x26ppzc xhhxj74",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1t391ir",
            {
              "ltr": ".x1t391ir{background-color:blue}",
              "rtl": null,
            },
            3000,
          ],
          [
            "x26ppzc",
            {
              "ltr": ".x26ppzc:where(.stylex-target:hover *){background-color:red}",
              "rtl": null,
            },
            3040,
          ],
          [
            "xhhxj74",
            {
              "ltr": ".xhhxj74:where(.stylex-target:focus ~ *){background-color:green}",
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
            backgroundColor: {
              default: 'blue',
              [w.ancestor(':hover')]: 'red',
              [w.siblingBefore(':focus')]: 'green',
            },
          },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { when as w, create } from '@stylexjs/stylex';
        const styles = {
          container: {
            kWkggS: "x1t391ir x26ppzc xhhxj74",
            $$css: true
          }
        };
        console.log(styles.container);"
      `);

      expect(metadata.stylex).toMatchInlineSnapshot(`
        [
          [
            "x1t391ir",
            {
              "ltr": ".x1t391ir{background-color:blue}",
              "rtl": null,
            },
            3000,
          ],
          [
            "x26ppzc",
            {
              "ltr": ".x26ppzc:where(.stylex-target:hover *){background-color:red}",
              "rtl": null,
            },
            3040,
          ],
          [
            "xhhxj74",
            {
              "ltr": ".xhhxj74:where(.stylex-target:focus ~ *){background-color:green}",
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
              backgroundColor: {
                default: 'blue',
                [when.ancestor('hover')]: 'red',
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
              backgroundColor: {
                default: 'blue',
                [when.ancestor('::before')]: 'red',
              },
            },
          });
        `),
      ).toThrow('Pseudo selector cannot start with "::"');
    });
  });
});
