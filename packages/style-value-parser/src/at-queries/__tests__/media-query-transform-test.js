/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import { lastMediaQueryWinsTransform } from '../media-query-transform.js';

const stylex = {
  create: (styles) => styles,
};

describe('Media Query Transformer', () => {
  test('basic usage: multiple widths', () => {
    const originalStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px)': '1 / 4',
          '@media (max-width: 1024px)': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
      },
    };

    const expectedStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px))':
            '1 / 4',
          '@media (max-width: 1024px) and (not (max-width: 768px))': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('basic usage: nested query', () => {
    const originalStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px)': {
            '@media (max-width: 1024px)': '1 / 3',
            '@media (max-width: 768px)': '1 / -1',
          },
          '@media (max-width: 1024px)': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
      },
    };

    const expectedStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px))':
            {
              '@media (max-width: 1024px) and (not (max-width: 768px))':
                '1 / 3',
              '@media (max-width: 768px)': '1 / -1',
            },
          '@media (max-width: 1024px) and (not (max-width: 768px))': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('basic usage: nested query', () => {
    const originalStyles = {
      table: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px)': {
            '@media (max-width: 1024px)': '1 / 3',
            '@media (max-width: 768px)': '1 / -1',
          },
          '@media (max-width: 1024px)': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
        padding: '10px',
      },
    };

    const expectedStyles = {
      table: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px))':
            {
              '@media (max-width: 1024px) and (not (max-width: 768px))':
                '1 / 3',
              '@media (max-width: 768px)': '1 / -1',
            },
          '@media (max-width: 1024px) and (not (max-width: 768px))': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
        padding: '10px',
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);

    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('basic usage: complex object', () => {
    const originalStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px)': '1 / 4',
          '@media (max-width: 1024px)': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
        grid: {
          default: '1 / 2',
          '@media (max-width: 1440px)': '1 / 4',
        },
        gridRow: {
          default: '1 / 2',
          padding: '10px',
        },
      },
    };

    const expectedStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px))':
            '1 / 4',
          '@media (max-width: 1024px) and (not (max-width: 768px))': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
        },
        grid: {
          default: '1 / 2',
          '@media (max-width: 1440px)': '1 / 4',
        },
        gridRow: {
          default: '1 / 2',
          padding: '10px',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('basic usage: lots and lots of widths', () => {
    const originalStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px)': '1 / 4',
          '@media (max-width: 1024px)': '1 / 3',
          '@media (max-width: 768px)': '1 / -1',
          '@media (max-width: 458px)': '1 / -1',
        },
      },
    };

    const expectedStyles = {
      foo: {
        gridColumn: {
          default: '1 / 2',
          '@media (max-width: 1440px) and (not (max-width: 1024px)) and (not (max-width: 768px)) and (not (max-width: 458px))':
            '1 / 4',
          '@media (max-width: 1024px) and (not (max-width: 768px)) and (not (max-width: 458px))':
            '1 / 3',
          '@media (max-width: 768px) and (not (max-width: 458px))': '1 / -1',
          '@media (max-width: 458px)': '1 / -1',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('single word condition', () => {
    const originalStyles = stylex.create({
      colorMode: {
        mode: {
          default: 'normal',
          '@media (color)': 'colorful',
          '@media (monochrome)': 'grayscale',
        },
      },
    });

    const expectedStyles = {
      colorMode: {
        mode: {
          default: 'normal',
          '@media (color) and (not (monochrome))': 'colorful',
          '@media (monochrome)': 'grayscale',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('handles comma-separated (or) media queries', () => {
    const originalStyles = stylex.create({
      container: {
        width: {
          default: '100%',
          '@media screen, (max-width: 800px)': '80%',
          '@media (max-width: 500px)': '60%',
        },
      },
    });

    const expectedStyles = {
      container: {
        width: {
          default: '100%',
          '@media screen and (not (max-width: 500px)), (max-width: 800px) and (not (max-width: 500px))':
            '80%',
          '@media (max-width: 500px)': '60%',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test.skip('handles and media queries', () => {
    const originalStyles = stylex.create({
      container: {
        width: {
          default: '100%',
          '@media (min-width: 900px)': '80%',
          '@media (min-width: 500px) and (max-width: 899px) and (max-height: 300px)':
            '50%',
        },
      },
    });

    const expectedStyles = {
      container: {
        width: {
          default: '100%',
          '@media (min-width: 900px) and (not ((min-width: 500px) and (max-width: 899px) and (max-height: 300px)))':
            '80%',
          '@media (min-width: 500px) and (max-width: 899px) and (max-height: 300px)':
            '50%',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test.skip('combination of keywords and rules', () => {
    const originalStyles = stylex.create({
      container: {
        width: {
          default: '100%',
          '@media screen and (min-width: 900px)': '80%',
          '@media print and (max-width: 500px)': '50%',
        },
      },
    });

    const expectedStyles = {
      container: {
        width: {
          default: '100%',
          '@media screen and (min-width: 900px) and (not (print and (max-width: 500px)))':
            '80%',
          '@media print and (max-width: 500px)': '50%',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('basic usage: does not modify single queries', () => {
    const originalStyles = {
      gridColumn: {
        default: '1 / 2',
        '@media (max-width: 1440px)': '1 / 4',
      },
    };

    const expectedStyles = {
      gridColumn: {
        default: '1 / 2',
        '@media (max-width: 1440px)': '1 / 4',
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });

  test('ignores legacy media query syntax', () => {
    const originalStyles = {
      root: {
        width: '100%',
        '@media (min-width: 600px)': {
          width: '50%',
        },
      },
    };

    const expectedStyles = {
      root: {
        width: '100%',
        '@media (min-width: 600px)': {
          width: '50%',
        },
      },
    };

    const result = lastMediaQueryWinsTransform(originalStyles);
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedStyles));
  });
});
