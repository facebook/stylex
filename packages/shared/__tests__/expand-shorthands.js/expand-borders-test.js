/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 *
 */

import legacyExpandShorthands from '../../src/preprocess-rules/legacy-expand-shorthands';

describe('Ensure border are still splitting to the old implementation', () => {
  test('1px solid var(--thumbnail-inner-border)', () => {
    expect(
      legacyExpandShorthands.border('1px solid var(--thumbnail-inner-border)'),
    ).toEqual([
      ['borderTop', '1px solid var(--thumbnail-inner-border)'],
      ['borderEnd', '1px solid var(--thumbnail-inner-border)'],
      ['borderBottom', '1px solid var(--thumbnail-inner-border)'],
      ['borderStart', '1px solid var(--thumbnail-inner-border)'],
    ]);
  });
});

// // describe.skip('Ensure borders are split correctly', () => {
// //   describe('border', () => {
// //     test('none !important', () => {
// //       expect(legacyExpandShorthands.border('none !important')).toEqual([
// //         ['borderTopStyle', 'none !important'],
// //         ['borderEndStyle', 'none !important'],
// //         ['borderBottomStyle', 'none !important'],
// //         ['borderStartStyle', 'none !important'],
// //       ]);
// //     });
// //     test('none!important', () => {
// //       expect(legacyExpandShorthands.border('none !important')).toEqual([
// //         ['borderTopStyle', 'none !important'],
// //         ['borderEndStyle', 'none !important'],
// //         ['borderBottomStyle', 'none !important'],
// //         ['borderStartStyle', 'none !important'],
// //       ]);
// //     });
// //     test('solid var(--media-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.border('solid var(--media-inner-border)')
// //       ).toEqual([
// //         ['borderTopStyle', 'solid'],
// //         ['borderEndStyle', 'solid'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderStartStyle', 'solid'],
// //         ['borderTopColor', 'var(--media-inner-border)'],
// //         ['borderEndColor', 'var(--media-inner-border)'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //         ['borderStartColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('3px dashed var(--media-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.border('3px dashed var(--media-inner-border)')
// //       ).toEqual([
// //         ['borderTopWidth', '3px'],
// //         ['borderEndWidth', '3px'],
// //         ['borderBottomWidth', '3px'],
// //         ['borderStartWidth', '3px'],
// //         ['borderTopStyle', 'dashed'],
// //         ['borderEndStyle', 'dashed'],
// //         ['borderBottomStyle', 'dashed'],
// //         ['borderStartStyle', 'dashed'],
// //         ['borderTopColor', 'var(--media-inner-border)'],
// //         ['borderEndColor', 'var(--media-inner-border)'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //         ['borderStartColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('1px var(--divider)', () => {
// //       expect(legacyExpandShorthands.border('1px var(--divider)')).toEqual([
// //         ['borderTopWidth', '1px'],
// //         ['borderEndWidth', '1px'],
// //         ['borderBottomWidth', '1px'],
// //         ['borderStartWidth', '1px'],
// //         ['borderTopColor', 'var(--divider)'],
// //         ['borderEndColor', 'var(--divider)'],
// //         ['borderBottomColor', 'var(--divider)'],
// //         ['borderStartColor', 'var(--divider)'],
// //       ]);
// //     });
// //     test('var(--thin-size) var(--divider)', () => {
// //       expect(
// //         legacyExpandShorthands.border('var(--thin-size) var(--divider)')
// //       ).toEqual([
// //         ['borderTopWidth', 'var(--thin-size)'],
// //         ['borderEndWidth', 'var(--thin-size)'],
// //         ['borderBottomWidth', 'var(--thin-size)'],
// //         ['borderStartWidth', 'var(--thin-size)'],
// //         ['borderTopColor', 'var(--divider)'],
// //         ['borderEndColor', 'var(--divider)'],
// //         ['borderBottomColor', 'var(--divider)'],
// //         ['borderStartColor', 'var(--divider)'],
// //       ]);
// //     });
// //     test('1px var(--media-inner-border) solid', () => {
// //       expect(
// //         legacyExpandShorthands.border('1px var(--media-inner-border) solid')
// //       ).toEqual([
// //         ['borderTopWidth', '1px'],
// //         ['borderEndWidth', '1px'],
// //         ['borderBottomWidth', '1px'],
// //         ['borderStartWidth', '1px'],
// //         ['borderTopStyle', 'solid'],
// //         ['borderEndStyle', 'solid'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderStartStyle', 'solid'],
// //         ['borderTopColor', 'var(--media-inner-border)'],
// //         ['borderEndColor', 'var(--media-inner-border)'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //         ['borderStartColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //   });
// //   describe('borderTop', () => {
// //     test('1px solid var(--thumbnail-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.borderTop(
// //           '1px solid var(--thumbnail-inner-border)'
// //         )
// //       ).toEqual([
// //         ['borderTopWidth', '1px'],
// //         ['borderTopStyle', 'solid'],
// //         ['borderTopColor', 'var(--thumbnail-inner-border)'],
// //       ]);
// //     });
// //     test('none !important', () => {
// //       expect(legacyExpandShorthands.borderTop('none !important')).toEqual([
// //         ['borderTopStyle', 'none !important'],
// //       ]);
// //     });
// //     test('none!important', () => {
// //       expect(legacyExpandShorthands.borderTop('none !important')).toEqual([
// //         ['borderTopStyle', 'none !important'],
// //       ]);
// //     });
// //     test('solid var(--media-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.borderTop('solid var(--media-inner-border)')
// //       ).toEqual([
// //         ['borderTopStyle', 'solid'],
// //         ['borderTopColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('var(--media-inner-border) solid 1px', () => {
// //       expect(
// //         legacyExpandShorthands.borderTop('var(--media-inner-border) solid 1px')
// //       ).toEqual([
// //         ['borderTopWidth', '1px'],
// //         ['borderTopStyle', 'solid'],
// //         ['borderTopColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('1px var(--media-inner-border) solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderTop('1px var(--media-inner-border) solid')
// //       ).toEqual([
// //         ['borderTopWidth', '1px'],
// //         ['borderTopStyle', 'solid'],
// //         ['borderTopColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('var(--media-inner-border) solid 1px', () => {
// //       expect(
// //         legacyExpandShorthands.borderTop('var(--media-inner-border) solid 1px')
// //       ).toEqual([
// //         ['borderTopWidth', '1px'],
// //         ['borderTopStyle', 'solid'],
// //         ['borderTopColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //   });
// //   describe('borderBottom', () => {
// //     test('1px solid var(--thumbnail-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '1px solid var(--thumbnail-inner-border)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--thumbnail-inner-border)'],
// //       ]);
// //     });
// //     test('3px solid var(--always-dark-overlay)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '3px solid var(--always-dark-overlay)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '3px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--always-dark-overlay)'],
// //       ]);
// //     });
// //     test('2px solid --var(--always-white)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('2px solid --var(--always-white)')
// //       ).toEqual([
// //         ['borderBottomWidth', '2px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', '--var(--always-white)'],
// //       ]);
// //     });
// //     test('1px dashed var(--fds-gray-20)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px dashed var(--fds-gray-20)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'dashed'],
// //         ['borderBottomColor', 'var(--fds-gray-20)'],
// //       ]);
// //     });
// //     test('1px solid rgb(215,215,215)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px solid rgb(215,215,215)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'rgb(215,215,215)'],
// //       ]);
// //     });
// //     test('1px inside var(--shadow-1)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px inside var(--shadow-1)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'inside'],
// //         ['borderBottomColor', 'var(--shadow-1)'],
// //       ]);
// //     });
// //     test('1px var(--divider)', () => {
// //       expect(legacyExpandShorthands.borderBottom('1px var(--divider)')).toEqual(
// //         [
// //           ['borderBottomWidth', '1px'],
// //           ['borderBottomColor', 'var(--divider)'],
// //         ]
// //       );
// //     });
// //     test('1px solid var(--accent)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px solid var(--accent)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--accent)'],
// //       ]);
// //     });

