/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-valid-styles');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-valid-styles', rule.default, {
  valid: [
    // test for local static variables
    `
      import * as stylex from '@stylexjs/stylex';
      const start = 'start';
      const styles = stylex.create({
        default: {
          textAlign: start,
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          transitionProperty: 'opacity, transform',
          transitionDuration: '0.3s',
          transitionTimingFunction: 'ease',
        }
      });
    `,
    `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        validStyle: {
          marginInlineStart: "10px",
          marginInlineEnd: "5px",
          marginInline: "15px",
          marginBlock: "20px",
          paddingInlineStart: "8px",
          paddingInlineEnd: "12px",
          paddingInline: "10px",
          paddingBlock: "16px",
        },
      });
    `,
    `
      import * as stylex from '@stylexjs/stylex';
      const start = 'start';
      const grayscale = 'grayscale';
      const styles = stylex.create({
        default: {
          textAlign: start,
          MozOsxFontSmoothing: grayscale,
          WebkitFontSmoothing: 'antialiased',
          transitionProperty: 'opacity, transform',
          transitionDuration: '0.3s',
          transitionTimingFunction: 'ease',
        }
      });
    `,
    `
      import * as stylex from '@stylexjs/stylex';
      const bounce = stylex.keyframes({
        '0%': {
          transform: 'translateY(0)',
        },
        '50%': {
          transform: 'translateY(-10px)',
        },
        '100%': {
          transform: 'translateY(0)',
        },
      });
      const styles = stylex.create({
        default: {
          animationName: bounce,
          animationDuration: '1s',
          animationIterationCount: 'infinite',
        }
      });
    `,
    `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        default: {
          animationName: stylex.keyframes({
            '0%': {
              transform: 'translateY(0)',
            },
            '50%': {
              transform: 'translateY(-10px)',
            },
            '100%': {
              transform: 'translateY(0)',
            },
          }),
          animationDuration: '1s',
          animationIterationCount: 'infinite',
        }
      });
    `,
    `
      import * as stylex from '@stylexjs/stylex';
      const bounce = stylex.keyframes({
        '0%': {
          transform: 'translateY(0)',
        },
        '50%': {
          transform: 'translateY(-10px)',
        },
        '100%': {
          transform: 'translateY(0)',
        },
      });
      const shimmy = stylex.keyframes({
        '0%': {
          backgroundPosition: '-468px 0',
        },
        '100%': {
          backgroundPosition: '468px 0',
        },
      });
      const styles = stylex.create({
        default: {
          animationName: \`\${bounce}, \${shimmy}\`,
          animationDuration: '1s',
          animationIterationCount: 'infinite',
        }
      });
    `,
    // test for nested styles
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const TRANSPARENT = 0;
        const OPAQUE = 1;
        const styles = stylex.create({
          default: {
            opacity: TRANSPARENT,
            ':hover': {
              opacity: OPAQUE,
            },
            ':focus-visible': {
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'blue',
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
    },
    {
      code: `
        import { keyframes as kf, create } from 'stylex';
        const fadeIn = kf({
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        });
        const styles = create({
          main: {
            animationName: fadeIn,
          },
        });
      `,
    },
    {
      code: `
        import * as stlx from 'stylex';
        const fadeIn = stlx.keyframes({
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        });
        const styles = create({
          main: {
            animationName: fadeIn,
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            width: '50%',
            '@media (max-width: 600px)': {
              width: '100%',
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          base: {
            width: {
              "@starting-style": {
                default: 10,
                ":hover": 20,
              }
            },
          },
        })
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
    },
    // test for positive numbers
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {marginInlineStart: 5}});",
    // test for literals as namespaces
    'import * as stylex from \'@stylexjs/stylex\'; stylex.create({"default-1": {marginInlineStart: 5}});',
    'import * as stylex from \'@stylexjs/stylex\'; stylex.create({["default-1"]: {marginInlineStart: 5}});',
    // test for numbers as namespaces
    "import * as stylex from '@stylexjs/stylex'; stylex.create({0: {marginInlineStart: 5}});",
    // test for computed numbers as namespaces
    "import * as stylex from '@stylexjs/stylex'; stylex.create({[0]: {marginInlineStart: 5}});",
    // test for negative values.
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {marginInlineStart: -5}});",
    // test for unitless length value 0
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {margin: 0}});",
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {padding: '0'}});",
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlign: 'start'}});",
    // test for presets
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         textAlign: 'start',
       }
     });`,
    // test for Math
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         marginInlineStart: Math.abs(-1),
         marginInlineEnd: \`\${Math.floor(5 / 2)}px\`,
         paddingInlineStart: Math.ceil(5 / 2),
         paddingInlineEnd: Math.round(5 / 2),
       },
     })`,
    // test for locally declared constants
    `import * as stylex from '@stylexjs/stylex';
    const FOO = 5;
     stylex.create({
       default: {
         scrollMarginTop: FOO + 5,
         scrollMarginBottom: FOO * 5,
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     const x = 5;
     stylex.create({
       default: {
         marginInlineStart: Math.abs(x),
         marginInlineEnd: \`\${Math.floor(x)}px\`,
         paddingInlineStart: Math.ceil(-x),
         paddingInlineEnd: Math.round(x / 2),
       },
     })`,
    // test for Search
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'WebkitAppearance': 'textfield',
         '::-webkit-search-decoration': {
           appearance: 'none',
         },
         '::-webkit-search-cancel-button': {
           appearance: 'none',
         },
         '::-webkit-search-results-button': {
           appearance: 'none',
         },
         '::-webkit-search-results-decoration': {
           appearance: 'none',
         },
       },
     })`,
    // test for input ranges
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'WebkitAppearance': 'textfield',
         '::-webkit-slider-thumb': {
           appearance: 'none',
         },
         '::-webkit-slider-runnable-track': {
           appearance: 'none',
         },
         '::-moz-range-thumb': {
           appearance: 'none',
         },
         '::-moz-range-track': {
           appearance: 'none',
         },
         '::-moz-range-progress': {
           appearance: 'none',
         },
       },
     })`,
    // test for color
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'color': 'red',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'color': '#fff',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'color': '#fafbfc',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'color': '#fafbfcfc',
       },
     })`,
    // test for relative width
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30rem',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30em',
       },
      })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30ch',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30ex',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30vh',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30vw',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'contain': '300px',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'containIntrinsicSize': '300px',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'containIntrinsicSize': 'auto 300px',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       a: {
         interpolateSize: 'numeric-only',
       },
       b: {
         interpolateSize: 'allow-keywords',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'containIntrinsicInlineSize': '300px',
         'containIntrinsicBlockSize': '200px',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'containIntrinsicInlineSize': 'auto 300px',
         'containIntrinsicBlockSize': 'auto 200px',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'containIntrinsicWidth': '300px',
         'containIntrinsicHeight': '200px',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'containIntrinsicWidth': 'auto 300px',
         'containIntrinsicHeight': 'auto 200px',
       },
     })`,

    // test for absolute width
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30px',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30cm',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30mm',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30in',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30pc',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '30pt',
       },
     })`,
    // test for percentage
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         'width': '50%',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
       default: {
         fontWeight: 'var(--weight)',
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
     stylex.create({
      default: {
        fontWeight: 'var(--🔴)',
      },
    })`,
    `
    import * as stylex from '@stylexjs/stylex';
    const red = 'var(--🔴)';
    stylex.create({
      default: {
        fontWeight: red,
      },
    })`,
    // test for field-sizing
    `
    import * as stylex from '@stylexjs/stylex';
    const red = 'var(--🔴)';
    stylex.create({
      default: {
        fieldSizing: 'fixed',
      },
    })`,
    `
    import * as stylex from '@stylexjs/stylex';
    const red = 'var(--🔴)';
    stylex.create({
      default: {
        fieldSizing: 'content',
      },
    })`,
    // test for stylex create vars tokens
    `
    import * as stylex from '@stylexjs/stylex';
    import {TextTypeTokens as TextType, ColorTokens} from 'DspSharedTextTokens.stylex';
    stylex.create({
      root: {
        fontSize: TextType.fontSize,
        borderColor: ColorTokens.borderColor,
        paddingBottom: TextType.paddingBottom,
        fontFamily: \`\${TextType.defaultFontFamily}, \${TextType.fallbackFontFamily}\`,
      }
    })
    `,
    // test using vars as keys
    `
    import * as stylex from '@stylexjs/stylex';
    import { componentVars } from './bug.stylex';
    stylex.create({
      host: {
        [componentVars.color]: 'blue',
      },
    })
    `,
    // test using vars as keys in dynamic styles
    `
    import * as stylex from'stylex';
    import { tokens } from 'tokens.stylex';
    stylex.create({
      root: (position) => ({
        [tokens.position]: \`\${position}px\`,
      })
    })
    `,
    // test importing vars from paths including code file extension
    `
    import * as stylex from '@stylexjs/stylex';
    import { vars } from './vars.stylex';
    import { varsJs } from './vars.stylex.js';
    import { varsTs } from './vars.stylex.ts';
    import { varsTsx } from './vars.stylex.tsx';
    import { varsJsx } from './vars.stylex.jsx';
    import { varsMjs } from './vars.stylex.mjs';
    import { varsCjs } from './vars.stylex.cjs';
    stylex.create({
      root: {
        [vars.color]: 'blue',
        [varsJs.color]: 'blue',
        [varsTs.color]: 'blue',
        [varsTsx.color]: 'blue',
        [varsJsx.color]: 'blue',
        [varsMjs.color]: 'blue',
        [varsCjs.color]: 'blue',
      },
    })
    `,
    // test for positionTryFallbacks with 'none'
    `
    import * as stylex from '@stylexjs/stylex';
    stylex.create({
      default: {
        positionTryFallbacks: 'none',
      },
    });
    `,
    // test for positionTryFallbacks with `positionTry` references
    `
    import * as stylex from '@stylexjs/stylex';
    const fallback = stylex.positionTry({
      positionAnchor: '--anchor',
      top: '0',
      left: '0',
      width: '100px',
      height: '100px'
    });
    stylex.create({
      anchor: {
        positionTryFallbacks: fallback,
      },
    });
    `,
    // test for positionTryFallbacks with a template literal containing multiple `positionTry` references
    `
    import * as stylex from '@stylexjs/stylex';
    const fallback1 = stylex.positionTry({
      positionAnchor: '--anchor',
      top: '0',
      left: '0',
      width: '100px',
      height: '100px'
    });
    const fallback2 = stylex.positionTry({
      positionAnchor: '--anchor',
      bottom: '0',
      right: '0',
      width: '100px',
      height: '100px'
    });
    stylex.create({
      anchor: {
        positionTryFallbacks: \`\${fallback1}, \${fallback2}\`,
      },
    });
    `,
    // test for ternary and logical expressions
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          basicTernary: (condition) => ({
            color: condition ? 'blue' : 'red',
            display: condition ? 'block' : 'none',
            fontSize: condition ? '10px' : '20px',
            fontWeight: condition ? 'bold' : 'normal',
            opacity: condition ? 0.5 : 1,
            zIndex: condition ? 10 + 10 : Math.max(10, 20),
          }),
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const COLOR = 'blue';
        const sizeSmall = '10px';
        const sizeMedium = '20px';
        const sizeLarge = '30px';
        const styles = stylex.create({
          ternaryWithVars: (condition) => ({
            fontSize: condition ? sizeSmall : sizeMedium,
          }),
          nestedTernaryWithVars: (conditionA, conditionB) => ({
            backgroundColor: conditionA ? COLOR : conditionB ? 'green' : 'yellow',
            fontSize: conditionA ? sizeSmall : conditionB ? sizeMedium : sizeLarge,
          }),
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const COLOR = 'blue';
        const styles = stylex.create({
          nestedTernaryWithVars: (conditionA, conditionB) => ({
            backgroundColor: conditionA ? COLOR : conditionB ? 'green' : 'yellow',
            fontSize: conditionA ? 14 : conditionB ? 16 : 18,
            opacity: conditionA ? 0.5 : conditionB ? 1 : 0.2,
          }),
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const condition = true;
        const styles = stylex.create({
          default: {
            width: condition ? '50%' : '100%',
            '@media (max-width: 600px)': {
              width: condition ? '100%' : '200%',
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const condition = true;
        const styles = stylex.create({
          default: {
            float: condition ? 'inline-start' : 'inline-end',
            clear: condition ? 'inline-start' : 'left',
          }
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          emptyString: (condition) => ({
            '::before': {
              content: condition ? '""' : '"*"',
            },
          })
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const zIndexConst = 10;
        const widthConst = 0;
        const widthConst2 = 3;
        const isMobile = false;
        const styles = stylex.create({
          container: {
            color: "blue" || "green",
            zIndex: zIndexConst ?? 10,
            width: isMobile ? (widthConst || "100%") : (widthConst2 ?? "200%"),
          }
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            ':focus': {
              ':hover': {
                ':active': {
                  color: 'red'
                }
              }
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
      errors: [
        {
          message: 'You cannot nest styles more than one level deep',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = {default: {width: '30pt'}};
        stylex.create(styles);
      `,
      errors: [
        {
          message: 'Styles must be represented as JavaScript objects',
        },
      ],
    },
    {
      code: `import * as stylex from '@stylexjs/stylex';
    import { FOO } from 'foo';
     stylex.create({
       default: {
         scrollMarginTop: FOO + 5,
       },
     })`,
      errors: [
        {
          message:
            'scrollMarginTop value must be one of:\n' +
            'a number literal or math expression\n' +
            'a string literal\n' +
            'null\n' +
            'initial\n' +
            'inherit\n' +
            'unset\n' +
            'revert',
        },
      ],
    },
    {
      code: `import * as stylex from '@stylexjs/stylex';
    const FOO = 'bad string';
     stylex.create({
       default: {
         scrollMarginTop: FOO + 5,
       },
     })`,
      errors: [
        {
          message:
            'scrollMarginTop value must be one of:\n' +
            'a number literal or math expression\n' +
            'a string literal\n' +
            'null\n' +
            'initial\n' +
            'inherit\n' +
            'unset\n' +
            'revert',
        },
      ],
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlin: 'left'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
          suggestions: [
            {
              desc: 'Did you mean "textAlign"?',
              output:
                "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlign: 'left'}});",
            },
          ],
        },
      ],
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlin: 'left'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
          suggestions: [
            {
              desc: 'Did you mean "textAlign"?',
              output:
                "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlign: 'left'}});",
            },
          ],
        },
      ],
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {[\"textAlin\"]: 'left'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
          suggestions: [
            {
              desc: 'Did you mean "textAlign"?',
              output:
                "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {[\"textAlign\"]: 'left'}});",
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            marginStart: '10px',
            marginEnd: '5px',
            marginHorizontal: '15px',
            marginVertical: '15px',
            paddingStart: '10px',
            paddingEnd: '5px',
            paddingHorizontal: '5px',
            paddingVertical: '15px',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "marginStart" is not a standard CSS property. Did you mean "marginInlineStart"?',
        },
        {
          message:
            'The key "marginEnd" is not a standard CSS property. Did you mean "marginInlineEnd"?',
        },
        {
          message:
            'The key "marginHorizontal" is not a standard CSS property. Did you mean "marginInline"?',
        },
        {
          message:
            'The key "marginVertical" is not a standard CSS property. Did you mean "marginBlock"?',
        },
        {
          message:
            'The key "paddingStart" is not a standard CSS property. Did you mean "paddingInlineStart"?',
        },
        {
          message:
            'The key "paddingEnd" is not a standard CSS property. Did you mean "paddingInlineEnd"?',
        },
        {
          message:
            'The key "paddingHorizontal" is not a standard CSS property. Did you mean "paddingInline"?',
        },
        {
          message:
            'The key "paddingVertical" is not a standard CSS property. Did you mean "paddingBlock"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            marginInlineStart: '10px',
            marginInlineEnd: '5px',
            marginInline: '15px',
            marginBlock: '15px',
            paddingInlineStart: '10px',
            paddingInlineEnd: '5px',
            paddingInline: '5px',
            paddingBlock: '15px',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderVerticalWidth: '2px',
            borderVerticalStyle: 'solid',
            borderVerticalColor: 'red',
            borderHorizontalWidth: '1px',
            borderHorizontalStyle: 'dashed',
            borderHorizontalColor: 'blue',
            borderStartWidth: '2px',
            borderStartStyle: 'solid',
            borderStartColor: 'green',
            borderEndWidth: '3px',
            borderEndStyle: 'dotted',
            borderEndColor: 'purple',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "borderVerticalWidth" is not a standard CSS property. Did you mean "borderBlockWidth"?',
        },
        {
          message:
            'The key "borderVerticalStyle" is not a standard CSS property. Did you mean "borderBlockStyle"?',
        },
        {
          message:
            'The key "borderVerticalColor" is not a standard CSS property. Did you mean "borderBlockColor"?',
        },
        {
          message:
            'The key "borderHorizontalWidth" is not a standard CSS property. Did you mean "borderInlineWidth"?',
        },
        {
          message:
            'The key "borderHorizontalStyle" is not a standard CSS property. Did you mean "borderInlineStyle"?',
        },
        {
          message:
            'The key "borderHorizontalColor" is not a standard CSS property. Did you mean "borderInlineColor"?',
        },
        {
          message:
            'The key "borderStartWidth" is not a standard CSS property. Did you mean "borderInlineStartWidth"?',
        },
        {
          message:
            'The key "borderStartStyle" is not a standard CSS property. Did you mean "borderInlineStartStyle"?',
        },
        {
          message:
            'The key "borderStartColor" is not a standard CSS property. Did you mean "borderInlineStartColor"?',
        },
        {
          message:
            'The key "borderEndWidth" is not a standard CSS property. Did you mean "borderInlineEndWidth"?',
        },
        {
          message:
            'The key "borderEndStyle" is not a standard CSS property. Did you mean "borderInlineEndStyle"?',
        },
        {
          message:
            'The key "borderEndColor" is not a standard CSS property. Did you mean "borderInlineEndColor"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderBlockWidth: '2px',
            borderBlockStyle: 'solid',
            borderBlockColor: 'red',
            borderInlineWidth: '1px',
            borderInlineStyle: 'dashed',
            borderInlineColor: 'blue',
            borderInlineStartWidth: '2px',
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: 'green',
            borderInlineEndWidth: '3px',
            borderInlineEndStyle: 'dotted',
            borderInlineEndColor: 'purple',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderTopStartRadius: '4px',
            borderTopEndRadius: '5px',
            borderBottomStartRadius: '6px',
            borderBottomEndRadius: '7px',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "borderTopStartRadius" is not a standard CSS property. Did you mean "borderStartStartRadius"?',
        },
        {
          message:
            'The key "borderTopEndRadius" is not a standard CSS property. Did you mean "borderStartEndRadius"?',
        },
        {
          message:
            'The key "borderBottomStartRadius" is not a standard CSS property. Did you mean "borderEndStartRadius"?',
        },
        {
          message:
            'The key "borderBottomEndRadius" is not a standard CSS property. Did you mean "borderEndEndRadius"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            borderStartStartRadius: '4px',
            borderStartEndRadius: '5px',
            borderEndStartRadius: '6px',
            borderEndEndRadius: '7px',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            end: '5px',
            start: '10px',
          },
        });
      `,
      errors: [
        {
          message:
            'The key "end" is not a standard CSS property. Did you mean "insetInlineEnd"?',
        },
        {
          message:
            'The key "start" is not a standard CSS property. Did you mean "insetInlineStart"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            insetInlineEnd: '5px',
            insetInlineStart: '10px',
          },
        });
      `,
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlign: 'lfet'}});",
      errors: [
        {
          message: `textAlign value must be one of:
start
end
left
right
center
justify
match-parent
null
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {fontWeight: 10001}});",
      errors: [
        {
          message: `fontWeight value must be one of:
normal
bold
bolder
lighter
a number between 1 and 1000
a CSS Variable
null
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {content: 100 + 100}});",
      errors: [
        {
          message: `content value must be one of:
a string literal
null
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {':hover': {textAlin: 'left'}}});",
      options: [{ allowOuterPseudoAndMedia: true }],
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
    },
    {
      code: "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {':focus': {textAlign: 'lfet'}}});",
      options: [{ allowOuterPseudoAndMedia: true }],
      errors: [
        {
          message: `textAlign value must be one of:
start
end
left
right
center
justify
match-parent
null
initial
inherit
unset
revert`,
          suggestions: [
            {
              desc: 'Did you mean "left"? Replace "lfet" with "left"',
              output:
                "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {':focus': {textAlign: 'left'}}});",
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        stylex.create({
          default: {
            ':focs': {
              textAlign: 'left'
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
      errors: [
        {
          message:
            'Nested styles can only be used for the pseudo selectors in the stylex allowlist and for @media queries',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        stylex.create({
          default: {
            ':focus': {
              ':hover': {
                textAlign: 'left'
              }
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
      errors: [
        {
          message: 'You cannot nest styles more than one level deep',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const bounce = stylex.keyframes({
          '0%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        });
        const styles = stylex.create({
          default: {
            animationName: bob,
            animationDuration: '1s',
            animationIterationCount: 'infinite',
          }
        });
      `,
      errors: [
        {
          message: `animationName value must be one of:
none
a \`keyframes(...)\` function call, a reference to it or a many such valid
null
initial
inherit
unset
revert`,
          suggestions: [],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "1px solid blue",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'blue',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: '1px solid rgba(var(--black), 0.0975)',
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(var(--black), 0.0975)',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "solid blue 1px",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'blue',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "blue 1px solid",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'blue',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "1px blue solid",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'blue',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "1px solid",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
    borderStyle: 'solid',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "1px var(--foo)",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
    borderColor: 'var(--foo)',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "1px",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: '1px',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "none",
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' with 'borderWidth', 'borderStyle' and 'borderColor' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderStyle: 'none',
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: 0,
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' set to a number with 'borderWidth' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: 0,
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: 4,
          }
        });
      `,
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' set to a number with 'borderWidth' instead?",
              output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            borderWidth: 4,
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        import * as stylex from 'custom-import';
        const styles = stylex.create({
          default: {
            border: 4,
          }
        });
      `,
      options: [{ validImports: ['custom-import'] }],
      errors: [
        {
          message:
            "The 'border' property is not supported. Use the 'borderWidth', 'borderStyle' and 'borderColor' properties instead.",
          suggestions: [
            {
              desc: "Replace 'border' set to a number with 'borderWidth' instead?",
              output: `
        import * as stylex from 'custom-import';
        const styles = stylex.create({
          default: {
            borderWidth: 4,
          }
        });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
      import * as stylex from'stylex';
      import {TextTypeTokens as TextType, ColorTokens} from 'DspSharedTextTokens';
      stylex.create({
        root: {
          fontSize: TextType.fontSize,
          borderColor: ColorTokens.borderColor,
          paddingBottom: TextType.paddingBottom,
          fontFamily: \`\${TextType.fontFamily}, \${TextType.fallbackFontFamily}\`,
        }
      })
      `,
      errors: [
        {
          message:
            'borderColor value must be one of:\n' +
            'a string literal\n' +
            'aliceblue\n' +
            'antiquewhite\n' +
            'aqua\n' +
            'aquamarine\n' +
            'azure\n' +
            'beige\n' +
            'bisque\n' +
            'black\n' +
            'blanchedalmond\n' +
            'blue\n' +
            'blueviolet\n' +
            'brown\n' +
            'burlywood\n' +
            'cadetblue\n' +
            'chartreuse\n' +
            'chocolate\n' +
            'coral\n' +
            'cornflowerblue\n' +
            'cornsilk\n' +
            'crimson\n' +
            'cyan\n' +
            'darkblue\n' +
            'darkcyan\n' +
            'darkgoldenrod\n' +
            'darkgray\n' +
            'darkgrey\n' +
            'darkgreen\n' +
            'darkkhaki\n' +
            'darkmagenta\n' +
            'darkolivegreen\n' +
            'darkorange\n' +
            'darkorchid\n' +
            'darkred\n' +
            'darksalmon\n' +
            'darkseagreen\n' +
            'darkslateblue\n' +
            'darkslategray\n' +
            'darkslategrey\n' +
            'darkturquoise\n' +
            'darkviolet\n' +
            'deeppink\n' +
            'deepskyblue\n' +
            'dimgray\n' +
            'dimgrey\n' +
            'dodgerblue\n' +
            'firebrick\n' +
            'floralwhite\n' +
            'forestgreen\n' +
            'fuchsia\n' +
            'gainsboro\n' +
            'ghostwhite\n' +
            'gold\n' +
            'goldenrod\n' +
            'gray\n' +
            'grey\n' +
            'green\n' +
            'greenyellow\n' +
            'honeydew\n' +
            'hotpink\n' +
            'indianred\n' +
            'indigo\n' +
            'ivory\n' +
            'khaki\n' +
            'lavender\n' +
            'lavenderblush\n' +
            'lawngreen\n' +
            'lemonchiffon\n' +
            'lightblue\n' +
            'lightcoral\n' +
            'lightcyan\n' +
            'lightgoldenrodyellow\n' +
            'lightgray\n' +
            'lightgrey\n' +
            'lightgreen\n' +
            'lightpink\n' +
            'lightsalmon\n' +
            'lightseagreen\n' +
            'lightskyblue\n' +
            'lightslategray\n' +
            'lightslategrey\n' +
            'lightsteelblue\n' +
            'lightyellow\n' +
            'lime\n' +
            'limegreen\n' +
            'linen\n' +
            'magenta\n' +
            'maroon\n' +
            'mediumaquamarine\n' +
            'mediumblue\n' +
            'mediumorchid\n' +
            'mediumpurple\n' +
            'mediumseagreen\n' +
            'mediumslateblue\n' +
            'mediumspringgreen\n' +
            'mediumturquoise\n' +
            'mediumvioletred\n' +
            'midnightblue\n' +
            'mintcream\n' +
            'mistyrose\n' +
            'moccasin\n' +
            'navajowhite\n' +
            'navy\n' +
            'oldlace\n' +
            'olive\n' +
            'olivedrab\n' +
            'orange\n' +
            'orangered\n' +
            'orchid\n' +
            'palegoldenrod\n' +
            'palegreen\n' +
            'paleturquoise\n' +
            'palevioletred\n' +
            'papayawhip\n' +
            'peachpuff\n' +
            'peru\n' +
            'pink\n' +
            'plum\n' +
            'powderblue\n' +
            'purple\n' +
            'red\n' +
            'rosybrown\n' +
            'royalblue\n' +
            'saddlebrown\n' +
            'salmon\n' +
            'sandybrown\n' +
            'seagreen\n' +
            'seashell\n' +
            'sienna\n' +
            'silver\n' +
            'skyblue\n' +
            'slateblue\n' +
            'slategray\n' +
            'slategrey\n' +
            'snow\n' +
            'springgreen\n' +
            'steelblue\n' +
            'tan\n' +
            'teal\n' +
            'thistle\n' +
            'tomato\n' +
            'turquoise\n' +
            'violet\n' +
            'wheat\n' +
            'white\n' +
            'whitesmoke\n' +
            'yellow\n' +
            'yellowgreen\n' +
            'rebeccapurple\n' +
            'a valid hex color (#FFAADD or #FFAADDFF)\n' +
            'null\n' +
            'initial\n' +
            'inherit\n' +
            'unset\n' +
            'revert',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          foo: {
            float: 'start',
            clear: 'start',
          },
          bar: {
            float: 'end',
            clear: 'end',
          }
        });
      `,
      errors: [
        {
          message:
            'The value "start" is not a standard CSS value for "float". Did you mean "inline-start"?',
        },
        {
          message:
            'The value "start" is not a standard CSS value for "clear". Did you mean "inline-start"?',
        },
        {
          message:
            'The value "end" is not a standard CSS value for "float". Did you mean "inline-end"?',
        },
        {
          message:
            'The value "end" is not a standard CSS value for "clear". Did you mean "inline-end"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          foo: {
            float: 'inline-start',
            clear: 'inline-start',
          },
          bar: {
            float: 'inline-end',
            clear: 'inline-end',
          }
        });
      `,
    },
    // test for ternary and logical expressions
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          ternaryWithBasicInvalidStyles: (condition) => ({
            color: condition ? 'red' : 123,
            fontSize: condition ? true : '10px',
            transition: condition ? 'transform 1s' : ' ',
            zIndex: condition ?? 'red',
            display: 'invalid-display' || 'block',
          }),
        });
      `,
      errors: [
        {
          message: /^color value must be one of:\n/,
        },
        {
          message: /^fontSize value must be one of:\n/,
        },
        {
          message: 'The empty string is not allowed by Stylex.',
        },
        {
          message: /^zIndex value must be one of:\n/,
        },
        {
          message: /^display value must be one of:\n/,
        },
      ],
    },
    {
      code: `import * as stylex from '@stylexjs/stylex';
const styles = stylex.create({
  ternaryWithBasicInvalidStyles: (condition) => ({
    float: condition ? 'start' : 'inline-end',
  }),
});`,
      errors: [
        {
          message:
            'The value "start" is not a standard CSS value for "float". Did you mean "inline-start"?',
          suggestions: [
            {
              desc: 'Replace "start" with "inline-start"?',
            },
          ],
        },
      ],
      output: `import * as stylex from '@stylexjs/stylex';
const styles = stylex.create({
  ternaryWithBasicInvalidStyles: (condition) => ({
    float: condition ? 'inline-start' : 'inline-end',
  }),
});`,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          nestedInvalidStyles: (conditionA, conditionB) => ({
            display: conditionA ?  conditionB ? 'grid' : 'invalid-display' : 'block',
          }),
        });
      `,
      errors: [
        {
          message: /^display value must be one of:\n/,
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          ternaryWithInvalidType: (condition) => ({
            fontWeight: condition ? sasasa : 'bold',
            marginStart: condition ? '10px' : '20px',
          }),
        });
      `,
      errors: [
        {
          message: /^fontWeight value must be one of:\n/,
        },
        {
          message:
            'The key "marginStart" is not a standard CSS property. Did you mean "marginInlineStart"?',
        },
      ],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          ternaryWithInvalidType: (condition) => ({
            fontWeight: condition ? sasasa : 'bold',
            marginInlineStart: condition ? '10px' : '20px',
          }),
        });
      `,
    },
  ],
});

eslintTester.run('stylex-valid-styles [restrictions]', rule.default, {
  valid: [
    `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        default: {
          display: 'grid',
          grid: 'repeat(3, 80px) / auto-flow',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
        }
      });
    `,
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            display: 'grid',
            grid: 'repeat(3, 80px) / auto-flow',
          }
        });
      `,
      options: [
        {
          propLimits: {
            'grid+([a-zA-Z])': {
              limit: null,
              reason: 'disallow `grid-*` props but not `grid` for testing',
            },
          },
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            display: 'grid',
          }
        });
      `,
      options: [
        {
          propLimits: {
            display: {
              limit: ['grid', 'block', 'flex'],
              reason: 'disallow `grid-*` props but not `grid` for testing',
            },
          },
        },
      ],
    },
    {
      code: `
        import * as stylex from'stylex';
        const styles = stylex.create({
          default: {
            textUnderlineOffset: 'auto',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from'stylex';
        const styles = stylex.create({
          default: {
            textUnderlineOffset: '1px',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from'stylex';
        const styles = stylex.create({
          default: {
            textUnderlineOffset: '100%',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from'stylex';
        const styles = stylex.create({
          base: {
            backgroundColor: {
              default: 'blue',
              ':focus-within': 'red',
            },
          },
        });`,
    },
    // test for allowed raw CSS variable overrides
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          foo: {
            '--bar': '0',
          }
        })
      `,
      options: [{ allowRawCSSVars: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            '::after': {
              ':hover': {
                content: ''
              }
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            backgroundBlendMode: 'multiply',
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            backgroundBlendMode: 'multiply, darken, exclusion',
          },
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            display: 'grid',
          }
        });
      `,
      options: [
        {
          propLimits: {
            display: {
              limit: ['block', 'flex'],
              reason: 'disallow `grid-*` props but not `grid` for testing',
            },
          },
        },
      ],
      errors: [
        {
          message: `display value must be one of:
block
flex
null
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        stylex.create({
          default: {
            ':focus': {
              '::after': {
                content: ''
              }
            }
          }
        });
      `,
      options: [{ allowOuterPseudoAndMedia: true }],
      errors: [
        {
          message: 'You cannot nest styles more than one level deep',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            display: 'grid',
            grid: 'repeat(3, 80px) / auto-flow',
          }
        });
      `,
      options: [
        {
          propLimits: {
            grid: {
              limit: null,
              reason: 'grid properties disallowed for testing',
            },
          },
        },
      ],
      errors: [
        {
          message: `grid value must be one of:
grid properties disallowed for testing`,
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }
        });
      `,
      options: [
        {
          propLimits: {
            'grid*': {
              limit: null,
              reason: 'grid properties disallowed for testing',
            },
          },
        },
      ],
      errors: [
        {
          message: `gridTemplateColumns value must be one of:
grid properties disallowed for testing`,
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            display: 'grid',
            grid: 'repeat(3, 80px) / auto-flow',
          }
        });
      `,
      options: [
        {
          banPropsForLegacy: true,
        },
      ],
      errors: [
        {
          message: `grid value must be one of:
This property is not supported in legacy StyleX resolution.`,
        },
      ],
    },
    {
      code: `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        base:{
          background: ''
        },
      });
    `,
      errors: [
        {
          message: 'The empty string is not allowed by Stylex.',
        },
      ],
    },
    {
      code: `
        import * as stylex from'stylex';
        const styles = stylex.create({
          b:{
            textUnderlineOffset: '',
          },
        })
      `,
      errors: [
        {
          message: `textUnderlineOffset value must be one of:
auto
a number ending in px, mm, in, pc, pt
a number ending in ch, em, ex, ic, rem, vh, vw, vmin, vmax, svh, dvh, lvh, svw, dvw, ldw, cqw, cqh, cqmin, cqmax
A string literal representing a percentage (e.g. 100%)
null
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: `
        import { css } from 'a';
        const styles = css.create({
          base:{
            background: ''
          },
        });
      `,
      options: [{ validImports: [{ from: 'a', as: 'css' }] }],
      errors: [
        {
          message: 'The empty string is not allowed by Stylex.',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            margin: "10",
            height: "10",
          },
        });
      `,
      errors: [
        {
          message:
            'margin value must be one of:\n' +
            'a number literal or math expression\n' +
            'a non-numeric string\n' +
            'null\n' +
            'initial\n' +
            'inherit\n' +
            'unset\n' +
            'revert',
        },
        {
          message:
            'height value must be one of:\n' +
            'a non-numeric string\n' +
            'a number literal or math expression\n' +
            'available\n' +
            'min-content\n' +
            'max-content\n' +
            'fit-content\n' +
            'auto\n' +
            'a number ending in px, mm, in, pc, pt\n' +
            'a number ending in ch, em, ex, ic, rem, vh, vw, vmin, vmax, svh, dvh, lvh, svw, dvw, ldw, cqw, cqh, cqmin, cqmax\n' +
            'A string literal representing a percentage (e.g. 100%)\n' +
            'null\n' +
            'initial\n' +
            'inherit\n' +
            'unset\n' +
            'revert',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          invalidStyle: {
            margin: "10",
            marginTop: "10.1",
            marginRight: "-10",
            marginBottom: "-1.0",
            marginLeft: "-0.10",
            padding: "0.1234",
            paddingTop: "100000",
            paddingRight: "10",
            paddingBottom: "10",
            paddingLeft: "10",
            width: "10",
            height: "10",
            minWidth: "10",
            maxWidth: "10",
            minHeight: "10",
            maxHeight: "10",
            top: "10",
            right: "10",
            bottom: "10",
            left: "10",
            inset: "10",
            borderWidth: "10",
            borderTopWidth: "10",
            borderRightWidth: "10",
            borderBottomWidth: "10",
            borderLeftWidth: "10",
            gap: "10",
            rowGap: "10",
            columnGap: "10",
            lineHeight: "10",
            outlineWidth: "10",
          },
        });
      `,
      errors: Array(31).fill({}),
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        stylex.create({
          default: {
            positionTryFallbacks: 42,
          },
        });
      `,
      errors: [
        {
          message: `positionTryFallbacks value must be one of:
none
a CSS Variable
a \`positionTry(...)\` function call, a reference to it, or a list of references
null
initial
inherit
unset
revert`,
        },
      ],
    },
    // test for positionTryFallbacks with incorrectly formatted template literal - missing comma
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const fallback1 = stylex.positionTry({
          positionAnchor: '--anchor',
          top: '0',
          left: '0',
          width: '100px',
          height: '100px'
        });
        const fallback2 = stylex.positionTry({
          positionAnchor: '--anchor',
          bottom: '0',
          right: '0',
          width: '100px',
          height: '100px'
        });
        stylex.create({
          anchor: {
            positionTryFallbacks: \`\${fallback1} \${fallback2}\`,
          },
        });
      `,
      errors: [
        {
          message: `positionTryFallbacks value must be one of:
none
a CSS Variable
position try fallbacks must be separated by a comma and a space (", ")
null
initial
inherit
unset
revert`,
        },
      ],
    },
    // test for positionTryFallbacks with incorrectly formatted template literal - missing space after comma
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const fallback1 = stylex.positionTry({
          positionAnchor: '--anchor',
          top: '0',
          left: '0',
          width: '100px',
          height: '100px'
        });
        const fallback2 = stylex.positionTry({
          positionAnchor: '--anchor',
          bottom: '0',
          right: '0',
          width: '100px',
          height: '100px'
        });
        stylex.create({
          anchor: {
            positionTryFallbacks: \`\${fallback1},\${fallback2}\`,
          },
        });
      `,
      errors: [
        {
          message: `positionTryFallbacks value must be one of:
none
a CSS Variable
position try fallbacks must be separated by a comma and a space (", ")
null
initial
inherit
unset
revert`,
        },
      ],
    },
    // test for disallowed raw CSS variable overrides
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          foo: {
            '--bar': '0',
          }
        })
      `,
      options: [{ allowRawCSSVars: false }],
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            backgroundBlendMode: 'invalid-blend-mode',
          },
        });
      `,
      errors: [
        {
          message: `backgroundBlendMode value must be one of:
normal
multiply
screen
overlay
darken
lighten
color-dodge
color-burn
hard-light
soft-light
difference
exclusion
hue
saturation
color
luminosity
null
initial
inherit
unset
revert`,
        },
      ],
    },
    // test for backgroundBlendMode with invalid blend mode value in comma-separated list
    // 'darke' should be 'darken'
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            backgroundBlendMode: 'multiply, darke, exclusion',
          },
        });
      `,
      errors: [
        {
          message: `backgroundBlendMode value must be one of:
normal
multiply
screen
overlay
darken
lighten
color-dodge
color-burn
hard-light
soft-light
difference
exclusion
hue
saturation
color
luminosity
null
initial
inherit
unset
revert`,
        },
      ],
    },
    // test for incorrect spacing around comma in backgroundBlendMode
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          container: {
            backgroundBlendMode: 'multiply, darken,exclusion',
          },
        });
      `,
      errors: [
        {
          message:
            "backgroundBlendMode values must be separated by a comma and a space (', ')",
        },
      ],
    },
  ],
});
