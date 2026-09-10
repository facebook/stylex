/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function transform(source, options = {}) {
  const { code, metadata } = transformSync(source, {
    filename: '/stylex/tokens.stylex.js',
    babelrc: false,
    plugins: [
      [
        stylexPlugin,
        {
          unstable_moduleResolution: {
            type: 'haste',
          },
          ...options,
        },
      ],
    ],
  });
  return {
    code,
    css: stylexPlugin.processStylexRules(metadata.stylex),
  };
}

const definition = `
  import * as stylex from '@stylexjs/stylex';

  export const density = stylex.defineEnum(
    ['compact', 'comfortable'],
    'comfortable',
  );
`;

describe('CSS enums', () => {
  test('definition emits only a variable map, reset class, and root default', () => {
    const { code, css } = transform(definition);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };"
    `);

    expect(css).toMatchInlineSnapshot(
      '":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}"',
    );
  });

  test('initial at-rules and optional nested defaults', () => {
    const { code, css } = transform(`
      import { defineEnum } from '@stylexjs/stylex';

      export const dark = defineEnum([true, false], {
        default: false,
        '@media (prefers-color-scheme: dark)': true,
        '@supports (display: grid)': {
          '@media print': false,
        },
      });
    `);

    expect(code).toMatchInlineSnapshot(`
      "import { defineEnum } from '@stylexjs/stylex';
      export const dark = {
        true: "var(--xpvlfw4-x29cgs)",
        false: "var(--xpvlfw4-1cispiw)"
      };"
    `);

    expect(css).toMatchInlineSnapshot(
      '":where(.xpvlfw4){--xpvlfw4-x29cgs: ;--xpvlfw4-1cispiw: ;}:root:not(.xpvlfw4){--xpvlfw4-x29cgs: ;--xpvlfw4-1cispiw:initial;}@media (prefers-color-scheme: dark){:root:not(.xpvlfw4){--xpvlfw4-x29cgs:initial;--xpvlfw4-1cispiw: ;}}@supports (display: grid){@media print{:root:not(.xpvlfw4){--xpvlfw4-x29cgs: ;--xpvlfw4-1cispiw:initial;}}}"',
    );
  });

  test('scalar assignments compose under one key', () => {
    const { code, css } = transform(`
      ${definition}
      export const props = stylex.props(
        density('compact'),
        density('comfortable'),
      );
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      export const props = {
        className: "xnp2bkv xgqg98k"
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .xgqg98k{--xnp2bkv-1vrmicz:initial}
      .x1jbanbc{--xnp2bkv-j7rcqr:initial}"
    `);
  });

  test('imports compile without accessing the defining module', () => {
    const { code, css } = transform(`
      import * as stylex from '@stylexjs/stylex';
      import { density as mode } from './missing.stylex';

      export const props = stylex.props(mode('compact'));
      export const styles = stylex.create({
        root: {
          padding: stylex.match(mode, {
            compact: 8,
            comfortable: 16,
          }),
          opacity: stylex.match(mode, {
            compact: 0.5,
            comfortable: 1,
          }),
        },
      });
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      import { density as mode } from './missing.stylex';
      export const props = {
        className: "x1cu84p2 x1ox45mc"
      };
      export const styles = {
        root: {
          kmVPX3: "xo6kdcq",
          kSiTet: "x1w0en5j",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ".x1ox45mc{--x1cu84p2-j7rcqr:initial}
      .xo6kdcq:not(#\\#){padding:var(--x1cu84p2-j7rcqr,8px) var(--x1cu84p2-1vrmicz,16px)}
      .x1w0en5j:not(#\\#):not(#\\#){opacity:var(--x1cu84p2-j7rcqr,.5) var(--x1cu84p2-1vrmicz,1)}"
    `);
  });

  test('property normalization and nested matches: property-specificity', () => {
    const styleResolution = 'property-specificity';
    const { code, css } = transform(
      `
        ${definition}
        export const styles = stylex.create({
          root: {
            padding: stylex.match(density, {
              compact: '8px 12px',
              comfortable: 16,
            }),
            color: {
              default: stylex.match(density, {
                compact: 'red',
                comfortable: 'blue',
              }),
              ':hover': 'green',
            },
          },
        });
      `,
      {
        styleResolution,
      },
    );

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      export const styles = {
        root: {
          kmVPX3: "xr3iirk",
          kMwMTN: "xufbky4 x1ehdwse",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .xr3iirk:not(#\\#){padding:var(--xnp2bkv-j7rcqr,8px 12px) var(--xnp2bkv-1vrmicz,16px)}
      .xufbky4:not(#\\#):not(#\\#){color:var(--xnp2bkv-j7rcqr,red) var(--xnp2bkv-1vrmicz,blue)}
      .x1ehdwse:hover:not(#\\#):not(#\\#){color:green}"
    `);
  });

  test('property normalization and nested matches: legacy-expand-shorthands', () => {
    const styleResolution = 'legacy-expand-shorthands';
    const { code, css } = transform(
      `
        ${definition}
        export const styles = stylex.create({
          root: {
            padding: stylex.match(density, {
              compact: '8px 12px',
              comfortable: 16,
            }),
            color: {
              default: stylex.match(density, {
                compact: 'red',
                comfortable: 'blue',
              }),
              ':hover': 'green',
            },
          },
        });
      `,
      {
        styleResolution,
      },
    );

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      export const styles = {
        root: {
          kLKAdn: "xdl6go4",
          kwRFfy: "x1k3jt8k",
          kGO01o: "x1ucj9h1",
          kZCmMZ: "xan7klt",
          kMwMTN: "xufbky4 x1ehdwse",
          $$css: true
        }
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .xufbky4:not(#\\#){color:var(--xnp2bkv-j7rcqr,red) var(--xnp2bkv-1vrmicz,blue)}
      .x1k3jt8k:not(#\\#){padding-inline-end:var(--xnp2bkv-j7rcqr,12px) var(--xnp2bkv-1vrmicz,16px)}
      .xan7klt:not(#\\#){padding-inline-start:var(--xnp2bkv-j7rcqr,12px) var(--xnp2bkv-1vrmicz,16px)}
      .x1ehdwse:hover:not(#\\#){color:green}
      .x1ucj9h1:not(#\\#):not(#\\#){padding-bottom:var(--xnp2bkv-j7rcqr,8px) var(--xnp2bkv-1vrmicz,16px)}
      .xdl6go4:not(#\\#):not(#\\#){padding-top:var(--xnp2bkv-j7rcqr,8px) var(--xnp2bkv-1vrmicz,16px)}"
    `);
  });

  test.each([
    ['stylex.defineEnum(["one"], "one")', 'at least two'],
    ['stylex.defineEnum(["one", "one"], "one")', 'distinct'],
    ['stylex.defineEnum(["one", "two"], "three")', 'Unknown enum state'],
    [
      `
        stylex.defineEnum(['one', 'two'], {
          '@media print': 'one',
        })
      `,
      'top-level default',
    ],
    [
      `
        stylex.defineEnum(['one', 'two'], {
          default: 'one',
          ':hover': 'two',
        })
      `,
      'only support',
    ],
  ])('rejects invalid definition %s', (expression, error) => {
    expect(() =>
      transform(`
        import * as stylex from '@stylexjs/stylex';

        export const e = ${expression};
      `),
    ).toThrow(error);
  });

  test('conditional overrides always use enum exclusions', () => {
    const source = `
      ${definition}

      export const p = stylex.props(
        density({
          default: 'comfortable',
          ':hover': 'compact',
          ':active': 'comfortable',
        }),
      );
    `;

    const { code, css } = transform(source);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      export const p = {
        className: "xnp2bkv xhbwk7l"
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .xhbwk7l{--xnp2bkv-1vrmicz:initial;}.xhbwk7l:where(:hover):not(:where(:active)){--xnp2bkv-1vrmicz: ;--xnp2bkv-j7rcqr:initial;}.xhbwk7l:where(:active){--xnp2bkv-1vrmicz:initial;}"
    `);

    expect(
      transform(source, {
        enableMediaQueryOrder: false,
      }),
    ).toEqual(
      transform(source, {
        enableMediaQueryOrder: true,
      }),
    );
  });

  test('spreads compile and compose as one assignment', () => {
    const { code, css } = transform(`
      ${definition}
      export const s = stylex.create({
        root: {
          ...density({
            default: 'comfortable',
            '@media (min-width: 600px)': 'compact',
          }),
          padding: stylex.match(density, {
            compact: 8,
            comfortable: 16,
          }),
        },
      });
      export const p = stylex.props(s.root, density('comfortable'));
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      export const s = {
        root: {
          kmVPX3: "x34amvd",
          xnp2bkv: "xnp2bkv x1thmjyw",
          $$css: true
        }
      };
      export const p = {
        className: "x34amvd xnp2bkv xgqg98k"
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .x1thmjyw{--xnp2bkv-1vrmicz:initial;}@media (min-width: 600px){.x1thmjyw{--xnp2bkv-1vrmicz: ;--xnp2bkv-j7rcqr:initial;}}
      .xgqg98k{--xnp2bkv-1vrmicz:initial}
      .x34amvd:not(#\\#){padding:var(--xnp2bkv-j7rcqr,8px) var(--xnp2bkv-1vrmicz,16px)}"
    `);
  });

  test('imported conditional assignments do not read the enum definition', () => {
    const { code, css } = transform(`
      import * as stylex from '@stylexjs/stylex';
      import { density } from './missing.stylex';

      export const s = stylex.create({
        root: {
          ...density({
            default: 'comfortable',
            ':hover': 'compact',
            ':active': 'spacious',
          }),
        },
      });
      export const p = stylex.attrs(s.root);
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      import { density } from './missing.stylex';
      export const s = {
        root: {
          x1cu84p2: "x1cu84p2 xudiitg",
          $$css: true
        }
      };
      export const p = {
        class: "x1cu84p2 xudiitg"
      };"
    `);

    expect(css).toMatchInlineSnapshot(
      '".xudiitg{--x1cu84p2-1vrmicz:initial;}.xudiitg:where(:hover):not(:where(:active)){--x1cu84p2-1vrmicz: ;--x1cu84p2-j7rcqr:initial;}.xudiitg:where(:active){--x1cu84p2-1vrmicz: ;--x1cu84p2-9i82b9:initial;}"',
    );
  });

  test('only the outer conditional object needs a default', () => {
    const { code, css } = transform(`
      ${definition}

      export const p = stylex.props(
        density({
          default: 'comfortable',
          '@media (min-width: 400px)': {
            ':hover': 'compact',
          },
          '@container card (min-width: 600px)': {
            '@supports (display: grid)': 'compact',
          },
        }),
      );
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      export const p = {
        className: "xnp2bkv x12evmn8"
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .x12evmn8{--xnp2bkv-1vrmicz:initial;}@media (min-width: 400px){.x12evmn8:where(:hover){--xnp2bkv-1vrmicz: ;--xnp2bkv-j7rcqr:initial;}}@container card (min-width: 600px){@supports (display: grid){.x12evmn8{--xnp2bkv-1vrmicz: ;--xnp2bkv-j7rcqr:initial;}}}"
    `);
  });

  test('local boolean enum with conditional assignment', () => {
    const { code, css } = transform(`
      import * as stylex from '@stylexjs/stylex';

      export const expanded = stylex.defineEnum([true, false], false);
      export const p = stylex.props(
        expanded({
          default: false,
          ':hover': true,
          ':active': false,
        }),
      );
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const expanded = {
        true: "var(--x1ouhys6-x29cgs)",
        false: "var(--x1ouhys6-1cispiw)"
      };
      export const p = {
        className: "x1ouhys6 x1cd27uj"
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.x1ouhys6){--x1ouhys6-x29cgs: ;--x1ouhys6-1cispiw: ;}:root:not(.x1ouhys6){--x1ouhys6-x29cgs: ;--x1ouhys6-1cispiw:initial;}
      .x1cd27uj{--x1ouhys6-1cispiw:initial;}.x1cd27uj:where(:hover):not(:where(:active)){--x1ouhys6-1cispiw: ;--x1ouhys6-x29cgs:initial;}.x1cd27uj:where(:active){--x1ouhys6-1cispiw:initial;}"
    `);
  });

  test('compound and functional pseudo-class guards', () => {
    const { code, css } = transform(`
      ${definition}

      export const p = stylex.props(
        density({
          default: 'comfortable',
          ':hover:focus': 'compact',
          ':not(:disabled)': 'comfortable',
        }),
      );
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      export const p = {
        className: "xnp2bkv xd6f6rg"
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      ":where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .xd6f6rg{--xnp2bkv-1vrmicz:initial;}.xd6f6rg:where(:not(:disabled)):not(:where(:hover:focus)){--xnp2bkv-1vrmicz:initial;}.xd6f6rg:where(:hover:focus){--xnp2bkv-1vrmicz: ;--xnp2bkv-j7rcqr:initial;}"
    `);
  });

  test('a scalar assignment spread can be part of a dynamic style', () => {
    const { code, css } = transform(`
      ${definition}

      export const s = stylex.create({
        root: (opacity) => ({
          ...density('compact'),
          opacity,
        }),
      });
    `);

    expect(code).toMatchInlineSnapshot(`
      "import * as stylex from '@stylexjs/stylex';
      export const density = {
        compact: "var(--xnp2bkv-j7rcqr)",
        comfortable: "var(--xnp2bkv-1vrmicz)"
      };
      const _temp = {
        xnp2bkv: "xnp2bkv " + "x1jbanbc",
        "$$css": true
      };
      export const s = {
        root: opacity => [_temp, {
          kSiTet: opacity != null ? "xb4nw82" : opacity,
          $$css: true
        }, {
          "--x-opacity": opacity != null ? opacity : undefined
        }]
      };"
    `);

    expect(css).toMatchInlineSnapshot(`
      "@property --x-opacity { syntax: "*"; inherits: false;}
      :where(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz: ;}:root:not(.xnp2bkv){--xnp2bkv-j7rcqr: ;--xnp2bkv-1vrmicz:initial;}
      .x1jbanbc{--xnp2bkv-j7rcqr:initial}
      .xb4nw82:not(#\\#){opacity:var(--x-opacity)}"
    `);
  });

  test.each([
    [
      `
        {
          ':hover': 'compact',
        }
      `,
      'top-level default',
    ],
    [
      `
        {
          default: {
            default: 'compact',
          },
        }
      `,
      'static string or boolean',
    ],
    [
      `
        {
          default: 'compact',
          ':hover': 'unknown',
        }
      `,
      'Unknown enum state',
    ],
    [
      `
        {
          default: 'compact',
          '@layer base': 'comfortable',
        }
      `,
      'Unsupported conditional',
    ],
    [
      `
        {
          default: 'compact',
          'var(--constant)': 'comfortable',
        }
      `,
      'defineConsts',
    ],
    [
      `
        {
          default: 'compact',
          '@media var(--constant)': 'comfortable',
        }
      `,
      'defineConsts',
    ],
    [
      `
        {
          default: 'compact',
          '::before': 'comfortable',
        }
      `,
      'pseudo-elements',
    ],
    [
      `
        {
          default: 'compact',
          ':visited': 'comfortable',
        }
      `,
      ':visited',
    ],
    [
      `
        {
          default: 'compact',
          ':hover div': 'comfortable',
        }
      `,
      'current element',
    ],
    [
      `
        {
          default: 'compact',
          ':not(:hover': 'comfortable',
        }
      `,
      'Unbalanced',
    ],
    [
      `
        {
          default: 'compact',
          ':hover': {
            ':hover': 'comfortable',
          },
        }
      `,
      'repeated',
    ],
    ["['compact']", 'static string or boolean'],
  ])('rejects invalid conditional override %s', (value, error) => {
    expect(() =>
      transform(`
        ${definition}

        export const p = stylex.props(
          density(${value}),
        );
      `),
    ).toThrow(error);
  });

  test('rejects incomplete local matches', () => {
    expect(() =>
      transform(`
        ${definition}

        export const s = stylex.create({
          root: {
            color: stylex.match(density, {
              compact: 'red',
              extra: 'blue',
            }),
          },
        });
      `),
    ).toThrow('exactly every enum state');
  });
});
