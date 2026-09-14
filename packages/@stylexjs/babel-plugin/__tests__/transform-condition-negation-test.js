/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { transformSync } from '@babel/core';
import plugin from '../src/index';

function compile(value, enableMediaQueryOrder = true) {
  const result = transformSync(
    `
        import * as stylex from '@stylexjs/stylex';

        export const styles = stylex.create({
          root: ${value},
        });
      `,
    {
      filename: '/stylex/conditions.js',
      babelrc: false,
      plugins: [
        [
          plugin,
          {
            enableMediaQueryOrder,
          },
        ],
      ],
    },
  );
  return {
    code: result.code,
    css: plugin.processStylexRules(result.metadata.stylex),
  };
}

describe('regular condition negation', () => {
  test('preserves ordinary hover and active selectors', () => {
    const value = `
      {
        color: {
          default: 'black',
          ':hover': 'red',
          ':active': 'blue',
        },
      }
    `;

    const { code, css } = compile(value);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const styles = {
        root: {
          kMwMTN: "x1mqxbix x1dgwipm x4oye9d",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ".x1mqxbix{color:black}
      .x1dgwipm:hover{color:red}
      .x4oye9d:active{color:blue}"
    `);
  });

  test('keeps screen and print rules separate', () => {
    const value = `
      {
        color: {
          default: 'black',
          '@media screen and (min-width: 400px)': 'red',
          '@media print': 'blue',
        },
      }
    `;

    const { code, css } = compile(value);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const styles = {
        root: {
          kMwMTN: "x1mqxbix xaxw0yw xux6igo",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ".x1mqxbix{color:black}
      @media screen and (min-width: 400px){.xaxw0yw.xaxw0yw{color:red}}
      @media print{.xux6igo.xux6igo{color:blue}}"
    `);
  });

  test('preserves an earlier fallback below a nested height query', () => {
    const value = `
      {
        color: {
          '@media (min-width: 400px)': 'red',
          '@media (min-width: 600px)': {
            '@media (min-height: 500px)': 'blue',
          },
        },
      }
    `;

    const { code, css } = compile(value);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const styles = {
        root: {
          kMwMTN: "x1neppwc x1wf3puc",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      "@media (min-width: 400px) and (max-width: 599.99px), (min-width: 400px) and (max-height: 499.99px){.x1neppwc.x1neppwc{color:red}}
      @media (min-width: 600px){@media (min-height: 500px){.x1wf3puc.x1wf3puc.x1wf3puc{color:blue}}}"
    `);
  });

  test('excludes a later supports condition', () => {
    const value = `
      {
        color: {
          '@supports (display: grid)': 'red',
          '@supports (display: flex)': 'blue',
        },
      }
    `;

    const { code, css } = compile(value);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const styles = {
        root: {
          kMwMTN: "x18ty137 x6o6ul9",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      "@supports (display: flex){.x6o6ul9.x6o6ul9{color:blue}}
      @supports (display: grid) and (not (display: flex)){.x18ty137.x18ty137{color:red}}"
    `);
  });

  test('negates an entire media query list', () => {
    const value = `
      {
        color: {
          '@media (min-width: 400px)': 'red',
          '@media screen, (max-width: 300px)': 'blue',
        },
      }
    `;

    const { code, css } = compile(value);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const styles = {
        root: {
          kMwMTN: "x13jh3vm xs03wd3",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      "@media screen, (max-width: 300px){.xs03wd3.xs03wd3{color:blue}}
      @media not screen{@media (min-width: 400px){.x13jh3vm.x13jh3vm.x13jh3vm{color:red}}}"
    `);
  });

  test('preserves dynamic values under supports conditions', () => {
    const value = `
      (a, b) => ({
        color: {
          '@supports (display: grid)': a,
          '@supports (display: flex)': b,
        },
      })
    `;

    const { code, css } = compile(value);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const styles = {
        root: (a, b) => [{
          kMwMTN: (a != null ? "x14v20to " : a) + (b != null ? "x1lcug7j" : b),
          $$css: true
        }, {
          "--x-1yjswgp": a != null ? a : undefined,
          "--x-42hr97": b != null ? b : undefined
        }]
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      "@property --x-1yjswgp { syntax: "*"; inherits: false;}
      @property --x-42hr97 { syntax: "*"; inherits: false;}
      @supports (display: grid) and (not (display: flex)){.x14v20to.x14v20to:not(#\\#){color:var(--x-1yjswgp)}}
      @supports (display: flex){.x1lcug7j.x1lcug7j:not(#\\#){color:var(--x-42hr97)}}"
    `);
  });

  test('the existing option still disables normal exclusions', () => {
    const { code, css } = compile(
      `{
        color: {
          '@media (min-width: 400px)': 'red',
          '@media (min-width: 600px)': 'blue',
        },
      }`,
      false,
    );

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const styles = {
        root: {
          kMwMTN: "x4n3lfc x1cmrb8e",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      "@media (min-width: 400px){.x4n3lfc.x4n3lfc{color:red}}
      @media (min-width: 600px){.x1cmrb8e.x1cmrb8e{color:blue}}"
    `);
  });

  test('normalized conditions preserve dynamic null checks', () => {
    const { code } = compile(
      `(a, b) => ({
        color: {
          '@supports (display: grid)': a,
          '@supports (display: flex)': b,
        },
      })`,
    );

    expect(code).toContain('a != null');
    expect(code).toContain('b != null');
  });
});
