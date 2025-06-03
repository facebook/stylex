/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { NullPreRule, PreRule, PreRuleSet } from '../PreRule';
import { flattenRawStyleObject } from '../flatten-raw-style-obj';

const options = {
  classNamePrefix: 'x',
  debug: false,
  styleResolution: 'legacy-expand-shorthands',
  runtimeInjection: false,
  dev: false,
  test: false,
};

describe('Flatten Style Object with legacy shorthand expansion', () => {
  describe('Simple Objects', () => {
    test('should create PreRule objects for simple style values', () => {
      expect(
        flattenRawStyleObject(
          {
            color: 'red',
            marginStart: 10,
          },
          options,
        ),
      ).toEqual([
        ['color', new PreRule('color', 'red', ['color'])],
        [
          'marginInlineStart',
          new PreRule('marginInlineStart', 10, ['marginInlineStart']),
        ],
        ['marginLeft', new NullPreRule()],
        ['marginRight', new NullPreRule()],
      ]);
    });

    test('should expand simple gap values', () => {
      expect(
        flattenRawStyleObject(
          {
            gap: 10,
          },
          options,
        ),
      ).toEqual([
        ['rowGap', new PreRule('rowGap', 10, ['rowGap'])],
        ['columnGap', new PreRule('columnGap', 10, ['columnGap'])],
      ]);
    });

    test('should expand simple containIntrinsicSize values', () => {
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: 10,
          },
          options,
        ),
      ).toEqual([
        [
          'containIntrinsicWidth',
          new PreRule('containIntrinsicWidth', 10, ['containIntrinsicWidth']),
        ],
        [
          'containIntrinsicHeight',
          new PreRule('containIntrinsicHeight', 10, ['containIntrinsicHeight']),
        ],
      ]);
    });

    test('should expand simple shorthands', () => {
      expect(flattenRawStyleObject({ margin: 10 }, options)).toEqual([
        ['marginTop', new PreRule('marginTop', 10, ['marginTop'])],
        [
          'marginInlineEnd',
          new PreRule('marginInlineEnd', 10, ['marginInlineEnd']),
        ],
        ['marginBottom', new PreRule('marginBottom', 10, ['marginBottom'])],
        [
          'marginInlineStart',
          new PreRule('marginInlineStart', 10, ['marginInlineStart']),
        ],
      ]);

      expect(
        flattenRawStyleObject({ margin: 10, marginBottom: 20 }, options),
      ).toEqual([
        ['marginTop', new PreRule('marginTop', 10, ['marginTop'])],
        [
          'marginInlineEnd',
          new PreRule('marginInlineEnd', 10, ['marginInlineEnd']),
        ],
        ['marginBottom', new PreRule('marginBottom', 10, ['marginBottom'])],
        [
          'marginInlineStart',
          new PreRule('marginInlineStart', 10, ['marginInlineStart']),
        ],
        ['marginBottom', new PreRule('marginBottom', 20, ['marginBottom'])],
      ]);
    });

    test('should expand shorthands with space-separated values', () => {
      expect(
        flattenRawStyleObject(
          { margin: '10px 20px', borderColor: 'red' },
          options,
        ),
      ).toEqual([
        ['marginTop', new PreRule('marginTop', '10px', ['marginTop'])],
        [
          'marginInlineEnd',
          new PreRule('marginInlineEnd', '20px', ['marginInlineEnd']),
        ],
        ['marginBottom', new PreRule('marginBottom', '10px', ['marginBottom'])],
        [
          'marginInlineStart',
          new PreRule('marginInlineStart', '20px', ['marginInlineStart']),
        ],
        [
          'borderTopColor',
          new PreRule('borderTopColor', 'red', ['borderTopColor']),
        ],
        [
          'borderInlineEndColor',
          new PreRule('borderInlineEndColor', 'red', ['borderInlineEndColor']),
        ],
        [
          'borderBottomColor',
          new PreRule('borderBottomColor', 'red', ['borderBottomColor']),
        ],
        [
          'borderInlineStartColor',
          new PreRule('borderInlineStartColor', 'red', [
            'borderInlineStartColor',
          ]),
        ],
      ]);
    });

    test('should expand simple gap with space-separated values', () => {
      expect(
        flattenRawStyleObject(
          {
            gap: '10px 20px',
          },
          options,
        ),
      ).toEqual([
        ['rowGap', new PreRule('rowGap', '10px', ['rowGap'])],
        ['columnGap', new PreRule('columnGap', '20px', ['columnGap'])],
      ]);
    });

    test('should expand simple containIntrinsicSize with space-separated values', () => {
      const w = 'containIntrinsicWidth';
      const h = 'containIntrinsicHeight';
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: '10px 20px',
          },
          options,
        ),
      ).toEqual([
        [w, new PreRule(w, '10px', [w])],
        [h, new PreRule(h, '20px', [h])],
      ]);
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: 'auto 10px 20px',
          },
          options,
        ),
      ).toEqual([
        [w, new PreRule(w, 'auto 10px', [w])],
        [h, new PreRule(h, '20px', [h])],
      ]);
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: '10px auto 20px',
          },
          options,
        ),
      ).toEqual([
        [w, new PreRule(w, '10px', [w])],
        [h, new PreRule(h, 'auto 20px', [h])],
      ]);
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: 'auto 10px auto 20px',
          },
          options,
        ),
      ).toEqual([
        [w, new PreRule(w, 'auto 10px', [w])],
        [h, new PreRule(h, 'auto 20px', [h])],
      ]);
    });

    test('should expand shorthands with fallbacks', () => {
      expect(
        flattenRawStyleObject({ margin: ['10vh 20px', '10dvh 20px'] }, options),
      ).toEqual([
        [
          'marginTop',
          new PreRule('marginTop', ['10vh', '10dvh'], ['marginTop']),
        ],
        [
          'marginInlineEnd',
          new PreRule('marginInlineEnd', '20px', ['marginInlineEnd']),
        ],
        [
          'marginBottom',
          new PreRule('marginBottom', ['10vh', '10dvh'], ['marginBottom']),
        ],
        [
          'marginInlineStart',
          new PreRule('marginInlineStart', '20px', ['marginInlineStart']),
        ],
      ]);
    });
  });

  describe('Nested Objects', () => {
    test('Legacy Pseudo classes', () => {
      expect(
        flattenRawStyleObject(
          {
            color: 'blue',
            marginStart: 0,
            ':hover': {
              color: 'red',
              marginStart: 10,
            },
          },
          options,
        ),
      ).toEqual([
        ['color', new PreRule('color', 'blue', ['color'])],
        [
          'marginInlineStart',
          new PreRule('marginInlineStart', 0, ['marginInlineStart']),
        ],
        ['marginLeft', new NullPreRule()],
        ['marginRight', new NullPreRule()],
        [':hover_color', new PreRule('color', 'red', [':hover', 'color'])],
        [
          ':hover_marginInlineStart',
          new PreRule('marginInlineStart', 10, [':hover', 'marginInlineStart']),
        ],
        [':hover_marginLeft', new NullPreRule()],
        [':hover_marginRight', new NullPreRule()],
      ]);
    });
    test('Modern Pseudo classes', () => {
      expect(
        flattenRawStyleObject(
          {
            color: {
              default: 'blue',
              ':hover': 'red',
            },
            marginStart: {
              default: 0,
              ':hover': 10,
            },
          },
          options,
        ),
      ).toEqual([
        [
          'color',
          PreRuleSet.create([
            new PreRule('color', 'blue', ['color', 'default']),
            new PreRule('color', 'red', ['color', ':hover']),
          ]),
        ],
        [
          'marginInlineStart',
          PreRuleSet.create([
            new PreRule('marginInlineStart', 0, [
              'marginInlineStart',
              'default',
            ]),
            new PreRule('marginInlineStart', 10, [
              'marginInlineStart',
              ':hover',
            ]),
          ]),
        ],
        [
          'marginLeft',
          PreRuleSet.create([new NullPreRule(), new NullPreRule()]),
        ],
        [
          'marginRight',
          PreRuleSet.create([new NullPreRule(), new NullPreRule()]),
        ],
      ]);
    });
    test('Modern Pseudo classes with shorthands', () => {
      expect(
        flattenRawStyleObject(
          {
            color: {
              default: 'blue',
              ':hover': 'red',
            },
            margin: {
              default: 0,
              ':hover': 10,
            },
          },
          options,
        ),
      ).toEqual([
        [
          'color',
          PreRuleSet.create([
            new PreRule('color', 'blue', ['color', 'default']),
            new PreRule('color', 'red', ['color', ':hover']),
          ]),
        ],
        [
          'marginTop',
          PreRuleSet.create([
            new PreRule('marginTop', 0, ['marginTop', 'default']),
            new PreRule('marginTop', 10, ['marginTop', ':hover']),
          ]),
        ],
        [
          'marginInlineEnd',
          PreRuleSet.create([
            new PreRule('marginInlineEnd', 0, ['marginInlineEnd', 'default']),
            new PreRule('marginInlineEnd', 10, ['marginInlineEnd', ':hover']),
          ]),
        ],
        [
          'marginBottom',
          PreRuleSet.create([
            new PreRule('marginBottom', 0, ['marginBottom', 'default']),
            new PreRule('marginBottom', 10, ['marginBottom', ':hover']),
          ]),
        ],
        [
          'marginInlineStart',
          PreRuleSet.create([
            new PreRule('marginInlineStart', 0, [
              'marginInlineStart',
              'default',
            ]),
            new PreRule('marginInlineStart', 10, [
              'marginInlineStart',
              ':hover',
            ]),
          ]),
        ],
      ]);
    });
    test('Modern Pseudo classes with complex shorthands', () => {
      expect(
        flattenRawStyleObject(
          {
            color: {
              default: 'blue',
              ':hover': 'red',
            },
            margin: {
              default: '1px 2px 3px 4px',
              ':hover': '10px 20px',
            },
          },
          options,
        ),
      ).toEqual([
        [
          'color',
          PreRuleSet.create([
            new PreRule('color', 'blue', ['color', 'default']),
            new PreRule('color', 'red', ['color', ':hover']),
          ]),
        ],
        [
          'marginTop',
          PreRuleSet.create([
            new PreRule('marginTop', '1px', ['marginTop', 'default']),
            new PreRule('marginTop', '10px', ['marginTop', ':hover']),
          ]),
        ],
        [
          'marginInlineEnd',
          PreRuleSet.create([
            new PreRule('marginInlineEnd', '2px', [
              'marginInlineEnd',
              'default',
            ]),
            new PreRule('marginInlineEnd', '20px', [
              'marginInlineEnd',
              ':hover',
            ]),
          ]),
        ],
        [
          'marginBottom',
          PreRuleSet.create([
            new PreRule('marginBottom', '3px', ['marginBottom', 'default']),
            new PreRule('marginBottom', '10px', ['marginBottom', ':hover']),
          ]),
        ],
        [
          'marginInlineStart',
          PreRuleSet.create([
            new PreRule('marginInlineStart', '4px', [
              'marginInlineStart',
              'default',
            ]),
            new PreRule('marginInlineStart', '20px', [
              'marginInlineStart',
              ':hover',
            ]),
          ]),
        ],
      ]);
    });
    test('Modern pseudo and at-rules', () => {
      expect(
        flattenRawStyleObject(
          {
            color: {
              default: 'blue',
              ':hover': 'red',
              '@media (min-width: 300px)': 'green',
            },
            marginStart: {
              default: 0,
              ':hover': 10,
            },
          },
          options,
        ),
      ).toEqual([
        [
          'color',
          PreRuleSet.create([
            new PreRule('color', 'blue', ['color', 'default']),
            new PreRule('color', 'red', ['color', ':hover']),
            new PreRule('color', 'green', [
              'color',
              '@media (min-width: 300px)',
            ]),
          ]),
        ],
        [
          'marginInlineStart',
          PreRuleSet.create([
            new PreRule('marginInlineStart', 0, [
              'marginInlineStart',
              'default',
            ]),
            new PreRule('marginInlineStart', 10, [
              'marginInlineStart',
              ':hover',
            ]),
          ]),
        ],
        [
          'marginLeft',
          PreRuleSet.create([new NullPreRule(), new NullPreRule()]),
        ],
        [
          'marginRight',
          PreRuleSet.create([new NullPreRule(), new NullPreRule()]),
        ],
      ]);
    });
  });
  describe('Multiple levels of nesting', () => {
    test('Fallback styles within nested objects', () => {
      expect(
        flattenRawStyleObject(
          {
            margin: {
              default: '1px 2px 3px 4px',
              ':hover': ['10px 20px', '1dvh 2dvw'],
            },
          },
          options,
        ),
      ).toEqual([
        [
          'marginTop',
          PreRuleSet.create([
            new PreRule('marginTop', '1px', ['marginTop', 'default']),
            new PreRule('marginTop', ['10px', '1dvh'], ['marginTop', ':hover']),
          ]),
        ],
        [
          'marginInlineEnd',
          PreRuleSet.create([
            new PreRule('marginInlineEnd', '2px', [
              'marginInlineEnd',
              'default',
            ]),
            new PreRule(
              'marginInlineEnd',
              ['20px', '2dvw'],
              ['marginInlineEnd', ':hover'],
            ),
          ]),
        ],
        [
          'marginBottom',
          PreRuleSet.create([
            new PreRule('marginBottom', '3px', ['marginBottom', 'default']),
            new PreRule(
              'marginBottom',
              ['10px', '1dvh'],
              ['marginBottom', ':hover'],
            ),
          ]),
        ],
        [
          'marginInlineStart',
          PreRuleSet.create([
            new PreRule('marginInlineStart', '4px', [
              'marginInlineStart',
              'default',
            ]),
            new PreRule(
              'marginInlineStart',
              ['20px', '2dvw'],
              ['marginInlineStart', ':hover'],
            ),
          ]),
        ],
      ]);
    });
    test('pseudo within a media query - legacy syntax', () => {
      expect(
        flattenRawStyleObject(
          {
            '@media (min-width: 300px)': {
              ':hover': {
                color: 'red',
              },
            },
          },
          options,
        ),
      ).toEqual([
        [
          '@media (min-width: 300px)_:hover_color',
          PreRuleSet.create([
            new PreRule('color', 'red', [
              '@media (min-width: 300px)',
              ':hover',
              'color',
            ]),
          ]),
        ],
      ]);
    });
    test('pseudo with a pseudo within a media query - legacy syntax', () => {
      expect(
        flattenRawStyleObject(
          {
            '@media (min-width: 300px)': {
              ':hover': {
                color: 'pink',
                ':active': {
                  color: 'red',
                },
              },
            },
          },
          options,
        ),
      ).toEqual([
        [
          '@media (min-width: 300px)_:hover_color',
          PreRuleSet.create([
            new PreRule('color', 'pink', [
              '@media (min-width: 300px)',
              ':hover',
              'color',
            ]),
          ]),
        ],
        [
          '@media (min-width: 300px)_:hover_:active_color',
          PreRuleSet.create([
            new PreRule('color', 'red', [
              '@media (min-width: 300px)',
              ':hover',
              ':active',
              'color',
            ]),
          ]),
        ],
      ]);
    });
    test('pseudo within a media query - modern syntax', () => {
      expect(
        flattenRawStyleObject(
          {
            color: {
              default: 'blue',
              '@media (min-width: 300px)': {
                ':hover': 'red',
              },
            },
          },
          options,
        ),
      ).toEqual([
        [
          'color',
          PreRuleSet.create([
            new PreRule('color', 'blue', ['color', 'default']),
            new PreRule('color', 'red', [
              'color',
              '@media (min-width: 300px)',
              ':hover',
            ]),
          ]),
        ],
      ]);
    });
    test('extra deep, pseudo within a media query - modern syntax', () => {
      expect(
        flattenRawStyleObject(
          {
            color: {
              default: 'blue',
              '@media (min-width: 300px)': {
                ':hover': {
                  default: 'red',
                  ':active': 'maroon',
                },
              },
            },
          },
          options,
        ),
      ).toEqual([
        [
          'color',
          PreRuleSet.create([
            new PreRule('color', 'blue', ['color', 'default']),
            new PreRule('color', 'red', [
              'color',
              '@media (min-width: 300px)',
              ':hover',
              'default',
            ]),
            new PreRule('color', 'maroon', [
              'color',
              '@media (min-width: 300px)',
              ':hover',
              ':active',
            ]),
          ]),
        ],
      ]);
    });
  });
});