// //     test('1px solid #5d636e', () => {
// //       expect(legacyExpandShorthands.borderBottom('1px solid #5d636e')).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', '#5d636e'],
// //       ]);
// //     });
// //     test('1px solid transparent', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px solid transparent')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'transparent'],
// //       ]);
// //     });
// //     test('var(--vep-border-default)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('var(--vep-border-default)')
// //       ).toEqual([['borderBottomColor', 'var(--vep-border-default)']]);
// //     });
// //     test('transparent', () => {
// //       expect(legacyExpandShorthands.borderBottom('transparent')).toEqual([
// //         ['borderBottomColor', 'transparent'],
// //       ]);
// //     });
// //     test('.5px solid var(--shadow-1)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('.5px solid var(--shadow-1)')
// //       ).toEqual([
// //         ['borderBottomWidth', '.5px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--shadow-1)'],
// //       ]);
// //     });
// //     test('2px', () => {
// //       expect(legacyExpandShorthands.borderBottom('2px')).toEqual([
// //         ['borderBottomWidth', '2px'],
// //       ]);
// //     });
// //     test('1px dashed currentColor', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px dashed currentColor')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'dashed'],
// //         ['borderBottomColor', 'currentColor'],
// //       ]);
// //     });
// //     test('solid 1px var(--web-wash)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid 1px var(--web-wash)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--web-wash)'],
// //       ]);
// //     });
// //     test('dashed 1px var(--primary-button-pressed)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'dashed 1px var(--primary-button-pressed)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'dashed'],
// //         ['borderBottomColor', 'var(--primary-button-pressed)'],
// //       ]);
// //     });
// //     test('solid 1px var(--secondary-button-background)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'solid 1px var(--secondary-button-background)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--secondary-button-background)'],
// //       ]);
// //     });
// //     test('solid var(--media-inner-border) 1px', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'solid var(--media-inner-border) 1px'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('solid 1px', () => {
// //       expect(legacyExpandShorthands.borderBottom('solid 1px')).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //       ]);
// //     });
// //     test('solid var(--surface-background)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--surface-background)')
// //       ).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--surface-background)'],
// //       ]);
// //     });
// //     test('1px', () => {
// //       expect(legacyExpandShorthands.borderBottom('1px')).toEqual([
// //         ['borderBottomWidth', '1px'],
// //       ]);
// //     });
// //     test('1.5px solid var(--media-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '1.5px solid var(--media-inner-border)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1.5px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('2px solid', () => {
// //       expect(legacyExpandShorthands.borderBottom('2px solid')).toEqual([
// //         ['borderBottomWidth', '2px'],
// //         ['borderBottomStyle', 'solid'],
// //       ]);
// //     });
// //     test('.5px solid var(--divider)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('.5px solid var(--divider)')
// //       ).toEqual([
// //         ['borderBottomWidth', '.5px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--divider)'],
// //       ]);
// //     });
// //     test('solid var(--accent)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--accent)')
// //       ).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--accent)'],
// //       ]);
// //     });
// //     test('1px var(--web-wash)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px var(--web-wash)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomColor', 'var(--web-wash)'],
// //       ]);
// //     });
// //     test('thin solid var(--media-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'thin solid var(--media-inner-border)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', 'thin'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('solid 1px var(--wash)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid 1px var(--wash)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--wash)'],
// //       ]);
// //     });
// //     test('var(--border-width-thin) solid var(--divider)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'var(--border-width-thin) solid var(--divider)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', 'var(--border-width-thin)'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--divider)'],
// //       ]);
// //     });
// //     test('solid', () => {
// //       expect(legacyExpandShorthands.borderBottom('solid')).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //       ]);
// //     });
// //     test('1px var(--media-inner-border) solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '1px var(--media-inner-border) solid'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('0', () => {
// //       expect(legacyExpandShorthands.borderBottom('0')).toEqual([
// //         ['borderBottomWidth', '0'],
// //       ]);
// //     });
// //     test('1px solid rgb(var(--ig-primary-text))!important', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '1px solid rgb(var(--ig-primary-text))!important'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px !important'],
// //         ['borderBottomStyle', 'solid !important'],
// //         ['borderBottomColor', 'rgb(var(--ig-primary-text)) !important'],
// //       ]);
// //     });
// //     test('2.5px solid var(--always-white)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('2.5px solid var(--always-white)')
// //       ).toEqual([
// //         ['borderBottomWidth', '2.5px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--always-white)'],
// //       ]);
// //     });
// //     test('1px var(--negative) solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('1px var(--negative) solid')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--negative)'],
// //       ]);
// //     });
// //     test('4px solid', () => {
// //       expect(legacyExpandShorthands.borderBottom('4px solid')).toEqual([
// //         ['borderBottomWidth', '4px'],
// //         ['borderBottomStyle', 'solid'],
// //       ]);
// //     });
// //     test('solid 1px var(--fds-spectrum-tomato)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'solid 1px var(--fds-spectrum-tomato)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--fds-spectrum-tomato)'],
// //       ]);
// //     });
// //     test('var(--web-wash)', () => {
// //       expect(legacyExpandShorthands.borderBottom('var(--web-wash)')).toEqual([
// //         ['borderBottomColor', 'var(--web-wash)'],
// //       ]);
// //     });
// //     test('var(--accent) 1px solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('var(--accent) 1px solid')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--accent)'],
// //       ]);
// //     });
// //     test('hidden', () => {
// //       expect(legacyExpandShorthands.borderBottom('hidden')).toEqual([
// //         ['borderBottomStyle', 'hidden'],
// //       ]);
// //     });
// //     test('var(--border-width-thick) solid var(--calendar-event-card-outline-blue)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'var(--border-width-thick) solid var(--calendar-event-card-outline-blue)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', 'var(--border-width-thick)'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--calendar-event-card-outline-blue)'],
// //       ]);
// //     });
// //     test('solid .5px var(--secondary-button-background)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'solid .5px var(--secondary-button-background)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '.5px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--secondary-button-background)'],
// //       ]);
// //     });
// //     test('2px dotted var(--primary-deemphasized-button-text)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '2px dotted var(--primary-deemphasized-button-text)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '2px'],
// //         ['borderBottomStyle', 'dotted'],
// //         ['borderBottomColor', 'var(--primary-deemphasized-button-text)'],
// //       ]);
// //     });
// //     test('solid var(--divider) 1px', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--divider) 1px')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--divider)'],
// //       ]);
// //     });
// //     test('thin solid var(--always-gray-40)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('thin solid var(--always-gray-40)')
// //       ).toEqual([
// //         ['borderBottomWidth', 'thin'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--always-gray-40)'],
// //       ]);
// //     });
// //     test('var(--size-2) solid var(--divider-bg)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'var(--size-2) solid var(--divider-bg)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', 'var(--size-2)'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--divider-bg)'],
// //       ]);
// //     });
// //     test('solid var(--primary-icon)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--primary-icon)')
// //       ).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--primary-icon)'],
// //       ]);
// //     });
// //     test('none', () => {
// //       expect(legacyExpandShorthands.borderBottom('none')).toEqual([
// //         ['borderBottomStyle', 'none'],
// //       ]);
// //     });
// //     test('var(--border-width-thin) solid var(--divider-bg)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'var(--border-width-thin) solid var(--divider-bg)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', 'var(--border-width-thin)'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--divider-bg)'],
// //       ]);
// //     });
// //     test('var(--wig-divider) solid 1px', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('var(--wig-divider) solid 1px')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--wig-divider)'],
// //       ]);
// //     });
// //     test('solid var(--media-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--media-inner-border)')
// //       ).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('var(--media-inner-border) 1px solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'var(--media-inner-border) 1px solid'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('none !important', () => {
// //       expect(legacyExpandShorthands.borderBottom('none !important')).toEqual([
// //         ['borderBottomStyle', 'none !important'],
// //       ]);
// //     });
// //     test('none!important', () => {
// //       expect(legacyExpandShorthands.borderBottom('none!important')).toEqual([
// //         ['borderBottomStyle', 'none !important'],
// //       ]);
// //     });
// //     test('none', () => {
// //       expect(legacyExpandShorthands.borderBottom('none')).toEqual([
// //         ['borderBottomStyle', 'none'],
// //       ]);
// //     });
// //     test('0', () => {
// //       expect(legacyExpandShorthands.borderBottom('0')).toEqual([
// //         ['borderBottomWidth', '0'],
// //       ]);
// //     });
// //     test('4px white solid', () => {
// //       expect(legacyExpandShorthands.borderBottom('4px white solid')).toEqual([
// //         ['borderBottomWidth', '4px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'white'],
// //       ]);
// //     });
// //     test('var(--vep-border-default)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('var(--vep-border-default)')
// //       ).toEqual([['borderBottomColor', 'var(--vep-border-default)']]);
// //     });
// //     test('transparent', () => {
// //       expect(legacyExpandShorthands.borderBottom('transparent')).toEqual([
// //         ['borderBottomColor', 'transparent'],
// //       ]);
// //     });
// //     test('solid 1px var(--web-wash)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid 1px var(--web-wash)')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--web-wash)'],
// //       ]);
// //     });
// //     test('dashed 1px var(--primary-button-pressed)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           'dashed 1px var(--primary-button-pressed)'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'dashed'],
// //         ['borderBottomColor', 'var(--primary-button-pressed)'],
// //       ]);
// //     });
// //     test('solid 1px', () => {
// //       expect(legacyExpandShorthands.borderBottom('solid 1px')).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //       ]);
// //     });
// //     test('solid var(--surface-background)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--surface-background)')
// //       ).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--surface-background)'],
// //       ]);
// //     });
// //     test('1px', () => {
// //       expect(legacyExpandShorthands.borderBottom('1px')).toEqual([
// //         ['borderBottomWidth', '1px'],
// //       ]);
// //     });
// //     test('solid var(--accent)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--accent)')
// //       ).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--accent)'],
// //       ]);
// //     });
// //     test('solid', () => {
// //       expect(legacyExpandShorthands.borderBottom('solid')).toEqual([
// //         ['borderBottomStyle', 'solid'],
// //       ]);
// //     });
// //     test('1px var(--media-inner-border) solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '1px var(--media-inner-border) solid'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('solid var(--divider) 1px', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('solid var(--divider) 1px')
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--divider)'],
// //       ]);
// //     });
// //     test('thin solid var(--always-gray-40)', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom('thin solid var(--always-gray-40)')
// //       ).toEqual([
// //         ['borderBottomWidth', 'thin'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--always-gray-40)'],
// //       ]);
// //     });
// //     test('1px var(--media-inner-border) solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderBottom(
// //           '1px var(--media-inner-border) solid'
// //         )
// //       ).toEqual([
// //         ['borderBottomWidth', '1px'],
// //         ['borderBottomStyle', 'solid'],
// //         ['borderBottomColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //   });
// //   describe('borderStart', () => {
// //     test('1px var(--media-inner-border) solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderStart(
// //           '1px var(--media-inner-border) solid'
// //         )
// //       ).toEqual([
// //         ['borderStartWidth', '1px'],
// //         ['borderStartStyle', 'solid'],
// //         ['borderStartColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('solid var(--media-inner-border)', () => {
// //       expect(
// //         legacyExpandShorthands.borderStart('solid var(--media-inner-border)')
// //       ).toEqual([
// //         ['borderStartStyle', 'solid'],
// //         ['borderStartColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //     test('var(--media-inner-border) 1px solid', () => {
// //       expect(
// //         legacyExpandShorthands.borderStart(
// //           'var(--media-inner-border) 1px solid'
// //         )
// //       ).toEqual([
// //         ['borderStartWidth', '1px'],
// //         ['borderStartStyle', 'solid'],
// //         ['borderStartColor', 'var(--media-inner-border)'],
// //       ]);
// //     });
// //   });
// // });
