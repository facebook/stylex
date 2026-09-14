/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import getCompressedClassName, {
  valueShorthands,
} from '../compressed-class-name';
import { propertyShorthands } from '../../property-shorthands';

const compress = (
  property: string,
  value: string | $ReadOnlyArray<string>,
  hasModifiers: boolean = false,
  classNamePrefix: string = 'x',
) => getCompressedClassName(property, value, hasModifiers, classNamePrefix);

describe('compressed class names', () => {
  test('compresses common numeric declarations', () => {
    expect(compress('margin', '0')).toBe('m0');
    expect(compress('margin', '4px')).toBe('m4');
    expect(compress('paddingTop', '16px')).toBe('pt16');
    expect(compress('width', '100%')).toBe('w100p');
    expect(compress('opacity', '.5')).toBe('op0d5');
    expect(compress('margin', '-4px')).toBe('m-4');
  });

  test('compresses common keyword declarations', () => {
    expect(compress('display', 'flex')).toBe('d-f');
    expect(compress('position', 'absolute')).toBe('po-a');
    expect(compress('flexDirection', 'column-reverse')).toBe('fd-cr');
    expect(compress('backgroundColor', 'red')).toBe('bg-r');
    expect(compress('color', '#fff')).toBe('c-fff');
  });

  test('does not compress names longer than six characters', () => {
    expect(compress('paddingTop', '1234px')).toBe('pt1234');
    expect(compress('paddingTop', '12345px')).toBeNull();
    expect(compress('backgroundColor', '#ffff')).toBeNull();
  });

  test('falls back for complex or potentially conflicting declarations', () => {
    expect(compress('animationTimeline', 'auto')).toBeNull();
    expect(compress('margin', 'var(--spacing)')).toBeNull();
    expect(compress('margin', ['0', '4px'])).toBeNull();
    expect(compress('margin', '4px', true)).toBeNull();
    expect(compress('margin', '4')).toBeNull();
    expect(compress('lineHeight', '4px')).toBeNull();
    expect(compress('margin', '0', false, 'm')).toBeNull();
    expect(compress('margin', '0', false, '')).toBeNull();
  });

  test('hardcoded names are unique and never longer than six characters', () => {
    for (const [property, values] of Object.entries(valueShorthands)) {
      const propertyShorthand = propertyShorthands[property];
      expect(propertyShorthand).toBeDefined();

      const suffixes = Object.values(values);
      expect(new Set(suffixes).size).toBe(suffixes.length);
      for (const suffix of suffixes) {
        expect(`${propertyShorthand}-${suffix}`).toMatch(/^[a-z-]+$/);
        expect(`${propertyShorthand}-${suffix}`.length).toBeLessThanOrEqual(6);
      }
    }
  });
});
