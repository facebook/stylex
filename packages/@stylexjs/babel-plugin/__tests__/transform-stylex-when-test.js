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
            kWkggS: "x1t391ir x148kuu",
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
            "x148kuu",
            {
              "ltr": ".x148kuu:where(.x-default-marker:hover *){background-color:red}",
              "rtl": null,
            },
            3011.3,
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
            kWkggS: "x1t391ir x1i6rnlt",
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
            "x1i6rnlt",
            {
              "ltr": ".x1i6rnlt:where(.x-default-marker:focus ~ *){background-color:red}",
              "rtl": null,
            },
            3031.5,
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
              [stylex.when.anySibling(':active')]: 'yellow',
              [stylex.when.siblingAfter(':focus')]: 'purple',
              [stylex.when.descendant(':focus')]: 'orange',
            },
          },
        });

        console.log(styles.container);
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const styles = {
          container: {
            kWkggS: "x1t391ir x148kuu xpijypl xoev4mv x1v1vkh3 x9zntq3",
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
            "x148kuu",
            {
              "ltr": ".x148kuu:where(.x-default-marker:hover *){background-color:red}",
              "rtl": null,
            },
            3011.3,
          ],
          [
            "xpijypl",
            {
              "ltr": ".xpijypl:where(.x-default-marker:focus ~ *){background-color:green}",
              "rtl": null,
            },
            3031.5,
          ],
          [
            "xoev4mv",
            {
              "ltr": ".xoev4mv:where(.x-default-marker:active ~ *, :has(~ .x-default-marker:active)){background-color:yellow}",
              "rtl": null,
            },
            3021.7,
          ],
          [
            "x1v1vkh3",
            {
              "ltr": ".x1v1vkh3:where(:has(~ .x-default-marker:focus)){background-color:purple}",
              "rtl": null,
            },
            3041.5,
          ],
          [
            "x9zntq3",
            {
              "ltr": ".x9zntq3:where(:has(.x-default-marker:focus)){background-color:orange}",
              "rtl": null,
            },
            3016.5,
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
            kWkggS: "x1t391ir x148kuu xpijypl",
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
            "x148kuu",
            {
              "ltr": ".x148kuu:where(.x-default-marker:hover *){background-color:red}",
              "rtl": null,
            },
            3011.3,
          ],
          [
            "xpijypl",
            {
              "ltr": ".xpijypl:where(.x-default-marker:focus ~ *){background-color:green}",
              "rtl": null,
            },
            3031.5,
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
  describe('[transform] using stylex.defaultMarker', () => {
    test('named import', () => {
      const { code } = transform(`
        import { defaultMarker, props } from '@stylexjs/stylex';
        
        const classNames = props(defaultMarker());
      `);

      expect(code).toMatchInlineSnapshot(`
        "import { defaultMarker, props } from '@stylexjs/stylex';
        const classNames = props({
          "x-default-marker": "x-default-marker",
          $$css: true
        });"
      `);
    });
    test('namespace import', () => {
      const { code } = transform(`
        import * as stylex from '@stylexjs/stylex';
        
        const classNames = stylex.props(stylex.defaultMarker());
      `);

      expect(code).toMatchInlineSnapshot(`
        "import * as stylex from '@stylexjs/stylex';
        const classNames = stylex.props({
          "x-default-marker": "x-default-marker",
          $$css: true
        });"
      `);
    });
  });
});
