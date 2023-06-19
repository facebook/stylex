/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { stylex } from '../stylex';

const mockOptions = {
  customProperties: {},
  viewportHeight: 600,
  viewportWidth: 320,
};

describe('styles', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('background-image', () => {
    const styles = stylex.create({
      root: {
        backgroundImage: 'url(https://placehold.it/300/300',
      },
    });
    stylex.spread(styles.root, mockOptions);
    expect(console.error).toHaveBeenCalled();
  });

  test('box-shadow', () => {
    const styles = stylex.create({
      root: {
        boxShadow: '1px 2px 3px 4px red',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        boxShadow: '1px 2px 3px 4px red, 2px 3px 4px 5px blue',
      },
    });
    stylex.spread(styles2.root, mockOptions);
    expect(console.error).toHaveBeenCalledTimes(1);

    const styles3 = stylex.create({
      root: {
        boxShadow: 'inset 1px 2px 3px 4px red',
      },
    });
    stylex.spread(styles3.root, mockOptions);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  test('direction', () => {
    const styles = stylex.create({
      root: {
        direction: 'ltr',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        direction: 'rtl',
      },
    });
    expect(stylex.spread(styles2.root, mockOptions)).toMatchSnapshot();
  });

  test('font-size', () => {
    const styles = stylex.create({
      root: {
        fontSize: '2.5rem',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot('default');

    expect(
      stylex.spread(styles.root, { ...mockOptions, fontScale: 2 })
    ).toMatchSnapshot('fontScale:2');
  });

  test('font-variant', () => {
    const styles = stylex.create({
      root: {
        fontVariant: 'common-ligatures small-caps',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('font-weight', () => {
    const styles = stylex.create({
      root: {
        fontWeight: 900,
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: { fontWeight: 'bold' },
    });
    expect(stylex.spread(styles2.root, mockOptions)).toMatchSnapshot();
  });

  test('line-clamp', () => {
    const styles = stylex.create({
      root: {
        lineClamp: 3,
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('object-fit', () => {
    const styles = stylex.create({
      contain: {
        objectFit: 'contain',
      },
      cover: {
        objectFit: 'cover',
      },
      fill: {
        objectFit: 'fill',
      },
      scaleDown: {
        objectFit: 'scale-down',
      },
      none: {
        objectFit: 'none',
      },
    });
    expect(stylex.spread(styles.contain, mockOptions)).toMatchSnapshot(
      'contain'
    );
    expect(stylex.spread(styles.cover, mockOptions)).toMatchSnapshot('contain');
    expect(stylex.spread(styles.fill, mockOptions)).toMatchSnapshot('fill');
    expect(stylex.spread(styles.scaleDown, mockOptions)).toMatchSnapshot(
      'scaleDown'
    );
    expect(stylex.spread(styles.none, mockOptions)).toMatchSnapshot('none');
  });

  test('pointer-events', () => {
    const styles = stylex.create({
      root: {
        pointerEvents: 'none',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('position', () => {
    const styles = stylex.create({
      static: {
        position: 'static',
      },
      relative: {
        position: 'relative',
      },
      absolute: {
        position: 'absolute',
      },
      fixed: {
        position: 'fixed',
      },
      sticky: {
        position: 'sticky',
      },
    });
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(stylex.spread(styles.static, mockOptions)).toMatchSnapshot('static');
    expect(stylex.spread(styles.relative, mockOptions)).toMatchSnapshot(
      'relative'
    );
    expect(stylex.spread(styles.absolute, mockOptions)).toMatchSnapshot(
      'absolute'
    );
    expect(stylex.spread(styles.fixed, mockOptions)).toMatchSnapshot('fixed');
    expect(stylex.spread(styles.sticky, mockOptions)).toMatchSnapshot('sticky');
  });

  test('text-shadow', () => {
    const styles = stylex.create({
      root: {
        textShadow: '1px 2px 3px red',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        textShadow: '1px 2px 3px red, 2px 3px 4px blue',
      },
    });
    expect(stylex.spread(styles2.root, mockOptions)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  test('transform', () => {
    const styles = stylex.create({
      none: {
        transform: 'none',
      },
      matrix: {
        transform: 'matrix(0.1, 1, -0.3, 1, 0, 0)',
      },
      perspective: {
        transform: 'perspective(10px)',
      },
      rotate: {
        transform:
          'rotate(10deg) rotateX(20deg) rotateY(30deg) rotateZ(40deg) rotate3d(0, 0.5, 1, 90deg)',
      },
      scale: {
        transform: 'scale(1, 2) scaleX(1) scaleY(2) scaleZ(3) scale3d(1, 2, 3)',
      },
      skew: {
        transform: 'skew(10deg, 15deg) skewX(20deg) skewY(30deg)',
      },
      translate: {
        transform:
          'translate(10px, 20px) translateX(11px) translateY(12px) translateZ(13px) translate3d(20px, 30px, 40px)',
      },
      mixed: {
        transform: `
          rotateX(1deg) rotateY(2deg) rotateZ(3deg) rotate3d(1deg, 2deg, 3deg)
          scale(1) scaleX(2) scaleY(3) scaleZ(4) scale3d(1,2,3)
          translateX(1px) translateY(1em) translateZ(1rem) translate3d(1px, 1em, 1rem)
        `,
      },
    });
    expect(stylex.spread(styles.none, mockOptions)).toMatchSnapshot('none');
    expect(stylex.spread(styles.matrix, mockOptions)).toMatchSnapshot('matrix');
    expect(stylex.spread(styles.perspective, mockOptions)).toMatchSnapshot(
      'perspective'
    );
    expect(stylex.spread(styles.rotate, mockOptions)).toMatchSnapshot('rotate');
    expect(stylex.spread(styles.scale, mockOptions)).toMatchSnapshot('scale');
    expect(stylex.spread(styles.skew, mockOptions)).toMatchSnapshot('skew');
    expect(stylex.spread(styles.translate, mockOptions)).toMatchSnapshot(
      'translate'
    );
    expect(stylex.spread(styles.rotate, mockOptions)).toMatchSnapshot('rotate');
    expect(stylex.spread(styles.mixed, mockOptions)).toMatchSnapshot('mixed');
  });

  test('user-select', () => {
    const styles = stylex.create({
      root: {
        userSelect: 'none',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('vertical-align', () => {
    const styles = stylex.create({
      middle: {
        verticalAlign: 'middle',
      },
      top: {
        verticalAlign: 'top',
      },
    });
    expect(stylex.spread(styles.middle, mockOptions)).toMatchSnapshot('middle');
    expect(stylex.spread(styles.top, mockOptions)).toMatchSnapshot('top');
  });

  test.skip('logical border short-forms', () => {
    const styles = stylex.create({
      root: {},
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });

  test.skip('logical border long-forms', () => {
    const styles = stylex.create({
      root: {},
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });

  test.skip('logical inset short-forms', () => {
    const styles = stylex.create({
      root: {
        insetBlock: 5,
        insetInline: 10,
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });

  test.skip('logical text alignment', () => {
    const styles = stylex.create({
      root: {
        textAlign: 'start',
      },
    });
    expect(stylex.spread(styles.root, mockOptions)).toMatchSnapshot();
  });
});

describe('length units', () => {
  const unitsToTest = ['em', 'px', 'rem', 'vh', 'vmax', 'vmin', 'vw'];
  const value = 10;

  for (const unitToTest of unitsToTest) {
    test(`${value} "${unitToTest}" units are resolved to pixels`, () => {
      const styles = stylex.create({
        underTest: {
          width: `${value}${unitToTest}`,
        },
      });
      expect(stylex.spread(styles.underTest, mockOptions)).toMatchSnapshot();
    });
  }

  test(`${value} "em" units based on inherited font-size`, () => {
    const styles = stylex.create({
      underTest: {
        width: `${value}em`,
      },
    });
    expect(
      stylex.spread(styles.underTest, { ...mockOptions, inheritedFontSize: 12 })
    ).toMatchSnapshot();
  });
});

describe('custom properties', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('filters out the property and emits a warning when encountering a variable name which has not been provided', () => {
    const { underTest } = stylex.create({
      underTest: {
        width: 'var(--unprovided)',
      },
    });
    expect(stylex.spread(underTest, mockOptions)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalledWith(
      'stylex: Unrecognized custom property "--unprovided"'
    );
  });

  test("resolves custom properties' values", () => {
    const { underTest } = stylex.create({
      underTest: {
        color: 'var(--slightly-darker-black)',
        width: 'var(--the-best-width)',
      },
    });
    expect(
      stylex.spread(underTest, {
        ...mockOptions,
        customProperties: {
          slightlyDarkerBlack: '#333',
          theBestWidth: 42,
        },
      })
    ).toMatchSnapshot();
  });
});

expect.extend({
  toMatchWindowDimensions(query, windowSize) {
    const { height, width } = windowSize;
    const EXPECTED_MATCHED_VALUE = 500;
    const { underTest } = stylex.create({
      underTest: {
        [`@media ${query}`]: {
          width: EXPECTED_MATCHED_VALUE,
        },
      },
    });
    const props = stylex.spread(underTest, {
      viewportHeight: height,
      viewportWidth: width,
    });
    const actualValue = props.style.width;
    if (actualValue === EXPECTED_MATCHED_VALUE) {
      return {
        pass: true,
        message: () =>
          `expected media query ${query} not to match in a window of width ${width} and height ${height}`,
      };
    } else {
      return {
        pass: false,
        message: () =>
          `expected media query ${query} to match in a window of width ${width} and height ${height}`,
      };
    }
  },
});

describe('media queries', () => {
  test('matches a "min-width" query', () => {
    expect('(min-width: 400px)').toMatchWindowDimensions({
      width: 450,
      height: 0,
    });
    expect('(min-width: 400px)').not.toMatchWindowDimensions({
      width: 350,
      height: 0,
    });
  });

  test('matches a "max-width" query', () => {
    expect('(max-width: 400px)').toMatchWindowDimensions({
      width: 350,
      height: 0,
    });
    expect('(max-width: 400px)').not.toMatchWindowDimensions({
      width: 450,
      height: 0,
    });
  });

  test('matches a "min-height" query', () => {
    expect('(min-height: 400px)').toMatchWindowDimensions({
      width: 0,
      height: 450,
    });
    expect('(min-height: 400px)').not.toMatchWindowDimensions({
      width: 0,
      height: 350,
    });
  });

  test('matches a "max-height" query', () => {
    expect('(max-height: 400px)').toMatchWindowDimensions({
      width: 0,
      height: 350,
    });
    expect('(max-height: 400px)').not.toMatchWindowDimensions({
      width: 0,
      height: 450,
    });
  });
});

describe('unsupported style values', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('calc', () => {
    const { underTest } = stylex.create({
      underTest: {
        width: 'calc(2 * 1rem)',
      },
    });
    expect(stylex.spread(underTest, mockOptions)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalled();
  });

  test('inherit', () => {
    const { underTest } = stylex.create({
      underTest: {
        fontSize: 'inherit',
      },
    });
    expect(stylex.spread(underTest, mockOptions)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalled();
  });

  test('initial', () => {
    const { underTest } = stylex.create({
      underTest: {
        fontSize: 'initial',
      },
    });
    expect(stylex.spread(underTest, mockOptions)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalled();
  });
});
