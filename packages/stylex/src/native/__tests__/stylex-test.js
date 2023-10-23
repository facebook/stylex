/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { stylex } from '../stylex';

const mockOptions = {
  customProperties: {},
  hover: false,
  viewportHeight: 600,
  viewportWidth: 320,
};

describe('styles', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('animation-delay', () => {
    const styles = stylex.create({
      root: {
        animationDelay: '0.3s',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('animation-duration', () => {
    const styles = stylex.create({
      root: {
        animationDuration: '0.5s',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('background-image', () => {
    const styles = stylex.create({
      root: {
        backgroundImage: 'url(https://placehold.it/300/300',
      },
    });
    stylex.props(styles.root, mockOptions);
    expect(console.warn).toHaveBeenCalled();
  });

  test('border-style', () => {
    const styles = stylex.create({
      root: {
        borderStyle: 'none',
        borderWidth: 10,
      },
      override: {
        borderStyle: 'solid',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
    expect(
      stylex.props([styles.root, styles.override], mockOptions),
    ).toMatchSnapshot();
  });

  test('box-shadow', () => {
    const styles = stylex.create({
      root: {
        boxShadow: '1px 2px 3px 4px red',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        boxShadow: '1px 2px 3px 4px red, 2px 3px 4px 5px blue',
      },
    });
    stylex.props(styles2.root, mockOptions);
    expect(console.warn).toHaveBeenCalledTimes(1);

    const styles3 = stylex.create({
      root: {
        boxShadow: 'inset 1px 2px 3px 4px red',
      },
    });
    stylex.props(styles3.root, mockOptions);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  test('box-sizing: content-box', () => {
    const styles = stylex.create({
      width: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: 10,
        width: 100,

        // Properties unrelated to box sizing pass through
        overflow: 'hidden',
      },
      height: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: 10,
        height: 50,
      },
      maxWidth: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: 10,
        maxWidth: 100,
      },
      minWidth: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: 10,
        minWidth: 100,
      },
      maxHeight: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: 10,
        maxHeight: 50,
      },
      minHeight: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: 10,
        minHeight: 50,
      },
      units: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: '1rem',
        width: '100px',
        height: 50,
      },
      allDifferent: {
        boxSizing: 'content-box',
        borderTopWidth: 1,
        borderRightWidth: 2,
        borderBottomWidth: 3,
        borderLeftWidth: 4,
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 30,
        paddingLeft: 40,
        width: 100,
        height: 100,
      },
      auto: {
        boxSizing: 'content-box',
        borderWidth: 2,
        padding: 10,
        height: 50,
        width: 'auto',
      },
    });
    expect(stylex.props(styles.width, mockOptions)).toMatchSnapshot('width');
    expect(stylex.props(styles.height, mockOptions)).toMatchSnapshot('height');
    expect(stylex.props(styles.maxWidth, mockOptions)).toMatchSnapshot(
      'maxWidth',
    );
    expect(stylex.props(styles.maxHeight, mockOptions)).toMatchSnapshot(
      'maxHeight',
    );
    expect(stylex.props(styles.minWidth, mockOptions)).toMatchSnapshot(
      'minWidth',
    );
    expect(stylex.props(styles.minHeight, mockOptions)).toMatchSnapshot(
      'minHeight',
    );
    expect(stylex.props(styles.units, mockOptions)).toMatchSnapshot('units');
    expect(stylex.props(styles.allDifferent, mockOptions)).toMatchSnapshot(
      'allDifferent',
    );
    expect(stylex.props(styles.auto, mockOptions)).toMatchSnapshot('auto');
  });

  test('direction', () => {
    const styles = stylex.create({
      root: {
        direction: 'ltr',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        direction: 'rtl',
      },
    });
    expect(stylex.props(styles2.root, mockOptions)).toMatchSnapshot();
  });

  test('font-size', () => {
    const styles = stylex.create({
      root: {
        fontSize: '2.5rem',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot('default');

    expect(
      stylex.props(styles.root, { ...mockOptions, fontScale: 2 }),
    ).toMatchSnapshot('fontScale:2');
  });

  test('font-variant', () => {
    const styles = stylex.create({
      root: {
        fontVariant: 'common-ligatures small-caps',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('font-weight', () => {
    const styles = stylex.create({
      root: {
        fontWeight: 900,
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: { fontWeight: 'bold' },
    });
    expect(stylex.props(styles2.root, mockOptions)).toMatchSnapshot();
  });

  test('line-clamp', () => {
    const styles = stylex.create({
      root: {
        lineClamp: 3,
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('line-height', () => {
    const styles = stylex.create({
      numeric: {
        lineHeight: 1.5,
      },
      string: {
        lineHeight: '1.5',
      },
      rem: {
        lineHeight: '1.5rem',
      },
      px: {
        lineHeight: '24px',
      },
    });
    expect(stylex.props(styles.numeric, mockOptions)).toMatchSnapshot(
      'unitless number',
    );
    expect(stylex.props(styles.string, mockOptions)).toMatchSnapshot(
      'unitless string',
    );
    expect(stylex.props(styles.rem, mockOptions)).toMatchSnapshot('rem');
    expect(stylex.props(styles.px, mockOptions)).toMatchSnapshot('px');
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
    expect(stylex.props(styles.contain, mockOptions)).toMatchSnapshot(
      'contain',
    );
    expect(stylex.props(styles.cover, mockOptions)).toMatchSnapshot('contain');
    expect(stylex.props(styles.fill, mockOptions)).toMatchSnapshot('fill');
    expect(stylex.props(styles.scaleDown, mockOptions)).toMatchSnapshot(
      'scaleDown',
    );
    expect(stylex.props(styles.none, mockOptions)).toMatchSnapshot('none');
  });

  test('pointer-events', () => {
    const styles = stylex.create({
      root: {
        pointerEvents: 'none',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
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
    expect(stylex.props(styles.static, mockOptions)).toMatchSnapshot('static');
    expect(stylex.props(styles.relative, mockOptions)).toMatchSnapshot(
      'relative',
    );
    expect(stylex.props(styles.absolute, mockOptions)).toMatchSnapshot(
      'absolute',
    );
    expect(stylex.props(styles.fixed, mockOptions)).toMatchSnapshot('fixed');
    expect(stylex.props(styles.sticky, mockOptions)).toMatchSnapshot('sticky');
    expect(console.warn).toHaveBeenCalledTimes(3);
  });

  test('text-shadow', () => {
    const styles = stylex.create({
      root: {
        textShadow: '1px 2px 3px red',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        textShadow: '1px 2px 3px red, 2px 3px 4px blue',
      },
    });
    expect(stylex.props(styles2.root, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalledTimes(1);
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
    expect(stylex.props(styles.none, mockOptions)).toMatchSnapshot('none');
    expect(stylex.props(styles.matrix, mockOptions)).toMatchSnapshot('matrix');
    expect(stylex.props(styles.perspective, mockOptions)).toMatchSnapshot(
      'perspective',
    );
    expect(stylex.props(styles.rotate, mockOptions)).toMatchSnapshot('rotate');
    expect(stylex.props(styles.scale, mockOptions)).toMatchSnapshot('scale');
    expect(stylex.props(styles.skew, mockOptions)).toMatchSnapshot('skew');
    expect(stylex.props(styles.translate, mockOptions)).toMatchSnapshot(
      'translate',
    );
    expect(stylex.props(styles.rotate, mockOptions)).toMatchSnapshot('rotate');
    expect(stylex.props(styles.mixed, mockOptions)).toMatchSnapshot('mixed');
  });

  test('transition-delay', () => {
    const styles = stylex.create({
      root: {
        transitionDelay: '0.3s',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('transition-duration', () => {
    const styles = stylex.create({
      root: {
        transitionDuration: '0.5s',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('user-select', () => {
    const styles = stylex.create({
      root: {
        userSelect: 'none',
      },
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
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
    expect(stylex.props(styles.middle, mockOptions)).toMatchSnapshot('middle');
    expect(stylex.props(styles.top, mockOptions)).toMatchSnapshot('top');
  });

  test(':hover syntax', () => {
    const styles = stylex.create({
      root: {
        backgroundColor: {
          default: 'red',
          ':hover': 'blue',
        },
      },
    });

    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot(
      'not hovered',
    );

    const hoverOptions = { ...mockOptions, hover: true };
    expect(stylex.props(styles.root, hoverOptions)).toMatchSnapshot('hovered');
  });
});

describe('logical styles', () => {
  test('blockSize', () => {
    const styles = stylex.create({
      blockSize: {
        blockSize: '100px',
      },
      maxBlockSize: {
        maxBlockSize: '100px',
      },
      minBlockSize: {
        minBlockSize: '100px',
      },
    });
    expect(stylex.props(styles.blockSize, mockOptions)).toMatchSnapshot(
      'blockSize',
    );
    expect(
      stylex.props([{ height: 200 }, styles.blockSize], mockOptions),
    ).toMatchSnapshot('blockSize after height');
    expect(stylex.props(styles.maxBlockSize, mockOptions)).toMatchSnapshot(
      'maxBlockSize',
    );
    expect(
      stylex.props([{ maxHeight: 200 }, styles.maxBlockSize], mockOptions),
    ).toMatchSnapshot('maxBlockSize after maxHeight');
    expect(stylex.props(styles.minBlockSize, mockOptions)).toMatchSnapshot(
      'minBlockSize',
    );
    expect(
      stylex.props([{ minHeight: 200 }, styles.minBlockSize], mockOptions),
    ).toMatchSnapshot('minBlockSize after minHeight');
  });

  test('inlineSize', () => {
    const styles = stylex.create({
      inlineSize: {
        inlineSize: '100px',
      },
      maxInlineSize: {
        maxInlineSize: '100px',
      },
      minInlineSize: {
        minInlineSize: '100px',
      },
    });
    expect(stylex.props(styles.inlineSize, mockOptions)).toMatchSnapshot(
      'inlineSize',
    );
    expect(
      stylex.props([{ width: 200 }, styles.inlineSize], mockOptions),
    ).toMatchSnapshot('inlineSize after width');
    expect(stylex.props(styles.maxInlineSize, mockOptions)).toMatchSnapshot(
      'maxInlineSize',
    );
    expect(
      stylex.props([{ maxWidth: 200 }, styles.maxInlineSize], mockOptions),
    ).toMatchSnapshot('maxInlineSize after maxWidth');
    expect(stylex.props(styles.minInlineSize, mockOptions)).toMatchSnapshot(
      'minInlineSize',
    );
    expect(
      stylex.props([{ minWidth: 200 }, styles.minInlineSize], mockOptions),
    ).toMatchSnapshot('minInlineSize after minWidth');
  });

  test('borderBlock', () => {
    const styles = stylex.create({
      borderBlock: {
        borderBlockColor: 'black',
        borderBlockStyle: 'solid',
        borderBlockWidth: 1,
      },
      borderBlockEnd: {
        borderBlockEndColor: 'red',
        borderBlockEndStyle: 'dotted',
        borderBlockEndWidth: 2,
      },
      borderBlockStart: {
        borderBlockStartColor: 'green',
        borderBlockStartStyle: 'dashed',
        borderBlockStartWidth: 3,
      },
    });
    expect(stylex.props(styles.borderBlock, mockOptions)).toMatchSnapshot(
      'borderBlock',
    );
    expect(stylex.props(styles.borderBlockEnd, mockOptions)).toMatchSnapshot(
      'borderBlockEnd',
    );
    expect(stylex.props(styles.borderBlockStart, mockOptions)).toMatchSnapshot(
      'borderBlockStart',
    );

    expect(
      stylex.props([styles.borderBlockEnd, styles.borderBlock], mockOptions),
    ).toMatchSnapshot('borderBlock after borderBlockEnd');
    expect(
      stylex.props([styles.borderBlockStart, styles.borderBlock], mockOptions),
    ).toMatchSnapshot('borderBlock after borderBlockStart');
  });

  test('borderInline', () => {
    const styles = stylex.create({
      borderInline: {
        borderInlineColor: 'black',
        borderInlineStyle: 'solid',
        borderInlineWidth: 1,
      },
      borderInlineEnd: {
        borderInlineEndColor: 'red',
        borderInlineEndStyle: 'dotted',
        borderInlineEndWidth: 2,
      },
      borderInlineStart: {
        borderInlineStartColor: 'green',
        borderInlineStartStyle: 'dashed',
        borderInlineStartWidth: 3,
      },
    });
    expect(stylex.props(styles.borderInline, mockOptions)).toMatchSnapshot(
      'borderInline',
    );
    expect(stylex.props(styles.borderInlineEnd, mockOptions)).toMatchSnapshot(
      'borderInlineEnd',
    );
    expect(stylex.props(styles.borderInlineStart, mockOptions)).toMatchSnapshot(
      'borderInlineStart',
    );

    expect(
      stylex.props([styles.borderInlineEnd, styles.borderInline], mockOptions),
    ).toMatchSnapshot('borderInline after borderInlineEnd');
    expect(
      stylex.props(
        [styles.borderInlineStart, styles.borderInline],
        mockOptions,
      ),
    ).toMatchSnapshot('borderInline after borderInlineStart');
  });

  test('borderRadius', () => {
    const styles = stylex.create({
      startstart: {
        borderStartStartRadius: 10,
      },
      startend: {
        borderStartEndRadius: 10,
      },
      endstart: {
        borderEndStartRadius: 10,
      },
      endend: {
        borderEndEndRadius: 10,
      },
    });
    expect(stylex.props(styles.startstart, mockOptions)).toMatchSnapshot(
      'startstart',
    );
    expect(stylex.props(styles.startend, mockOptions)).toMatchSnapshot(
      'startend',
    );
    expect(stylex.props(styles.endstart, mockOptions)).toMatchSnapshot(
      'endstart',
    );
    expect(stylex.props(styles.endend, mockOptions)).toMatchSnapshot('endend');
  });

  test.skip('borderStyle', () => {
    const styles = stylex.create({
      root: {},
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test.skip('borderWidth', () => {
    const styles = stylex.create({
      root: {},
    });
    expect(stylex.props(styles.root, mockOptions)).toMatchSnapshot();
  });

  test('inset', () => {
    const styles = stylex.create({
      inset: {
        inset: 1,
      },
      insetBlock: {
        insetBlock: 2,
      },
      insetBlockStart: {
        insetBlockStart: 3,
      },
      insetBlockEnd: {
        insetBlockEnd: 4,
      },
      insetInline: {
        insetInline: 5,
      },
      insetInlineStart: {
        insetInlineStart: 6,
      },
      insetInlineEnd: {
        insetInlineEnd: 7,
      },
    });
    expect(stylex.props(styles.inset, mockOptions)).toMatchSnapshot('inset');
    expect(stylex.props(styles.insetBlock, mockOptions)).toMatchSnapshot(
      'insetBlock',
    );
    expect(stylex.props(styles.insetBlockStart, mockOptions)).toMatchSnapshot(
      'insetBlockStart',
    );
    expect(stylex.props(styles.insetBlockEnd, mockOptions)).toMatchSnapshot(
      'insetBlockEnd',
    );
    expect(stylex.props(styles.insetInline, mockOptions)).toMatchSnapshot(
      'insetInline',
    );
    expect(stylex.props(styles.insetInlineStart, mockOptions)).toMatchSnapshot(
      'insetInlineStart',
    );
    expect(stylex.props(styles.insetInlineEnd, mockOptions)).toMatchSnapshot(
      'insetInlineEnd',
    );

    expect(
      stylex.props(
        [
          { left: 10, right: 10, bottom: 100, top: 100 },
          styles.insetBlockStart,
        ],
        mockOptions,
      ),
    ).toMatchSnapshot('inset vs top');
    expect(
      stylex.props(
        [{ bottom: 100, top: 100 }, styles.insetBlockStart],
        mockOptions,
      ),
    ).toMatchSnapshot('insetBlock vs top');
    expect(
      stylex.props([{ top: 100 }, styles.insetBlockStart], mockOptions),
    ).toMatchSnapshot('insetBlockStart vs top');
    expect(
      stylex.props([{ bottom: 100 }, styles.insetBlockEnd], mockOptions),
    ).toMatchSnapshot('insetBlockEnd vs bottom');
  });

  test('margin', () => {
    const styles = stylex.create({
      marginBlock: {
        marginBlock: 1,
      },
      marginBlockStart: {
        marginBlockStart: 2,
      },
      marginBlockEnd: {
        marginBlockEnd: 3,
      },
      marginInline: {
        marginInline: 1,
      },
      marginInlineStart: {
        marginInlineStart: 2,
      },
      marginInlineEnd: {
        marginInlineEnd: 3,
      },
    });
    expect(stylex.props(styles.marginBlock, mockOptions)).toMatchSnapshot(
      'marginBlock',
    );
    expect(stylex.props(styles.marginBlockStart, mockOptions)).toMatchSnapshot(
      'marginBlockStart',
    );
    expect(stylex.props(styles.marginBlockEnd, mockOptions)).toMatchSnapshot(
      'marginBlockEnd',
    );
    expect(stylex.props(styles.marginInline, mockOptions)).toMatchSnapshot(
      'marginInline',
    );
    expect(stylex.props(styles.marginInlineStart, mockOptions)).toMatchSnapshot(
      'marginInlineStart',
    );
    expect(stylex.props(styles.marginInlineEnd, mockOptions)).toMatchSnapshot(
      'marginInlineEnd',
    );
  });

  test('padding', () => {
    const styles = stylex.create({
      paddingBlock: {
        paddingBlock: 1,
      },
      paddingBlockStart: {
        paddingBlockStart: 2,
      },
      paddingBlockEnd: {
        paddingBlockEnd: 3,
      },
      paddingInline: {
        paddingInline: 1,
      },
      paddingInlineStart: {
        paddingInlineStart: 2,
      },
      paddingInlineEnd: {
        paddingInlineEnd: 3,
      },
    });
    expect(stylex.props(styles.paddingBlock, mockOptions)).toMatchSnapshot(
      'paddingBlock',
    );
    expect(stylex.props(styles.paddingBlockStart, mockOptions)).toMatchSnapshot(
      'paddingBlockStart',
    );
    expect(stylex.props(styles.paddingBlockEnd, mockOptions)).toMatchSnapshot(
      'paddingBlockEnd',
    );
    expect(stylex.props(styles.paddingInline, mockOptions)).toMatchSnapshot(
      'paddingInline',
    );
    expect(
      stylex.props(styles.paddingInlineStart, mockOptions),
    ).toMatchSnapshot('paddingInlineStart');
    expect(stylex.props(styles.paddingInlineEnd, mockOptions)).toMatchSnapshot(
      'paddingInlineEnd',
    );
  });

  test('textAlign', () => {
    const styles = stylex.create({
      start: {
        textAlign: 'start',
      },
      end: {
        textAlign: 'end',
      },
    });
    expect(stylex.props(styles.start, mockOptions)).toMatchSnapshot('start');
    expect(stylex.props(styles.end, mockOptions)).toMatchSnapshot('end');
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
      expect(stylex.props(styles.underTest, mockOptions)).toMatchSnapshot();
    });
  }

  test(`${value} "em" units based on inherited font-size`, () => {
    const styles = stylex.create({
      underTest: {
        width: `${value}em`,
      },
    });
    expect(
      stylex.props(styles.underTest, {
        ...mockOptions,
        inheritedFontSize: 12,
      }),
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
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.error).toHaveBeenCalledWith(
      'stylex: Unrecognized custom property "--unprovided"',
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
      stylex.props(underTest, {
        ...mockOptions,
        customProperties: {
          slightlyDarkerBlack: '#333',
          theBestWidth: 42,
        },
      }),
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
    const props = stylex.props(underTest, {
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

describe('unsupported style properties', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('"filter"', () => {
    const { underTest } = stylex.create({
      underTest: {
        filter: 'blur(1px)',
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginStart"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginStart: 10,
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginEnd"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginEnd: 10,
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginHorizontal"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginHorizontal: 10,
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginVertical"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginVertical: 10,
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"paddingHorizontal"', () => {
    const { underTest } = stylex.create({
      underTest: {
        paddingHorizontal: 10,
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"paddingVertical"', () => {
    const { underTest } = stylex.create({
      underTest: {
        paddingVertical: 10,
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"transitionProperty" passthrough', () => {
    const { underTest } = stylex.create({
      underTest: {
        transitionProperty: 'opacity',
      },
    });
    expect(
      stylex.props(underTest, {
        ...mockOptions,
        passthroughProperties: ['transitionProperty'],
      }),
    ).toMatchSnapshot();
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('unsupported style values', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn');
    console.warn.mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('calc', () => {
    const { underTest } = stylex.create({
      underTest: {
        width: 'calc(2 * 1rem)',
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('inherit', () => {
    const { underTest } = stylex.create({
      underTest: {
        fontSize: 'inherit',
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('initial', () => {
    const { underTest } = stylex.create({
      underTest: {
        fontSize: 'initial',
      },
    });
    expect(stylex.props(underTest, mockOptions)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });
});
