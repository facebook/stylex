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
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
  });

  test('animation-duration', () => {
    const styles = stylex.create({
      root: {
        animationDuration: '0.5s',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
  });

  test('background-image', () => {
    const styles = stylex.create({
      root: {
        backgroundImage: 'url(https://placehold.it/300/300',
      },
    });
    stylex.props.call(mockOptions, styles.root);
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
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
    expect(
      stylex.props.call(mockOptions, styles.root, styles.override),
    ).toMatchSnapshot();
  });

  test('box-shadow', () => {
    const styles = stylex.create({
      root: {
        boxShadow: '1px 2px 3px 4px red',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        boxShadow: '1px 2px 3px 4px red, 2px 3px 4px 5px blue',
      },
    });
    stylex.props.call(mockOptions, styles2.root);
    expect(console.warn).toHaveBeenCalledTimes(1);

    const styles3 = stylex.create({
      root: {
        boxShadow: 'inset 1px 2px 3px 4px red',
      },
    });
    stylex.props.call(mockOptions, styles3.root);
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
    expect(stylex.props.call(mockOptions, styles.width)).toMatchSnapshot(
      'width',
    );
    expect(stylex.props.call(mockOptions, styles.height)).toMatchSnapshot(
      'height',
    );
    expect(stylex.props.call(mockOptions, styles.maxWidth)).toMatchSnapshot(
      'maxWidth',
    );
    expect(stylex.props.call(mockOptions, styles.maxHeight)).toMatchSnapshot(
      'maxHeight',
    );
    expect(stylex.props.call(mockOptions, styles.minWidth)).toMatchSnapshot(
      'minWidth',
    );
    expect(stylex.props.call(mockOptions, styles.minHeight)).toMatchSnapshot(
      'minHeight',
    );
    expect(stylex.props.call(mockOptions, styles.units)).toMatchSnapshot(
      'units',
    );
    expect(stylex.props.call(mockOptions, styles.allDifferent)).toMatchSnapshot(
      'allDifferent',
    );
    expect(stylex.props.call(mockOptions, styles.auto)).toMatchSnapshot('auto');
  });

  test('direction', () => {
    const styles = stylex.create({
      root: {
        direction: 'ltr',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        direction: 'rtl',
      },
    });
    expect(stylex.props.call(mockOptions, styles2.root)).toMatchSnapshot();
  });

  test('font-size', () => {
    const styles = stylex.create({
      root: {
        fontSize: '2.5rem',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot(
      'default',
    );

    expect(
      stylex.props.call({ ...mockOptions, fontScale: 2 }, styles.root),
    ).toMatchSnapshot('fontScale:2');
  });

  test('font-variant', () => {
    const styles = stylex.create({
      root: {
        fontVariant: 'common-ligatures small-caps',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
  });

  test('font-weight', () => {
    const styles = stylex.create({
      root: {
        fontWeight: 900,
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: { fontWeight: 'bold' },
    });
    expect(stylex.props.call(mockOptions, styles2.root)).toMatchSnapshot();
  });

  test('line-clamp', () => {
    const styles = stylex.create({
      root: {
        lineClamp: 3,
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
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
    expect(stylex.props.call(mockOptions, styles.numeric)).toMatchSnapshot(
      'unitless number',
    );
    expect(stylex.props.call(mockOptions, styles.string)).toMatchSnapshot(
      'unitless string',
    );
    expect(stylex.props.call(mockOptions, styles.rem)).toMatchSnapshot('rem');
    expect(stylex.props.call(mockOptions, styles.px)).toMatchSnapshot('px');
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
    expect(stylex.props.call(mockOptions, styles.contain)).toMatchSnapshot(
      'contain',
    );
    expect(stylex.props.call(mockOptions, styles.cover)).toMatchSnapshot(
      'contain',
    );
    expect(stylex.props.call(mockOptions, styles.fill)).toMatchSnapshot('fill');
    expect(stylex.props.call(mockOptions, styles.scaleDown)).toMatchSnapshot(
      'scaleDown',
    );
    expect(stylex.props.call(mockOptions, styles.none)).toMatchSnapshot('none');
  });

  test('pointer-events', () => {
    const styles = stylex.create({
      root: {
        pointerEvents: 'none',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
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
    expect(stylex.props.call(mockOptions, styles.static)).toMatchSnapshot(
      'static',
    );
    expect(stylex.props.call(mockOptions, styles.relative)).toMatchSnapshot(
      'relative',
    );
    expect(stylex.props.call(mockOptions, styles.absolute)).toMatchSnapshot(
      'absolute',
    );
    expect(stylex.props.call(mockOptions, styles.fixed)).toMatchSnapshot(
      'fixed',
    );
    expect(stylex.props.call(mockOptions, styles.sticky)).toMatchSnapshot(
      'sticky',
    );
    expect(console.warn).toHaveBeenCalledTimes(3);
  });

  test('text-shadow', () => {
    const styles = stylex.create({
      root: {
        textShadow: '1px 2px 3px red',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();

    const styles2 = stylex.create({
      root: {
        textShadow: '1px 2px 3px red, 2px 3px 4px blue',
      },
    });
    expect(stylex.props.call(mockOptions, styles2.root)).toMatchSnapshot();
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
    expect(stylex.props.call(mockOptions, styles.none)).toMatchSnapshot('none');
    expect(stylex.props.call(mockOptions, styles.matrix)).toMatchSnapshot(
      'matrix',
    );
    expect(stylex.props.call(mockOptions, styles.perspective)).toMatchSnapshot(
      'perspective',
    );
    expect(stylex.props.call(mockOptions, styles.rotate)).toMatchSnapshot(
      'rotate',
    );
    expect(stylex.props.call(mockOptions, styles.scale)).toMatchSnapshot(
      'scale',
    );
    expect(stylex.props.call(mockOptions, styles.skew)).toMatchSnapshot('skew');
    expect(stylex.props.call(mockOptions, styles.translate)).toMatchSnapshot(
      'translate',
    );
    expect(stylex.props.call(mockOptions, styles.rotate)).toMatchSnapshot(
      'rotate',
    );
    expect(stylex.props.call(mockOptions, styles.mixed)).toMatchSnapshot(
      'mixed',
    );
  });

  test('transition-delay', () => {
    const styles = stylex.create({
      root: {
        transitionDelay: '0.3s',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
  });

  test('transition-duration', () => {
    const styles = stylex.create({
      root: {
        transitionDuration: '0.5s',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
  });

  test('user-select', () => {
    const styles = stylex.create({
      root: {
        userSelect: 'none',
      },
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
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
    expect(stylex.props.call(mockOptions, styles.middle)).toMatchSnapshot(
      'middle',
    );
    expect(stylex.props.call(mockOptions, styles.top)).toMatchSnapshot('top');
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

    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot(
      'not hovered',
    );

    const hoverOptions = { ...mockOptions, hover: true };
    expect(stylex.props.call(hoverOptions, styles.root)).toMatchSnapshot(
      'hovered',
    );
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
    expect(stylex.props.call(mockOptions, styles.blockSize)).toMatchSnapshot(
      'blockSize',
    );
    expect(
      stylex.props.call(mockOptions, { height: 200 }, styles.blockSize),
    ).toMatchSnapshot('blockSize after height');
    expect(stylex.props.call(mockOptions, styles.maxBlockSize)).toMatchSnapshot(
      'maxBlockSize',
    );
    expect(
      stylex.props.call(mockOptions, { maxHeight: 200 }, styles.maxBlockSize),
    ).toMatchSnapshot('maxBlockSize after maxHeight');
    expect(stylex.props.call(mockOptions, styles.minBlockSize)).toMatchSnapshot(
      'minBlockSize',
    );
    expect(
      stylex.props.call(mockOptions, { minHeight: 200 }, styles.minBlockSize),
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
    expect(stylex.props.call(mockOptions, styles.inlineSize)).toMatchSnapshot(
      'inlineSize',
    );
    expect(
      stylex.props.call(mockOptions, { width: 200 }, styles.inlineSize),
    ).toMatchSnapshot('inlineSize after width');
    expect(
      stylex.props.call(mockOptions, styles.maxInlineSize),
    ).toMatchSnapshot('maxInlineSize');
    expect(
      stylex.props.call(mockOptions, { maxWidth: 200 }, styles.maxInlineSize),
    ).toMatchSnapshot('maxInlineSize after maxWidth');
    expect(
      stylex.props.call(mockOptions, styles.minInlineSize),
    ).toMatchSnapshot('minInlineSize');
    expect(
      stylex.props.call(mockOptions, { minWidth: 200 }, styles.minInlineSize),
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
    expect(stylex.props.call(mockOptions, styles.borderBlock)).toMatchSnapshot(
      'borderBlock',
    );
    expect(
      stylex.props.call(mockOptions, styles.borderBlockEnd),
    ).toMatchSnapshot('borderBlockEnd');
    expect(
      stylex.props.call(mockOptions, styles.borderBlockStart),
    ).toMatchSnapshot('borderBlockStart');

    expect(
      stylex.props.call(mockOptions, styles.borderBlockEnd, styles.borderBlock),
    ).toMatchSnapshot('borderBlock after borderBlockEnd');
    expect(
      stylex.props.call(
        mockOptions,
        styles.borderBlockStart,
        styles.borderBlock,
      ),
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
    expect(stylex.props.call(mockOptions, styles.borderInline)).toMatchSnapshot(
      'borderInline',
    );
    expect(
      stylex.props.call(mockOptions, styles.borderInlineEnd),
    ).toMatchSnapshot('borderInlineEnd');
    expect(
      stylex.props.call(mockOptions, styles.borderInlineStart),
    ).toMatchSnapshot('borderInlineStart');

    expect(
      stylex.props.call(
        mockOptions,
        styles.borderInlineEnd,
        styles.borderInline,
      ),
    ).toMatchSnapshot('borderInline after borderInlineEnd');
    expect(
      stylex.props.call(
        mockOptions,
        styles.borderInlineStart,
        styles.borderInline,
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
    expect(stylex.props.call(mockOptions, styles.startstart)).toMatchSnapshot(
      'startstart',
    );
    expect(stylex.props.call(mockOptions, styles.startend)).toMatchSnapshot(
      'startend',
    );
    expect(stylex.props.call(mockOptions, styles.endstart)).toMatchSnapshot(
      'endstart',
    );
    expect(stylex.props.call(mockOptions, styles.endend)).toMatchSnapshot(
      'endend',
    );
  });

  test.skip('borderStyle', () => {
    const styles = stylex.create({
      root: {},
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
  });

  test.skip('borderWidth', () => {
    const styles = stylex.create({
      root: {},
    });
    expect(stylex.props.call(mockOptions, styles.root)).toMatchSnapshot();
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
    expect(stylex.props.call(mockOptions, styles.inset)).toMatchSnapshot(
      'inset',
    );
    expect(stylex.props.call(mockOptions, styles.insetBlock)).toMatchSnapshot(
      'insetBlock',
    );
    expect(
      stylex.props.call(mockOptions, styles.insetBlockStart),
    ).toMatchSnapshot('insetBlockStart');
    expect(
      stylex.props.call(mockOptions, styles.insetBlockEnd),
    ).toMatchSnapshot('insetBlockEnd');
    expect(stylex.props.call(mockOptions, styles.insetInline)).toMatchSnapshot(
      'insetInline',
    );
    expect(
      stylex.props.call(mockOptions, styles.insetInlineStart),
    ).toMatchSnapshot('insetInlineStart');
    expect(
      stylex.props.call(mockOptions, styles.insetInlineEnd),
    ).toMatchSnapshot('insetInlineEnd');

    expect(
      stylex.props.call(
        mockOptions,
        { left: 10, right: 10, bottom: 100, top: 100 },
        styles.insetBlockStart,
      ),
    ).toMatchSnapshot('inset vs top');
    expect(
      stylex.props.call(
        mockOptions,
        { bottom: 100, top: 100 },
        styles.insetBlockStart,
      ),
    ).toMatchSnapshot('insetBlock vs top');
    expect(
      stylex.props.call(mockOptions, { top: 100 }, styles.insetBlockStart),
    ).toMatchSnapshot('insetBlockStart vs top');
    expect(
      stylex.props.call(mockOptions, { bottom: 100 }, styles.insetBlockEnd),
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
    expect(stylex.props.call(mockOptions, styles.marginBlock)).toMatchSnapshot(
      'marginBlock',
    );
    expect(
      stylex.props.call(mockOptions, styles.marginBlockStart),
    ).toMatchSnapshot('marginBlockStart');
    expect(
      stylex.props.call(mockOptions, styles.marginBlockEnd),
    ).toMatchSnapshot('marginBlockEnd');
    expect(stylex.props.call(mockOptions, styles.marginInline)).toMatchSnapshot(
      'marginInline',
    );
    expect(
      stylex.props.call(mockOptions, styles.marginInlineStart),
    ).toMatchSnapshot('marginInlineStart');
    expect(
      stylex.props.call(mockOptions, styles.marginInlineEnd),
    ).toMatchSnapshot('marginInlineEnd');
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
    expect(stylex.props.call(mockOptions, styles.paddingBlock)).toMatchSnapshot(
      'paddingBlock',
    );
    expect(
      stylex.props.call(mockOptions, styles.paddingBlockStart),
    ).toMatchSnapshot('paddingBlockStart');
    expect(
      stylex.props.call(mockOptions, styles.paddingBlockEnd),
    ).toMatchSnapshot('paddingBlockEnd');
    expect(
      stylex.props.call(mockOptions, styles.paddingInline),
    ).toMatchSnapshot('paddingInline');
    expect(
      stylex.props.call(mockOptions, styles.paddingInlineStart),
    ).toMatchSnapshot('paddingInlineStart');
    expect(
      stylex.props.call(mockOptions, styles.paddingInlineEnd),
    ).toMatchSnapshot('paddingInlineEnd');
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
    expect(stylex.props.call(mockOptions, styles.start)).toMatchSnapshot(
      'start',
    );
    expect(stylex.props.call(mockOptions, styles.end)).toMatchSnapshot('end');
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
      expect(
        stylex.props.call(mockOptions, styles.underTest),
      ).toMatchSnapshot();
    });
  }

  test(`${value} "em" units based on inherited font-size`, () => {
    const styles = stylex.create({
      underTest: {
        width: `${value}em`,
      },
    });
    expect(
      stylex.props.call(
        {
          ...mockOptions,
          inheritedFontSize: 12,
        },
        styles.underTest,
      ),
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
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
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
      stylex.props.call(
        {
          ...mockOptions,
          customProperties: {
            slightlyDarkerBlack: '#333',
            theBestWidth: 42,
          },
        },
        underTest,
      ),
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
    const props = stylex.props.call(
      {
        viewportHeight: height,
        viewportWidth: width,
      },
      underTest,
    );
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
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginStart"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginStart: 10,
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginEnd"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginEnd: 10,
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginHorizontal"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginHorizontal: 10,
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"marginVertical"', () => {
    const { underTest } = stylex.create({
      underTest: {
        marginVertical: 10,
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"paddingHorizontal"', () => {
    const { underTest } = stylex.create({
      underTest: {
        paddingHorizontal: 10,
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"paddingVertical"', () => {
    const { underTest } = stylex.create({
      underTest: {
        paddingVertical: 10,
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('"transitionProperty" passthrough', () => {
    const { underTest } = stylex.create({
      underTest: {
        transitionProperty: 'opacity',
      },
    });
    expect(
      stylex.props.call(
        {
          ...mockOptions,
          passthroughProperties: ['transitionProperty'],
        },
        underTest,
      ),
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
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('inherit', () => {
    const { underTest } = stylex.create({
      underTest: {
        fontSize: 'inherit',
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });

  test('initial', () => {
    const { underTest } = stylex.create({
      underTest: {
        fontSize: 'initial',
      },
    });
    expect(stylex.props.call(mockOptions, underTest)).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalled();
  });
});
