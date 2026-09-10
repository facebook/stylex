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
      'stylex.defineEnum(["one", "two"], {"@media print": "one"})',
      'top-level default',
    ],
    [
      'stylex.defineEnum(["one", "two"], {default: "one", ":hover": "two"})',
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

  test('rejects conditional overrides until supported', () => {
    expect(() =>
      transform(`
        ${definition} export const p = stylex.props(
          density({
            default: 'compact',
            ':hover': 'comfortable',
          }),
        );
      `),
    ).toThrow('static string or boolean');
  });

  test('rejects overrides in create', () => {
    expect(() =>
      transform(`
        ${definition} export const s = stylex.create({
          root: {
            ...density('compact'),
          },
        });
      `),
    ).toThrow('within stylex.create');
  });

  test('rejects incomplete local matches', () => {
    expect(() =>
      transform(`
        ${definition} export const s = stylex.create({
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
