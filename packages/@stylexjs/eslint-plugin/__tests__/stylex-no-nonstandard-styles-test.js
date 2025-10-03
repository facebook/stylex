/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.disableAutomock();

const { RuleTester: ESLintTester } = require('eslint');
const rule = require('../src/stylex-no-nonstandard-styles');

const eslintTester = new ESLintTester({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

eslintTester.run('stylex-no-nonstandard-styles', rule.default, {
  valid: [
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
      const stylex = require('@stylexjs/stylex');
      
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
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {':focus': {textAlign: 'lfet'}}});",
    `
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
    `
        import * as stylex from '@stylexjs/stylex';
        const styles = {default: {width: '30pt'}};
        stylex.create(styles);
      `,
    `import * as stylex from '@stylexjs/stylex';
    import { FOO } from 'foo';
     stylex.create({
       default: {
         scrollMarginTop: FOO + 5,
       },
     })`,
    `import * as stylex from '@stylexjs/stylex';
    const FOO = 'bad string';
     stylex.create({
       default: {
         scrollMarginTop: FOO + 5,
       },
     })`,
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {textAlin: 'left'}});",
    "import * as stylex from '@stylexjs/stylex'; stylex.create({default: {[\"textAlin\"]: 'left'}});",
    `
        import * as stylex from '@stylexjs/stylex';
        stylex.create({
          default: {
            ':focs': {
              textAlign: 'left'
            }
          }
        });
      `,
    `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "1px blue solid",
          }
        });
      `,
    `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          default: {
            border: "1px solid",
          }
        });
      `,
  ],
  invalid: [
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
  ],
});
