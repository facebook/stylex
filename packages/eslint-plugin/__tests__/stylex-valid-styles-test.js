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

ESLintTester.setDefaultConfig({
  parser: require.resolve('hermes-eslint'),
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

const eslintTester = new ESLintTester();

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
    `
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
    `
     import stylex from 'stylex';
     const styles = stylex.create({
       default: {
         width: '50%',
         '@media (max-width: 600px)': {
           width: '100%',
         }
       }
     });`,
    // test for positive numbers
    'import stylex from "stylex"; stylex.create({default: {marginStart: 5}});',
    // test for literals as namespaces
    'import stylex from "stylex"; stylex.create({"default-1": {marginStart: 5}});',
    'import stylex from "stylex"; stylex.create({["default-1"]: {marginStart: 5}});',
    // test for numbers as namespaces
    'import stylex from "stylex"; stylex.create({0: {marginStart: 5}});',
    // test for computed numbers as namespaces
    'import stylex from "stylex"; stylex.create({[0]: {marginStart: 5}});',
    // test for negative values.
    'import stylex from "stylex"; stylex.create({default: {marginStart: -5}});',
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
         marginStart: Math.abs(-1),
         marginEnd: \`\${Math.floor(5 / 2)}px\`,
         paddingStart: Math.ceil(5 / 2),
         paddingEnd: Math.round(5 / 2),
       },
     })`,
    `import stylex from "stylex";
     const x = 5;
     stylex.create({
       default: {
         marginStart: Math.abs(x),
         marginEnd: \`\${Math.floor(x)}px\`,
         paddingStart: Math.ceil(-x),
         paddingEnd: Math.round(x / 2),
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
  ],
  invalid: [
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
      code: "import stylex from 'stylex'; stylex.create({default: {transition: 'all 0.3s ease'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
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
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: 'import stylex from "stylex"; stylex.create({default: {fontWeight: 99}});',
      errors: [
        {
          message: `fontWeight value must be one of:
normal
bold
bolder
lighter
100
200
300
400
500
600
700
800
900
a CSS Variable
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
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: "import stylex from 'stylex'; stylex.create({default: {transitionProperty: 'all'}});",
      errors: [
        {
          message: `transitionProperty value must be one of:
opacity
transform
opacity, transform
none
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: "import stylex from 'stylex'; stylex.create({default: {transitionProperty: 'height'}});",
      errors: [
        {
          message: `transitionProperty value must be one of:
opacity
transform
opacity, transform
none
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: "import stylex from 'stylex'; stylex.create({default: {transitionProperty: 'transfrom'}});",
      errors: [
        {
          message: `transitionProperty value must be one of:
opacity
transform
opacity, transform
none
initial
inherit
unset
revert`,
        },
      ],
    },
    {
      code: "import stylex from 'stylex'; stylex.create({default: {':hover': {textAlin: 'left'}}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
    },
    {
      code: "import stylex from 'stylex'; stylex.create({default: {':focus': {textAlign: 'lfet'}}});",
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
      errors: [
        {
          message: 'You cannot nest styles more than one level deep',
        },
      ],
    },
    {
      code: 'import stylex from "stylex"; stylex.create({default: {transitionProperty: "opasity"}});',
      errors: [
        {
          message: `transitionProperty value must be one of:
opacity
transform
opacity, transform
none
initial
inherit
unset
revert`,
          suggestions: [
            {
              desc: 'Did you mean "opacity"? Replace "opasity" with "opacity"',
              output:
                'import stylex from "stylex"; stylex.create({default: {transitionProperty: "opacity"}});',
            },
          ],
        },
      ],
    },
    {
      code: `
        import stylex from 'stylex';
        const tp = "opasity";
        const styles = stylex.create({default: {transitionProperty: tp}});
      `,
      errors: [
        {
          message: `transitionProperty value must be one of:
opacity
transform
opacity, transform
none
initial
inherit
unset
revert`,
          suggestions: [
            {
              desc: 'Did you mean "opacity"? Replace "opasity" with "opacity"',
              output: `
        import stylex from 'stylex';
        const tp = "opacity";
        const styles = stylex.create({default: {transitionProperty: tp}});
      `,
            },
          ],
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
  ],
});
