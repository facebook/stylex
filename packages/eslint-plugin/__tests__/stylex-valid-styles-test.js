/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
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
      import stylex from 'stylex';
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
      import stylex from "stylex";
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
      import stylex from 'stylex';
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
      import stylex from 'stylex';
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
      import stylex from 'stylex';
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
      import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
    'import stylex from "stylex"; stylex.create({default: {marginInlineStart: 5}});',
    // test for literals as namespaces
    'import stylex from "stylex"; stylex.create({"default-1": {marginInlineStart: 5}});',
    'import stylex from "stylex"; stylex.create({["default-1"]: {marginInlineStart: 5}});',
    // test for numbers as namespaces
    'import stylex from "stylex"; stylex.create({0: {marginInlineStart: 5}});',
    // test for computed numbers as namespaces
    'import stylex from "stylex"; stylex.create({[0]: {marginInlineStart: 5}});',
    // test for negative values.
    'import stylex from "stylex"; stylex.create({default: {marginInlineStart: -5}});',
    "import stylex from 'stylex'; stylex.create({default: {textAlign: 'start'}});",
    // test for presets
    `import stylex from "stylex";
     stylex.create({
       default: {
         textAlign: 'start',
       }
     });`,
    // test for Math
    `import stylex from "stylex";
     stylex.create({
       default: {
         marginInlineStart: Math.abs(-1),
         marginInlineEnd: \`\${Math.floor(5 / 2)}px\`,
         paddingInlineStart: Math.ceil(5 / 2),
         paddingInlineEnd: Math.round(5 / 2),
       },
     })`,
    `import stylex from "stylex";
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
    `import stylex from "stylex";
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
    `import stylex from "stylex";
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
    `import stylex from "stylex";
     stylex.create({
       default: {
         'color': 'red',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'color': '#fff',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'color': '#fafbfc',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'color': '#fafbfcfc',
       },
     })`,
    // test for relative width
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30rem',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30em',
       },
      })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30ch',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30ex',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30vh',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30vw',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'contain': '300px',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'containIntrinsicSize': '300px',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'containIntrinsicSize': 'auto 300px',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       a: {
         interpolateSize: 'numeric-only',
       },
       b: {
         interpolateSize: 'allow-keywords',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'containIntrinsicInlineSize': '300px',
         'containIntrinsicBlockSize': '200px',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'containIntrinsicInlineSize': 'auto 300px',
         'containIntrinsicBlockSize': 'auto 200px',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'containIntrinsicWidth': '300px',
         'containIntrinsicHeight': '200px',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'containIntrinsicWidth': 'auto 300px',
         'containIntrinsicHeight': 'auto 200px',
       },
     })`,

    // test for absolute width
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30px',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30cm',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30mm',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30in',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30pc',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '30pt',
       },
     })`,
    // test for percentage
    `import stylex from "stylex";
     stylex.create({
       default: {
         'width': '50%',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
       default: {
         fontWeight: 'var(--weight)',
       },
     })`,
    `import stylex from "stylex";
     stylex.create({
      default: {
        fontWeight: 'var(--🔴)',
      },
    })`,
    `
    import stylex from "stylex";
    const red = 'var(--🔴)';
    stylex.create({
      default: {
        fontWeight: red,
      },
    })`,
    // test for field-sizing
    `
    import stylex from "stylex";
    const red = 'var(--🔴)';
    stylex.create({
      default: {
        fieldSizing: 'fixed',
      },
    })`,
    `
    import stylex from "stylex";
    const red = 'var(--🔴)';
    stylex.create({
      default: {
        fieldSizing: 'content',
      },
    })`,
    // test for stylex create vars tokens
    `
    import stylex from 'stylex';
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
    import stylex from 'stylex';
    import { componentVars } from './bug.stylex';
    stylex.create({
      host: {
        [componentVars.color]: 'blue',
      },
    })
    `,
    // test using vars as keys in dynamic styles
    `
    import stylex from'stylex';
    import { tokens } from 'tokens.stylex';
    stylex.create({
      root: (position) => ({
        [tokens.position]: \`\${position}px\`,
      })
    })
    `,
    // test importing vars from paths including code file extension
    `
    import stylex from 'stylex';
    import { vars } from './vars.stylex';
    import { varsJs } from './vars.stylex.js';
    import { varsTs } from './vars.stylex.ts';
    import { varsTsx } from './vars.stylex.tsx';
    import { varsJsx } from './vars.stylex.jsx';
    import { varsMjs } from './vars.stylex.mjs';
    import { varsCjs } from './vars.stylex.cjs';
    stylex.create({
      root: (position) => ({
        [vars.color]: 'blue',
        [varsJs.color]: 'blue',
        [varsTs.color]: 'blue',
        [varsTsx.color]: 'blue',
        [varsJsx.color]: 'blue',
        [varsMjs.color]: 'blue',
        [varsCjs.color]: 'blue',
      })
    })
    `,
  ],
  invalid: [
    {
      code: `
        import stylex from 'stylex';
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
      code: "import stylex from 'stylex'; stylex.create({default: {textAlin: 'left'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
          suggestions: [
            {
              desc: 'Did you mean "textAlign"?',
              output:
                "import stylex from 'stylex'; stylex.create({default: {textAlign: 'left'}});",
            },
          ],
        },
      ],
    },
    {
      code: "import stylex from 'stylex'; stylex.create({default: {textAlin: 'left'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
          suggestions: [
            {
              desc: 'Did you mean "textAlign"?',
              output:
                "import stylex from 'stylex'; stylex.create({default: {textAlign: 'left'}});",
            },
          ],
        },
      ],
    },
    {
      code: 'import stylex from "stylex"; stylex.create({default: {["textAlin"]: \'left\'}});',
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
          suggestions: [
            {
              desc: 'Did you mean "textAlign"?',
              output:
                'import stylex from "stylex"; stylex.create({default: {["textAlign"]: \'left\'}});',
            },
          ],
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
      code: "import stylex from 'stylex'; stylex.create({default: {textAlign: 'lfet'}});",
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
      code: 'import stylex from "stylex"; stylex.create({default: {fontWeight: 10001}});',
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
      code: 'import stylex from "stylex"; stylex.create({default: {content: 100 + 100}});',
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
      code: "import stylex from 'stylex'; stylex.create({default: {':hover': {textAlin: 'left'}}});",
      options: [{ allowOuterPseudoAndMedia: true }],
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
    },
    {
      code: "import stylex from 'stylex'; stylex.create({default: {':focus': {textAlign: 'lfet'}}});",
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
                "import stylex from 'stylex'; stylex.create({default: {':focus': {textAlign: 'left'}}});",
            },
          ],
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
a \`stylex.keyframes(...)\` function call, a reference to it or a many such valid
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'custom-import';
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
        import stylex from 'custom-import';
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
      import stylex from'stylex';
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
  ],
});

eslintTester.run('stylex-valid-styles [restrictions]', rule.default, {
  valid: [
    `
      import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from'stylex';
        const styles = stylex.create({
          default: {
            textUnderlineOffset: 'auto',
          },
        });
      `,
    },
    {
      code: `
        import stylex from'stylex';
        const styles = stylex.create({
          default: {
            textUnderlineOffset: '1px',
          },
        });
      `,
    },
    {
      code: `
        import stylex from'stylex';
        const styles = stylex.create({
          default: {
            textUnderlineOffset: '100%',
          },
        });
      `,
    },
    {
      code: `
        import stylex from'stylex';
        const styles = stylex.create({
          base: {
            backgroundColor: {
              default: 'blue',
              ':focus-within': 'red',
            },
          },
        });`,
    },
  ],
  invalid: [
    {
      code: `
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
        import stylex from 'stylex';
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
      import stylex from 'stylex';
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
        import stylex from'stylex';
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
  ],
});
