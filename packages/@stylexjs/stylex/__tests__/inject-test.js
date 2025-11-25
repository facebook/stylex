/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import inject from '../src/inject';

describe('inject', () => {
  test('@keyframes', () => {
    const cssText =
      '@keyframes name { from: { color: red }, to: { color: blue } }';
    expect(inject(cssText, 10)).toMatchInlineSnapshot(
      '"@keyframes name { from: { color: red }, to: { color: blue } }"',
    );
  });

  test('@positionTry', () => {
    const cssText =
      '@position-try --name { top: anchor(bottom); left: anchor(left); }';
    expect(inject(cssText, 10)).toMatchInlineSnapshot(
      '"@position-try --name { top: anchor(bottom); left: anchor(left); }"',
    );
  });

  test('::view-transition', () => {
    const cssText =
      '::view-transition-group(*.name){transition-property:none;}::view-transition-image-pair(*.name){border-radius:16px;}::view-transition-old(*.name){animation-duration:.5s;}::view-transition-new(*.name){animation-timing-function:ease-out;}';
    expect(inject(cssText, 10)).toMatchInlineSnapshot(
      '"::view-transition-group(*.name){transition-property:none;}::view-transition-image-pair(*.name){border-radius:16px;}::view-transition-old(*.name){animation-duration:.5s;}::view-transition-new(*.name){animation-timing-function:ease-out;}"',
    );
  });

  test('@media', () => {
    const cssText = '@media (min-width: 320px) { .color { color: red } }';
    expect(inject(cssText, 200)).toMatchInlineSnapshot(
      '"@media (min-width: 320px) { .color { color: red } }"',
    );
  });

  test('::before', () => {
    const cssText = '.color::before { color: red }';
    expect(inject(cssText, 5000)).toMatchInlineSnapshot(
      '".color:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#)::before { color: red }"',
    );
  });

  test(':hover', () => {
    const cssText = '.color:hover { color: red }';
    expect(inject(cssText, 130)).toMatchInlineSnapshot(
      '".color:hover { color: red }"',
    );
  });

  test('::before:hover', () => {
    const cssText = '.color::before:hover { color: red }';
    expect(inject(cssText, 5000)).toMatchInlineSnapshot(
      '".color:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#)::before:hover { color: red }"',
    );
  });

  describe('defineConsts runtime injection', () => {
    test('registers a constant', () => {
      const result = inject('', 0, 'x1abc123', 'rebeccapurple');
      expect(result).toBe('');
    });

    test('inlines constant in CSS rule', () => {
      inject('', 0, 'x2def456', 'blue');

      const cssText = '.test { color: var(--x2def456) }';
      const result = inject(cssText, 3000);

      expect(result).toMatchInlineSnapshot(
        '".test:not(#\\#):not(#\\#):not(#\\#){ color: blue }"',
      );
    });

    test('inlines multiple constants in one rule', () => {
      inject('', 0, 'xcolor1', 'red');
      inject('', 0, 'xcolor2', 'green');

      const cssText =
        '.multi { color: var(--xcolor1); background-color: var(--xcolor2) }';
      const result = inject(cssText, 3000);

      expect(result).toMatchInlineSnapshot(
        '".multi:not(#\\#):not(#\\#):not(#\\#){ color: red; background-color: green }"',
      );
    });

    test('handles numeric constants', () => {
      inject('', 0, 'xnum123', 10);

      const cssText = '.numeric { padding: var(--xnum123) }';
      const result = inject(cssText, 1000);

      expect(result).toMatchInlineSnapshot(
        '".numeric:not(#\\#){ padding: 10 }"',
      );
    });

    test('leaves unreferenced constants unchanged in CSS', () => {
      inject('', 0, 'xunused', 'purple');

      const cssText = '.normal { color: orange }';
      const result = inject(cssText, 3000);

      expect(result).toMatchInlineSnapshot(
        '".normal:not(#\\#):not(#\\#):not(#\\#){ color: orange }"',
      );
    });

    test('handles constants in media queries', () => {
      inject('', 0, 'xbp768', '@media (min-width: 768px)');

      const cssText = 'var(--xbp768){.xbs0o1n.xbs0o1n{color:blue}}';
      const result = inject(cssText, 6000);

      expect(result).toMatchInlineSnapshot(
        '"@media (min-width: 768px){.xbs0o1n.xbs0o1n:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#){color:blue}}"',
      );
    });

    test('handles nested at-rules with constants', () => {
      inject('', 0, 'xbig', '@media (min-width: 1024px)');
      inject('', 0, 'xsmall', '@media (min-width: 768px)');

      const cssText =
        'var(--xsmall){var(--xbig){.xrf68et.xrf68et.xrf68et{color:red}}}';
      const result = inject(cssText, 9000);

      expect(result).toMatchInlineSnapshot(
        '"@media (min-width: 768px){@media (min-width: 1024px){.xrf68et.xrf68et.xrf68et:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#){color:red}}}"',
      );
    });

    test('handles constants for container queries', () => {
      inject('', 0, 'xcq500', '@media (min-width: 500px)');

      const cssText = 'var(--xcq500){.container-class{padding:20px}}';
      const result = inject(cssText, 6000);

      expect(result).toMatchInlineSnapshot(
        '"@media (min-width: 500px){.container-class:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#){padding:20px}}"',
      );
    });

    test('handles constants for supports queries', () => {
      inject('', 0, 'xsupports', '@media (display: grid)');

      const cssText = 'var(--xsupports){.grid-container{display:grid}}';
      const result = inject(cssText, 6000);

      expect(result).toMatchInlineSnapshot(
        '"@media (display: grid){.grid-container:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#){display:grid}}"',
      );
    });

    test('handles constants in CSS variable definitions', () => {
      inject('', 0, 'xprimary', 'rebeccapurple');

      const cssText = ':root { --my-color: var(--xprimary) }';
      const result = inject(cssText, 0.1);

      expect(result).toMatchInlineSnapshot(
        '":root { --my-color: rebeccapurple }"',
      );
    });

    test('handles constants with special characters in values', () => {
      inject('', 0, 'xspecial', 'url("image.png")');

      const cssText = '.bg { background-image: var(--xspecial) }';
      const result = inject(cssText, 3000);

      expect(result).toMatchInlineSnapshot(
        '".bg:not(#\\#):not(#\\#):not(#\\#){ background-image: url("image.png") }"',
      );
    });

    test('preserves other var() references that are not constants', () => {
      inject('', 0, 'xknown', 'blue');

      const cssText =
        '.mixed { color: var(--xknown); background: var(--unknown-var) }';
      const result = inject(cssText, 3000);

      expect(result).toMatchInlineSnapshot(
        '".mixed:not(#\\#):not(#\\#):not(#\\#){ color: blue; background: var(--unknown-var) }"',
      );
    });

    test('updates dependent rules when constant changes', () => {
      inject('', 0, 'xdynamic', 'red');

      const cssText = '.dynamic { color: var(--xdynamic) }';
      const result1 = inject(cssText, 3000);
      expect(result1).toMatchInlineSnapshot(
        '".dynamic:not(#\\#):not(#\\#):not(#\\#){ color: red }"',
      );

      inject('', 0, 'xdynamic', 'green');

      const cssText2 = '.dynamic2 { background: var(--xdynamic) }';
      const result2 = inject(cssText2, 3000);
      expect(result2).toMatchInlineSnapshot(
        '".dynamic2:not(#\\#):not(#\\#):not(#\\#){ background: green }"',
      );
    });

    test('handles constants with zero values', () => {
      inject('', 0, 'xzero', 0);

      const cssText = '.zero { margin: var(--xzero) }';
      const result = inject(cssText, 1000);

      expect(result).toMatchInlineSnapshot('".zero:not(#\\#){ margin: 0 }"');
    });

    test('handles constants in complex selectors', () => {
      inject('', 0, 'xhover', 'blue');

      const cssText = '.link:hover::after { color: var(--xhover) }';
      const result = inject(cssText, 5000);

      expect(result).toMatchInlineSnapshot(
        '".link:hover:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#)::after { color: blue }"',
      );
    });

    test('updates multiple dependent rules when constant changes', () => {
      inject('', 0, 'xchanging', 'red');

      const cssText1 = '.rule1 { color: var(--xchanging) }';
      const result1 = inject(cssText1, 3000);
      expect(result1).toMatchInlineSnapshot(
        '".rule1:not(#\\#):not(#\\#):not(#\\#){ color: red }"',
      );

      const cssText2 = '.rule2 { background: var(--xchanging) }';
      const result2 = inject(cssText2, 3000);
      expect(result2).toMatchInlineSnapshot(
        '".rule2:not(#\\#):not(#\\#):not(#\\#){ background: red }"',
      );

      const cssText3 = '.rule3 { border-color: var(--xchanging) }';
      const result3 = inject(cssText3, 3000);
      expect(result3).toMatchInlineSnapshot(
        '".rule3:not(#\\#):not(#\\#):not(#\\#){ border-color: red }"',
      );

      inject('', 0, 'xchanging', 'blue');

      const cssText4 = '.rule4 { fill: var(--xchanging) }';
      const result4 = inject(cssText4, 3000);
      expect(result4).toMatchInlineSnapshot(
        '".rule4:not(#\\#):not(#\\#):not(#\\#){ fill: blue }"',
      );
    });

    test('does not update dependent rules if constant value stays the same', () => {
      inject('', 0, 'xstatic', 'purple');

      const cssText = '.static { color: var(--xstatic) }';
      const result1 = inject(cssText, 3000);
      expect(result1).toMatchInlineSnapshot(
        '".static:not(#\\#):not(#\\#):not(#\\#){ color: purple }"',
      );

      inject('', 0, 'xstatic', 'purple');

      const cssText2 = '.static2 { background: var(--xstatic) }';
      const result2 = inject(cssText2, 3000);
      expect(result2).toMatchInlineSnapshot(
        '".static2:not(#\\#):not(#\\#):not(#\\#){ background: purple }"',
      );
    });

    test('updates dependent at-rules when constant changes', () => {
      inject('', 0, 'xbpchanging', '@media (min-width: 768px)');

      const cssText1 = 'var(--xbpchanging){.responsive{display:flex}}';
      const result1 = inject(cssText1, 6000);
      expect(result1).toMatchInlineSnapshot(
        '"@media (min-width: 768px){.responsive:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#){display:flex}}"',
      );

      inject('', 0, 'xbpchanging', '@media (min-width: 1024px)');

      const cssText2 = 'var(--xbpchanging){.responsive2{display:grid}}';
      const result2 = inject(cssText2, 6000);
      expect(result2).toMatchInlineSnapshot(
        '"@media (min-width: 1024px){.responsive2:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#){display:grid}}"',
      );
    });

    test('prevents duplicate dependency tracking', () => {
      inject('', 0, 'xnodupe', 'purple');

      const cssText = '.nodupe { color: var(--xnodupe) }';
      inject(cssText, 3000);
      inject(cssText, 3000);
      inject(cssText, 3000);

      inject('', 0, 'xnodupe', 'orange');

      const cssText2 = '.nodupe2 { background: var(--xnodupe) }';
      const result = inject(cssText2, 3000);
      expect(result).toMatchInlineSnapshot(
        '".nodupe2:not(#\\#):not(#\\#):not(#\\#){ background: orange }"',
      );
    });

    test('tracks dependencies for multiple constants in one rule', () => {
      inject('', 0, 'xmulti1', 'red');
      inject('', 0, 'xmulti2', 'blue');

      const cssText =
        '.multi { color: var(--xmulti1); background: var(--xmulti2) }';
      const result1 = inject(cssText, 3000);
      expect(result1).toMatchInlineSnapshot(
        '".multi:not(#\\#):not(#\\#):not(#\\#){ color: red; background: blue }"',
      );

      inject('', 0, 'xmulti1', 'green');

      const cssText2 = '.multi2 { border-color: var(--xmulti1) }';
      const result2 = inject(cssText2, 3000);
      expect(result2).toMatchInlineSnapshot(
        '".multi2:not(#\\#):not(#\\#):not(#\\#){ border-color: green }"',
      );

      inject('', 0, 'xmulti2', 'yellow');

      const cssText3 = '.multi3 { fill: var(--xmulti2) }';
      const result3 = inject(cssText3, 3000);
      expect(result3).toMatchInlineSnapshot(
        '".multi3:not(#\\#):not(#\\#):not(#\\#){ fill: yellow }"',
      );
    });

    test('correctly updates stylesheet when constant value changes', () => {
      inject('', 0, 'xupdatetest', 'red');

      const cssText = '.updatetest { color: var(--xupdatetest) }';
      const result1 = inject(cssText, 3000);
      expect(result1).toMatchInlineSnapshot(
        '".updatetest:not(#\\#):not(#\\#):not(#\\#){ color: red }"',
      );

      inject('', 0, 'xupdatetest', 'green');

      const cssText2 = '.updatetest2 { background: var(--xupdatetest) }';
      const result2 = inject(cssText2, 3000);
      expect(result2).toMatchInlineSnapshot(
        '".updatetest2:not(#\\#):not(#\\#):not(#\\#){ background: green }"',
      );
    });

    test('handles constant updates with at-rules and regular properties', () => {
      inject('', 0, 'xflexible', 'red');

      const cssText1 = '.prop { color: var(--xflexible) }';
      const result1 = inject(cssText1, 3000);
      expect(result1).toMatchInlineSnapshot(
        '".prop:not(#\\#):not(#\\#):not(#\\#){ color: red }"',
      );

      inject('', 0, 'xflexible', 'blue');

      const cssText2 = '.prop2 { border-color: var(--xflexible) }';
      const result2 = inject(cssText2, 3000);
      expect(result2).toMatchInlineSnapshot(
        '".prop2:not(#\\#):not(#\\#):not(#\\#){ border-color: blue }"',
      );
    });

    test('handles mixed constant and non-constant values', () => {
      inject('', 0, 'xmixed', '10px');

      const cssText = '.mixed { padding: var(--xmixed); margin: 20px }';
      const result1 = inject(cssText, 3000);
      expect(result1).toMatchInlineSnapshot(
        '".mixed:not(#\\#):not(#\\#):not(#\\#){ padding: 10px; margin: 20px }"',
      );

      inject('', 0, 'xmixed', '15px');

      const cssText2 = '.mixed2 { padding: var(--xmixed); margin: 20px }';
      const result2 = inject(cssText2, 3000);
      expect(result2).toMatchInlineSnapshot(
        '".mixed2:not(#\\#):not(#\\#):not(#\\#){ padding: 15px; margin: 20px }"',
      );
    });
  });
});
