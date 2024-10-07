/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  NullPreRule,
  PreRule,
  PreRuleSet,
} from '../../src/preprocess-rules/PreRule';
import { flattenRawStyleObject } from '../../src/preprocess-rules/flatten-raw-style-obj';

const options = {
  classNamePrefix: 'x',
  styleResolution: 'legacy-expand-shorthands',
  runtimeInjection: false,
  useRemForFontSize: true,
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
        ['color', new PreRule('color', 'red')],
        ['marginStart', new PreRule('marginStart', 10)],
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
        ['rowGap', new PreRule('rowGap', 10)],
        ['columnGap', new PreRule('columnGap', 10)],
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
        ['containIntrinsicWidth', new PreRule('containIntrinsicWidth', 10)],
        ['containIntrinsicHeight', new PreRule('containIntrinsicHeight', 10)],
      ]);
    });

    test('should expand simple shorthands', () => {
      expect(flattenRawStyleObject({ margin: 10 }, options)).toEqual([
        ['marginTop', new PreRule('marginTop', 10)],
        ['marginEnd', new PreRule('marginEnd', 10)],
        ['marginBottom', new PreRule('marginBottom', 10)],
        ['marginStart', new PreRule('marginStart', 10)],
      ]);

      expect(
        flattenRawStyleObject({ margin: 10, marginBottom: 20 }, options),
      ).toEqual([
        ['marginTop', new PreRule('marginTop', 10)],
        ['marginEnd', new PreRule('marginEnd', 10)],
        ['marginBottom', new PreRule('marginBottom', 10)],
        ['marginStart', new PreRule('marginStart', 10)],
        ['marginBottom', new PreRule('marginBottom', 20)],
      ]);
    });

    test('should expand shorthands with space-separated values', () => {
      expect(
        flattenRawStyleObject(
          { margin: '10px 20px', borderColor: 'red' },
          options,
        ),
      ).toEqual([
        ['marginTop', new PreRule('marginTop', '10px')],
        ['marginEnd', new PreRule('marginEnd', '20px')],
        ['marginBottom', new PreRule('marginBottom', '10px')],
        ['marginStart', new PreRule('marginStart', '20px')],
        ['borderTopColor', new PreRule('borderTopColor', 'red')],
        ['borderEndColor', new PreRule('borderEndColor', 'red')],
        ['borderBottomColor', new PreRule('borderBottomColor', 'red')],
        ['borderStartColor', new PreRule('borderStartColor', 'red')],
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
        ['rowGap', new PreRule('rowGap', '10px')],
        ['columnGap', new PreRule('columnGap', '20px')],
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
        [w, new PreRule(w, '10px')],
        [h, new PreRule(h, '20px')],
      ]);
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: 'auto 10px 20px',
          },
          options,
        ),
      ).toEqual([
        [w, new PreRule(w, 'auto 10px')],
        [h, new PreRule(h, '20px')],
      ]);
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: '10px auto 20px',
          },
          options,
        ),
      ).toEqual([
        [w, new PreRule(w, '10px')],
        [h, new PreRule(h, 'auto 20px')],
      ]);
      expect(
        flattenRawStyleObject(
          {
            containIntrinsicSize: 'auto 10px auto 20px',
          },
          options,
        ),
      ).toEqual([
        [w, new PreRule(w, 'auto 10px')],
        [h, new PreRule(h, 'auto 20px')],
      ]);
    });

    test('should expand shorthands with fallbacks', () => {
      expect(
        flattenRawStyleObject({ margin: ['10vh 20px', '10dvh 20px'] }, options),
      ).toEqual([
        ['marginTop', new PreRule('marginTop', ['10vh', '10dvh'])],
        ['marginEnd', new PreRule('marginEnd', '20px')],
        ['marginBottom', new PreRule('marginBottom', ['10vh', '10dvh'])],
        ['marginStart', new PreRule('marginStart', '20px')],
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
        ['color', new PreRule('color', 'blue')],
        ['marginStart', new PreRule('marginStart', 0)],
        ['marginLeft', new NullPreRule()],
        ['marginRight', new NullPreRule()],
        [':hover_color', new PreRule('color', 'red', [':hover'], [])],
        [':hover_marginStart', new PreRule('marginStart', 10, [':hover'], [])],
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
            new PreRule('color', 'blue'),
            new PreRule('color', 'red', [':hover'], []),
          ]),
        ],
        [
          'marginStart',
          PreRuleSet.create([
            new PreRule('marginStart', 0),
            new PreRule('marginStart', 10, [':hover'], []),
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
            new PreRule('color', 'blue'),
            new PreRule('color', 'red', [':hover'], []),
          ]),
        ],
        [
          'marginTop',
          PreRuleSet.create([
            new PreRule('marginTop', 0),
            new PreRule('marginTop', 10, [':hover'], []),
          ]),
        ],
        [
          'marginEnd',
          PreRuleSet.create([
            new PreRule('marginEnd', 0),
            new PreRule('marginEnd', 10, [':hover'], []),
          ]),
        ],
        [
          'marginBottom',
          PreRuleSet.create([
            new PreRule('marginBottom', 0),
            new PreRule('marginBottom', 10, [':hover'], []),
          ]),
        ],
        [
          'marginStart',
          PreRuleSet.create([
            new PreRule('marginStart', 0),
            new PreRule('marginStart', 10, [':hover'], []),
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
            new PreRule('color', 'blue'),
            new PreRule('color', 'red', [':hover'], []),
          ]),
        ],
        [
          'marginTop',
          PreRuleSet.create([
            new PreRule('marginTop', '1px'),
            new PreRule('marginTop', '10px', [':hover'], []),
          ]),
        ],
        [
          'marginEnd',
          PreRuleSet.create([
            new PreRule('marginEnd', '2px'),
            new PreRule('marginEnd', '20px', [':hover'], []),
          ]),
        ],
        [
          'marginBottom',
          PreRuleSet.create([
            new PreRule('marginBottom', '3px'),
            new PreRule('marginBottom', '10px', [':hover'], []),
          ]),
        ],
        [
          'marginStart',
          PreRuleSet.create([
            new PreRule('marginStart', '4px'),
            new PreRule('marginStart', '20px', [':hover'], []),
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
            new PreRule('color', 'blue'),
            new PreRule('color', 'red', [':hover'], []),
            new PreRule('color', 'green', [], ['@media (min-width: 300px)']),
          ]),
        ],
        [
          'marginStart',
          PreRuleSet.create([
            new PreRule('marginStart', 0),
            new PreRule('marginStart', 10, [':hover'], []),
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
            new PreRule('marginTop', '1px'),
            new PreRule('marginTop', ['10px', '1dvh'], [':hover'], []),
          ]),
        ],
        [
          'marginEnd',
          PreRuleSet.create([
            new PreRule('marginEnd', '2px'),
            new PreRule('marginEnd', ['20px', '2dvw'], [':hover'], []),
          ]),
        ],
        [
          'marginBottom',
          PreRuleSet.create([
            new PreRule('marginBottom', '3px'),
            new PreRule('marginBottom', ['10px', '1dvh'], [':hover'], []),
          ]),
        ],
        [
          'marginStart',
          PreRuleSet.create([
            new PreRule('marginStart', '4px'),
            new PreRule('marginStart', ['20px', '2dvw'], [':hover'], []),
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
            new PreRule(
              'color',
              'red',
              [':hover'],
              ['@media (min-width: 300px)'],
            ),
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
            new PreRule(
              'color',
              'pink',
              [':hover'],
              ['@media (min-width: 300px)'],
            ),
          ]),
        ],
        [
          '@media (min-width: 300px)_:hover_:active_color',
          PreRuleSet.create([
            new PreRule(
              'color',
              'red',
              [':active', ':hover'],
              ['@media (min-width: 300px)'],
            ),
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
            new PreRule('color', 'blue', [], []),
            new PreRule(
              'color',
              'red',
              [':hover'],
              ['@media (min-width: 300px)'],
            ),
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
            new PreRule('color', 'blue', [], []),
            new PreRule(
              'color',
              'red',
              [':hover'],
              ['@media (min-width: 300px)'],
            ),
            new PreRule(
              'color',
              'maroon',
              [':hover', ':active'],
              ['@media (min-width: 300px)'],
            ),
          ]),
        ],
      ]);
    });
  });
});
