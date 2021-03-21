/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+jsinfra
 * @format
 */

'use strict';

jest.autoMockOff();

const {transformSync: babelTransform} = require('@babel/core');
const TestUtil = require('fb-babel-plugin-utils/TestUtil');

function transform(source, opts = {}) {
  return babelTransform(source, {
    filename: opts.filename,
    parserOpts: {
      flow: {
        all: true,
      },
    },
    plugins: [
      require('@babel/plugin-syntax-flow'),
      require('@babel/plugin-syntax-object-rest-spread'),
      [require('../lib/index'), opts],
    ],
  }).code;
}

const testData = {
  'transforms plain style object to css': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
          color: 'blue',
        }
      });
    `,
    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
    `,
  },
  'transforms style object with variable to css': {
    input: `
      const styles = stylex.create({
        default: {
          '--background-color': 'red',
        }
      });
    `,
    output: `
      stylex.inject(".eq698nx4{--background-color:red}", 1);
    `,
  },
  'transforms variable usage to css': {
    input: `
      const styles = stylex.create({
        default: {
          '--final-color': 'var(--background-color)',
        }
      });
    `,
    output: `
      stylex.inject(".i4rl8tte{--final-color:var(--background-color)}", 1);
    `,
  },
  'rounds down number values to four decimal points': {
    input: `
      const styles = stylex.create({
        default: {
          height: 100 / 3,
        }
      });
    `,
    output: `
      stylex.inject(".nomnueuz{height:33.3333px}", 1);
    `,
  },
  'auto-adds quotes around values for content': {
    input: `
      const styles = stylex.create({
        default: {
          content: '',
        },
        other: {
          content: 'next',
        },
        withQuotes: {
          content: '"prev"',
        }
      });
    `,
    output: `
      stylex.inject(".axp1y60l{content:\\\"\\\"}", 1);
      stylex.inject(".k48iq9xp{content:\\\"next\\\"}", 1);
      stylex.inject(".jjrsgf30{content:\\\"prev\\\"}", 1);
    `,
  },
  'leaves attr functions alone for content': {
    input: `
      const styles = stylex.create({
        default: {
          content: 'attr(some-attribute)',
        },
      });
    `,
    output: `
      stylex.inject(".fbkz01wb{content:attr(some-attribute)}", 1);
    `,
  },
  'transforms pseudo object to CSS': {
    input: `
      const styles = stylex.create({
        default: {
          ':hover': {
            backgroundColor: 'red',
            color: 'blue',
          },
        },
      });
    `,
    output: `
      stylex.inject(".pbqw5nlk:hover{background-color:red}", 8);
      stylex.inject(".dvoqa86r:hover{color:blue}", 8);
    `,
  },

  'transforms invalid pseudo object to CSS': {
    input: `
      const styles = stylex.create({
        default: {
          ':invalpwdijad': {
            backgroundColor: 'red',
            color: 'blue',
          },
        },
      });
    `,
    output: `
      stylex.inject(".k6unt73l:invalpwdijad{background-color:red}", 2);
      stylex.inject(".e05g6ngh:invalpwdijad{color:blue}", 2);
    `,
  },

  'transforms pseudo object to CSS with correct order': {
    input: `
      const styles = stylex.create({
        default: {
          ':hover': {
            backgroundColor: 'red',
            color: 'blue',
          },
          ':active': {
            backgroundColor: 'blue',
          },
          ':focus': {
            backgroundColor: 'yellow',
          }
        },
      });
    `,
    output: `
      stylex.inject(".pbqw5nlk:hover{background-color:red}", 8);
      stylex.inject(".dvoqa86r:hover{color:blue}", 8);
      stylex.inject(".h5pumea0:active{background-color:blue}", 10);
      stylex.inject(".wfgokdwq:focus{background-color:yellow}", 9);
    `,
  },
  'transforms multiple namespaces': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
        },
        default2: {
          color: 'blue',
        },
      });
    `,
    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
    `,
  },

  'transforms plain stylex value call with strings': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      styles('default', 'default2');
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "h3ivgpu3 n6f2byep";
    `,
  },

  'DUPEABOVE: transforms plain stylex call with namespaces': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles.default, styles.default2);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "h3ivgpu3 n6f2byep";
    `,
  },

  'transforms plain stylex value call with numbers': {
    input: `
      const styles = stylex.create({
        0: {
          color: 'red',
        },
        1: {
          backgroundColor: 'blue',
        }
      });
      styles(0, 1);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "h3ivgpu3 n6f2byep";
    `,
  },

  'DUPEABOVE: transforms plain stylex value call with numbers': {
    input: `
      const styles = stylex.create({
        0: {
          color: 'red',
        },
        1: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles[0], styles[1]);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "h3ivgpu3 n6f2byep";
    `,
  },

  'transforms plain stylex value call with computed numbers': {
    input: `
      const styles = stylex.create({
        [0]: {
          color: 'red',
        },
        [1]: {
          backgroundColor: 'blue',
        }
      });
      styles(0, 1);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "h3ivgpu3 n6f2byep";
    `,
  },

  'DUPEABOVE: transforms plain stylex value call with computed numbers': {
    input: `
      const styles = stylex.create({
        [0]: {
          color: 'red',
        },
        [1]: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles[0], styles[1]);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "h3ivgpu3 n6f2byep";
    `,
  },

  'COMPOSITION DUPEABOVE: transforms plain stylex value call with computed numbers': {
    input: `
      const styles = stylex.create({
        [0]: {
          color: 'red',
        },
        [1]: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles[variant]);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      const styles = {
        [0]: {
          color: 'h3ivgpu3',
        },
        [1]: {
          backgroundColor: 'n6f2byep',
        }
      };
      stylex(styles[variant]);
    `,
  },

  'COMPOSITION: only converts create call when there is composition': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles.default, styles.default2, props);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      const styles = {
        default: {
          color: 'h3ivgpu3',
        },
        default2: {
          backgroundColor: 'n6f2byep',
        }
      };
      stylex(styles.default, styles.default2, props);
    `,
  },

  'COMPOSITION: triggers composition on computed key access': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles[props.variant]);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      const styles = {
        default: {
          color: 'h3ivgpu3',
        },
        default2: {
          backgroundColor: 'n6f2byep',
        }
      };
      stylex(styles[props.variant]);
    `,
  },

  'Does not trigger composition on computed key access with a string': {
    input: `
      const styles = stylex.create({
        'default-2': {
          backgroundColor: 'blue',
        }
      });
      stylex(styles['default-2']);
    `,
    output: `
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      'n6f2byep';
    `,
  },

  'COMPOSITION: triggers composition when values are exported': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      styles('default', props && 'default2');
      stylex(styles.default, styles.default2);

      const foo = styles;
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      const styles = {
        default: {
          color: 'h3ivgpu3',
        },
        default2: {
          backgroundColor: 'n6f2byep',
        }
      };
      stylex(styles.default, props && styles.default2);
      stylex(styles.default, styles.default2);

      const foo = styles;
    `,
  },

  'COMPOSITION: converts factory calls to stylex calls when composing': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      const x = styles('default');
      const y = styles('default', active && 'default2');
      const z = styles(props ? 'default2' : 'default');
      stylex(styles.default, styles.default2, props);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      const styles = {
        default: {
          color: 'h3ivgpu3',
        },
        default2: {
          backgroundColor: 'n6f2byep',
        }
      };
      const x = stylex(styles.default);
      const y = stylex(styles.default, active && styles.default2);
      const z = stylex(props ? styles.default2 : styles.default);
      stylex(styles.default, styles.default2, props);
    `,
  },

  'transforms plain stylex call with multiple bindings namespaces': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
      });
      const otherStyles = stylex.create({
        default: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles.default, otherStyles.default);
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "h3ivgpu3 n6f2byep";
    `,
  },

  'transforms plain stylex value call with strings containing collisions': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      styles('default', 'default2');
    `,
    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "n6f2byep";
    `,
  },

  'DUPEABOVE: transforms plain stylex value call with strings containing collisions': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
        },
        default2: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles.default, styles.default2);
    `,
    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      "n6f2byep";
    `,
  },

  'transforms plain stylex value call with conditions': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
        },
        active: {
          color: 'blue',
        }
      });
      styles('default', isActive && 'active');
    `,
    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
      "gyzkc3zm" + (isActive ? " y6ups3dp" : "");
    `,
  },

  'DUPEABOVE: transforms plain stylex value call with conditions': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
        },
        active: {
          color: 'blue',
        }
      });
      stylex(styles.default, isActive && styles.active);
    `,
    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
      "gyzkc3zm" + (isActive ? " y6ups3dp" : "");
    `,
  },

  'transforms plain stylex value call with a map of conditions': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
        },
        active: {
          color: 'blue',
        }
      });
      styles({
        default: true,
        active: isActive,
      });
    `,
    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
      "gyzkc3zm" + (isActive ? " y6ups3dp" : "");
    `,
  },

  'transforms plain stylex value call with a map of colliding conditions': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        active: {
          color: 'blue',
        }
      });
      styles({
        default: true,
        active: isActive,
      });
    `,
    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
      stylex.dedupe({
        "color-1": "h3ivgpu3"
      }, isActive ? {
        "color-1": "y6ups3dp"
      } : null);
    `,
  },

  'add dev class name to plain stylex value calls': {
    options: {
      filename: 'html/js/FooBar.react.js',
      dev: true,
    },

    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        }
      });
      styles('default');
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      "FooBar__default h3ivgpu3";
    `,
  },

  'DUPEABOVE: add dev class name to plain stylex value calls': {
    options: {
      filename: 'html/js/FooBar.react.js',
      dev: true,
    },

    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        }
      });
      stylex(styles.default);
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      "FooBar__styles.default h3ivgpu3";
    `,
  },

  'add dev class name to condition stylex value calls': {
    options: {
      filename: 'html/js/FooBar.react.js',
      dev: true,
    },

    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        active: {
          backgroundColor: 'blue',
        }
      });
      styles('default', isActive && 'active');
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1)
      "FooBar__default h3ivgpu3" + (isActive ? " FooBar__active n6f2byep" : "");
    `,
  },

  'DUPEABOVE: add dev class name to condition stylex value calls': {
    options: {
      filename: 'html/js/FooBar.react.js',
      dev: true,
    },

    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        active: {
          backgroundColor: 'blue',
        }
      });
      stylex(styles.default, isActive && styles.active);
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1)
      "FooBar__styles.default h3ivgpu3" + (isActive ? " FooBar__styles.active n6f2byep" : "");
    `,
  },

  'add dev class name to condition stylex calls with multiple bindings': {
    options: {
      filename: 'html/js/FooBar.react.js',
      dev: true,
    },

    input: `
      const aStyles = stylex.create({
        default: {
          color: 'red',
        },
      });
      const bStyles = stylex.create({
        default: {
          backgroundColor: 'blue',
        }
      });
      stylex(aStyles.default, isActive && bStyles.default);
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1)
      "FooBar__aStyles.default h3ivgpu3" + (isActive ? " FooBar__bStyles.default n6f2byep" : "");
    `,
  },

  'add dev class name to collision stylex value calls': {
    options: {
      filename: 'html/js/FooBar.react.js',
      dev: true,
    },

    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        active: {
          color: 'blue',
        }
      });
      styles('default', isActive && 'active');
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
      stylex.dedupe({
        "FooBar__default": "FooBar__default",
        "color-1": "h3ivgpu3"
      }, isActive ? {
        "FooBar__active": "FooBar__active",
        "color-1": "y6ups3dp"
      } : null);
    `,
  },

  'DUPEABOVE: add dev class name to collision stylex value calls': {
    options: {
      filename: 'html/js/FooBar.react.js',
      dev: true,
    },

    input: `
      const styles = stylex.create({
        default: {
          color: 'red',
        },
        active: {
          color: 'blue',
        }
      });
      stylex(styles.default, isActive && styles.active);
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".y6ups3dp{color:blue}", 1);
      stylex.dedupe({
        "FooBar__styles.default": "FooBar__styles.default",
        "color-1": "h3ivgpu3"
      }, isActive ? {
        "FooBar__styles.active": "FooBar__styles.active",
        "color-1": "y6ups3dp"
      } : null);
    `,
  },

  'transforms unitless properties': {
    input: `
      const styles = stylex.create({
        default: {
          fontWeight: 500,
        },
      });
    `,

    output: `
      stylex.inject(".tpi2lg9u{font-weight:500}", 1);
    `,
  },

  'transforms number properties to px': {
    input: `
      const styles = stylex.create({
        default: {
          height: 500,
        },
      });
    `,

    output: `
      stylex.inject(".mjo95iq7{height:500px}", 1);
    `,
  },

  'transforms transition-duration to milliseconds': {
    input: `
      const styles = stylex.create({
        default: {
          transitionDuration: 500,
        },
      });
    `,

    output: `
      stylex.inject(".gkvswz3s{transition-duration:.5s}", 1);
    `,
  },

  'transforms arrays': {
    input: `
      const styles = stylex.create({
        default: {
          transitionDuration: [500, 1000],
        },
      });
    `,

    output: `
      stylex.inject(".l6rz7p1t{transition-duration:.5s,1s}", 1);
    `,
  },

  'transforms keyframes': {
    input: `
      const name = stylex.keyframes({
        from: {
          backgroundColor: 'red',
        },

        to: {
          backgroundColor: 'blue',
        }
      });
    `,
    output: `
      stylex.inject("@keyframes ptsi9t9a-B{from{background-color:red;}to{background-color:blue;}}", 1);
      const name = "ptsi9t9a-B";
    `,
  },

  'allows template literals referring to keyframes': {
    input: `
      const name = stylex.keyframes({
        from: {
          backgroundColor: 'blue',
        },
        to: {
          backgroundColor: 'red',
        },
      });

      const styles = stylex.create({
        default: {
          animation: \`3s \${name}\`,
        },
      });
    `,

    output: `
      stylex.inject("@keyframes lz712mjz-B{from{background-color:blue;}to{background-color:red;}}", 1);
      const name = "lz712mjz-B";
      stylex.inject(".qna8o59p{animation:3s lz712mjz-B}", 0.1);
    `,
  },

  "don't rewrite shadowed styles": {
    input: `
      const styles = stylex.create({
        default: {
          color: 'blue',
        },
      });

      {
        let styles = function() {};
        styles();
      }
    `,

    output: `
      stylex.inject(".y6ups3dp{color:blue}", 1);
      {
        let styles = function () {};

        styles();
      }
    `,
  },

  'ensure pseudo selector and base namespace styles are applied': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'blue',
          ':hover': {
            backgroundColor: 'red',
          }
        }
      });
      styles('default');
    `,
    output: `
      stylex.inject(".y6ups3dp{color:blue}", 1);
      stylex.inject(".pbqw5nlk:hover{background-color:red}", 8);
      "pbqw5nlk y6ups3dp";
    `,
  },

  'DUPEABOVE: ensure pseudo selector and base namespace styles are applied': {
    input: `
      const styles = stylex.create({
        default: {
          color: 'blue',
          ':hover': {
            backgroundColor: 'red',
          }
        }
      });
      stylex(styles.default);
    `,
    output: `
      stylex.inject(".y6ups3dp{color:blue}", 1);
      stylex.inject(".pbqw5nlk:hover{background-color:red}", 8);
      "pbqw5nlk y6ups3dp";
    `,
  },

  'ensure that the first argument of a stylex.dedupe object.assign call is an object': {
    input: `
      const styles = stylex.create({
        highLevel: {
          marginTop: 24,
        },
        lowLevel: {
          marginTop: 16,
        },
      });
      styles({
        highLevel: headingLevel === 1 || headingLevel === 2,
        lowLevel: headingLevel === 3 || headingLevel === 4,
      });
    `,
    output: `
      stylex.inject(".gmvq99xn{margin-top:24px}", 1);
      stylex.inject(".r6ydv39a{margin-top:16px}", 1);
      stylex.dedupe(headingLevel === 1 || headingLevel === 2 ? {
        "margin-top-1": "gmvq99xn"
      } : {}, headingLevel === 3 || headingLevel === 4 ? {
        "margin-top-1": "r6ydv39a"
      } : null);
    `,
  },

  "don't output style classes when in test mode": {
    options: {
      filename: 'html/js/FooBar.react.js',
      test: true,
      dev: true,
    },

    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
        },

        blue: {
          backgroundColor: 'blue',
        },
      });
      styles('default');
      styles('default', isBlue && 'blue');
      styles({
        default: true,
        blue: isBlue,
      });
    `,

    output: `
        stylex.inject(".gyzkc3zm{background-color:red}", 1);
        stylex.inject(".n6f2byep{background-color:blue}", 1);
        "FooBar__default";
        stylex.dedupe({
          "FooBar__default": "FooBar__default",
        }, isBlue ? {
          "FooBar__blue": "FooBar__blue",
        } : null);
        stylex.dedupe({
          "FooBar__default": "FooBar__default",
        }, isBlue ? {
          "FooBar__blue": "FooBar__blue",
        } : null);
    `,
  },

  "ensure multiple conditional namespaces don't cause excess whitespace": {
    input: `
      const styles = stylex.create({
        foo: {
          color: 'red',
        },
        bar: {
          backgroundColor: 'blue',
        },
      });

      styles({
        foo: isFoo,
        bar: isBar,
      });
    `,

    output: `
      stylex.inject(".h3ivgpu3{color:red}", 1);
      stylex.inject(".n6f2byep{background-color:blue}", 1);
      (isFoo ? "h3ivgpu3" : "") + (isBar ? " n6f2byep" : "");
    `,
  },

  'correctly builds priority for special rules': {
    input: `
      const styles = stylex.create({
        foo: {
          margin: '5px',
          marginStart: 10,

          ':hover': {
            margin: 10,
            marginStart: 15,
          },
        },

        bar: {
          marginEnd: 8,
        },
      });
    `,

    output: `
      stylex.inject(".nthtkgg5{margin-top:5px}", 1);
      stylex.inject(".bwjycg1r{margin-right:5px}", 1, ".bwjycg1r{margin-left:5px}");
      stylex.inject(".jroqu855{margin-bottom:5px}", 1);
      stylex.inject(".a60616oh{margin-left:10px}", 1, ".a60616oh{margin-right:10px}");
      stylex.inject(".sii3s55r:hover{margin-top:10px}", 8);
      stylex.inject(".ke8bxclx:hover{margin-right:10px}", 8, ".ke8bxclx:hover{margin-left:10px}");
      stylex.inject(".cq1pu66m:hover{margin-bottom:10px}", 8);
      stylex.inject(".d1b1ivgl:hover{margin-left:15px}", 8, ".d1b1ivgl:hover{margin-right:15px}");
      stylex.inject(".h07fizzr{margin-right:8px}", 1, ".h07fizzr{margin-left:8px}");
    `,
  },

  'correctly remove shadowed properties when using no conditions': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
        },

        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });
      styles('bar', 'foo');
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".p4n9ro91{padding-right:5px}", 1, ".p4n9ro91{padding-left:5px}");
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      "t4os9e1m onux6t7x p4n9ro91 d1v569po";
    `,
  },

  'DUPEABOVE: correctly remove shadowed properties when using no conditions': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
        },
        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });
      stylex(styles.bar, styles.foo);
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".p4n9ro91{padding-right:5px}", 1, ".p4n9ro91{padding-left:5px}");
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      "t4os9e1m onux6t7x p4n9ro91 d1v569po";
    `,
  },

  'correctly remove shadowed properties when using no conditions with shadowed namespace styles': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
          paddingEnd: 10,
        },

        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });
      styles('bar', 'foo');
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      "ejhi0i36 t4os9e1m onux6t7x d1v569po";
    `,
  },

  'DUPEABOVE: correctly remove shadowed properties when using no conditions with shadowed namespace styles': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
          paddingEnd: 10,
        },

        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });
      stylex(styles.bar, styles.foo);
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      "ejhi0i36 t4os9e1m onux6t7x d1v569po";
    `,
  },

  'COMPOSITION: correctly remove shadowed properties when using no conditions with shadowed namespace styles': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
          paddingEnd: 10,
        },

        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });

      module.exports = styles;
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      const styles = {
        foo: {
          paddingTop: "d1v569po",
          paddingBottom: "onux6t7x",
          paddingStart: "t4os9e1m",
          paddingEnd: "ejhi0i36"
        },
        bar: {
          paddingTop: "ngbj85sm",
          paddingEnd: "pdnn8mpk",
          paddingBottom: "rt9i6ysf",
          paddingStart: "qbvjirod"
        },
      };
      module.exports = styles;
    `,
  },

  'COMPOSITION: test imported spreads': {
    input: `
      const styles = stylex.create({
        foo: {
          ...(importedStyles: XStyle<>),
          padding: 5,
          paddingEnd: 10,
        },

        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      const styles = {
        foo: {
          ...importedStyles,
          paddingTop: "d1v569po",
          paddingBottom: "onux6t7x",
          paddingStart: "t4os9e1m",
          paddingEnd: "ejhi0i36"
        },
        bar: {
          paddingTop: "ngbj85sm",
          paddingEnd: "pdnn8mpk",
          paddingBottom: "rt9i6ysf",
          paddingStart: "qbvjirod"
        },
      };
    `,
  },

  'React-Native shorthands: correctly remove shadowed properties when using no conditions with shadowed namespace styles': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
          paddingHorizontal: 10,
        },

        bar: {
          padding: 2,
          paddingHorizontal: 10,
        },
      });

      module.exports = styles;
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      const styles = {
        foo: {
          paddingTop: "d1v569po",
          paddingBottom: "onux6t7x",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
        bar: {
          paddingTop: "ngbj85sm",
          paddingBottom: "rt9i6ysf",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
      };
      module.exports = styles;
    `,
  },

  'ES6 exports: correctly export named declaration': {
    input: `
      export const styles = (stylex.create({
        foo: {
          padding: 5,
          paddingHorizontal: 10,
        },

        bar: {
          padding: 2,
          paddingHorizontal: 10,
        },
      }): MyStyles);
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      export const styles = ({
        foo: {
          paddingTop: "d1v569po",
          paddingBottom: "onux6t7x",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
        bar: {
          paddingTop: "ngbj85sm",
          paddingBottom: "rt9i6ysf",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
      }: MyStyles);
    `,
  },

  'ES6 exports: correctly export named property': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
          paddingHorizontal: 10,
        },

        bar: {
          padding: 2,
          paddingHorizontal: 10,
        },
      });

      export {styles}
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      const styles = {
        foo: {
          paddingTop: "d1v569po",
          paddingBottom: "onux6t7x",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
        bar: {
          paddingTop: "ngbj85sm",
          paddingBottom: "rt9i6ysf",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
      };
      export {styles};
    `,
  },

  'ES6 exports: correctly export default property': {
    input: `
      export default (stylex.create({
        foo: {
          padding: 5,
          paddingHorizontal: 10,
        },

        bar: {
          padding: 2,
          paddingHorizontal: 10,
        },
      }): MyStyle);
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".ejhi0i36{padding-right:10px}", 1, ".ejhi0i36{padding-left:10px}");
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      export default ({
        foo: {
          paddingTop: "d1v569po",
          paddingBottom: "onux6t7x",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
        bar: {
          paddingTop: "ngbj85sm",
          paddingBottom: "rt9i6ysf",
          paddingEnd: "ejhi0i36",
          paddingStart: "qbvjirod"
        },
      }: MyStyle);
    `,
  },

  'Correctly inline within variable declarations': {
    input: `
      const styles = stylex.create({
        foo: {
          paddingBottom: 16,
        },
      });

      const a = function() {
        return stylex(styles.foo);
      }
    `,

    output: `
      stylex.inject(\".ez8dtbzv{padding-bottom:16px}\", 1);
      const a = function() {
        return \"ez8dtbzv\";
      };
    `,
  },

  'Correctly inline within export declarations': {
    input: `
      const styles = stylex.create({
        foo: {
          paddingBottom: 16,
        },
      });
      export default function MyExportDefault() {
        return stylex(styles.foo);
      }
      export function MyExport() {
        return stylex(styles.foo);
      }
    `,

    output: `
      stylex.inject(\".ez8dtbzv{padding-bottom:16px}\", 1);
      export default function MyExportDefault() {
        return \"ez8dtbzv\";
      }
      export function MyExport() {
        return \"ez8dtbzv\";
      }
    `,
  },

  'correctly removes shadowed properties when using conditions': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
        },

        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });

      styles({
        bar: true,
        foo: isFoo,
      });
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".p4n9ro91{padding-right:5px}", 1, ".p4n9ro91{padding-left:5px}");
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      stylex.dedupe({
        "padding-top-1": "ngbj85sm",
        "padding-end-1": "pdnn8mpk",
        "padding-bottom-1": "rt9i6ysf",
        "padding-start-1": "qbvjirod",
      }, isFoo ? {
        "padding-top-1": "d1v569po",
        "padding-end-1": "p4n9ro91",
        "padding-bottom-1": "onux6t7x",
        "padding-start-1": "t4os9e1m"
      } : null);
    `,
  },

  'correctly removes shadowed properties when using conditions with shadowed namespace styles': {
    input: `
      const styles = stylex.create({
        foo: {
          padding: 5,
          paddingStart: 15,
        },

        bar: {
          padding: 2,
          paddingStart: 10,
        },
      });

      styles({
        bar: true,
        foo: isFoo,
      });
    `,

    output: `
      stylex.inject(".d1v569po{padding-top:5px}", 1);
      stylex.inject(".p4n9ro91{padding-right:5px}", 1, ".p4n9ro91{padding-left:5px}");
      stylex.inject(".onux6t7x{padding-bottom:5px}", 1);
      stylex.inject(".fk6all4f{padding-left:15px}", 1, ".fk6all4f{padding-right:15px}");
      stylex.inject(".ngbj85sm{padding-top:2px}", 1);
      stylex.inject(".pdnn8mpk{padding-right:2px}", 1, ".pdnn8mpk{padding-left:2px}");
      stylex.inject(".rt9i6ysf{padding-bottom:2px}", 1);
      stylex.inject(".qbvjirod{padding-left:10px}", 1, ".qbvjirod{padding-right:10px}");
      stylex.dedupe({
        "padding-top-1": "ngbj85sm",
        "padding-end-1": "pdnn8mpk",
        "padding-bottom-1": "rt9i6ysf",
        "padding-start-1": "qbvjirod",
      }, isFoo ? {
        "padding-top-1": "d1v569po",
        "padding-end-1": "p4n9ro91",
        "padding-bottom-1": "onux6t7x",
        "padding-start-1": "fk6all4f",
      } : null);
    `,
  },

  'prefixes vendor rules': {
    input: `
      const styles = stylex.create({
        default: {
          userSelect: 'none',
        },
      });
    `,

    output: `
      stylex.inject(".f14ij5to{user-select:none;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none}", 1);
    `,
  },

  'transforms media queries': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
          '@media (min-width: 1000px)': {
            backgroundColor: 'blue',
          },
          '@media (min-width: 2000px)': {
            backgroundColor: 'purple',
          },
        },
      });
      styles('default');
    `,

    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject("@media (min-width: 1000px){.psrm59q7.psrm59q7{background-color:blue}}", 2);
      stylex.inject("@media (min-width: 2000px){.bi4461le.bi4461le{background-color:purple}}", 2);
      "bi4461le psrm59q7 gyzkc3zm";
      `,
  },

  'transforms supports queries': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
          '@supports (hover: hover)': {
            backgroundColor: 'blue',
          },
          '@supports not (hover: hover)': {
            backgroundColor: 'purple',
          },
        },
      });
      styles('default');
    `,

    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject("@supports (hover: hover){.s3zv1jgm.s3zv1jgm{background-color:blue}}", 2);
      stylex.inject("@supports not (hover: hover){.btbcoxja.btbcoxja{background-color:purple}}", 2);
      "btbcoxja s3zv1jgm gyzkc3zm";
      `,
  },

  'DUPEABOVE: transforms media queries': {
    input: `
      const styles = stylex.create({
        default: {
          backgroundColor: 'red',
          '@media (min-width: 1000px)': {
            backgroundColor: 'blue',
          },
          '@media (min-width: 2000px)': {
            backgroundColor: 'purple',
          },
        },
      });
      stylex(styles.default);
    `,

    output: `
      stylex.inject(".gyzkc3zm{background-color:red}", 1);
      stylex.inject("@media (min-width: 1000px){.psrm59q7.psrm59q7{background-color:blue}}", 2);
      stylex.inject("@media (min-width: 2000px){.bi4461le.bi4461le{background-color:purple}}", 2);
      "bi4461le psrm59q7 gyzkc3zm";
      `,
  },

  'should not be able to import stylex to other name': {
    input: `import foo from 'stylex'`,
    throws: true,
  },

  'correctly does nothing to valid imports': {
    input: `
      import stylex from 'stylex';
      import {foo, bar} from 'other';
    `,
    output: `
      import stylex from 'stylex';
      import {foo, bar} from 'other';
    `,
  },

  'should not be able to require stylex to other name': {
    input: `const foo = require('stylex')`,
    throws: true,
  },

  'correctly does nothing to valid requires': {
    input: `
      const stylex = require('stylex');
      const {foo, bar} = require('other');
    `,
    output: `
      const stylex = require('stylex');
      const {foo, bar} = require('other');
    `,
  },

  'transforms font size from px to rem': {
    input: `
      const styles = stylex.create({
        foo: {
          fontSize: '24px',
        },

        bar: {
          fontSize: 18,
        },

        baz: {
          fontSize: '1.25rem',
        },

        qux: {
          fontSize: 'inherit',
        }
      });
    `,
    output: `
      stylex.inject(".qntmu8s7{font-size:1.5rem}", 1);
      stylex.inject(".rxmdf5ve{font-size:1.125rem}", 1);
      stylex.inject(".rq8durfe{font-size:1.25rem}", 1);
      stylex.inject(".jwegzro5{font-size:inherit}", 1);
    `,
  },

  'transforms ::thumb to vendor prefixed pseudo-classes': {
    input: `
      const styles = stylex.create({
        foo: {
          '::thumb': {
            width: 16,
          },
        },
      });
    `,
    output: `
      stylex.inject(".pbjb215a::-webkit-slider-thumb{width:16px}", 13);
      stylex.inject(".pbjb215a::-moz-range-thumb{width:16px}", 13);
      stylex.inject(".pbjb215a::-ms-thumb{width:16px}", 13);
    `,
  },

  'transforms a simple RTL flip': {
    input: `
      const styles = stylex.create({
        default: {
          paddingStart: '5px',
        },
      });
    `,
    output: `
      stylex.inject(".t4os9e1m{padding-left:5px}", 1, ".t4os9e1m{padding-right:5px}");
    `,
  },

  'transforms margin for RTL': {
    input: `
      const styles = stylex.create({
        default: {
          margin: '1 2 3 4',
        },
        single: {
          margin: '1',
        },
        two: {
          margin: '1 2',
        },
      });
    `,
    output: `
      stylex.inject(".mr4w5f57{margin-top:1}", 1);
      stylex.inject(".fowiaccw{margin-right:2}", 1, ".fowiaccw{margin-left:2}");
      stylex.inject(".iqsy6m2w{margin-bottom:3}", 1);
      stylex.inject(".pz2itsrw{margin-left:4}", 1, ".pz2itsrw{margin-right:4}");
      stylex.inject(".mr4w5f57{margin-top:1}", 1);
      stylex.inject(".orjg05xc{margin-right:1}", 1, ".orjg05xc{margin-left:1}");
      stylex.inject(".hh48qzsu{margin-bottom:1}", 1);
      stylex.inject(".rhq136pg{margin-left:1}", 1, ".rhq136pg{margin-right:1}");
      stylex.inject(".mr4w5f57{margin-top:1}", 1);
      stylex.inject(".fowiaccw{margin-right:2}", 1, ".fowiaccw{margin-left:2}");
      stylex.inject(".hh48qzsu{margin-bottom:1}", 1);
      stylex.inject(".s05kb7bq{margin-left:2}", 1, ".s05kb7bq{margin-right:2}");
    `,
  },

  'rtl keyframes': {
    input: `
      const name = stylex.keyframes({
        from: {
          start: 0,
        },

        to: {
          start: 500,
        },
      });

      const styles = stylex.create({
        root: {
          animationName: name,
        },
      });
    `,

    output: `
      stylex.inject("@keyframes h768rhe7-B{from{left:0;}to{left:500px;}}", 1, "@keyframes h768rhe7-B{from{right:0;}to{right:500px;}}");
      const name = "h768rhe7-B";
      stylex.inject(".i3ugh2qu{animation-name:h768rhe7-B}", 1);
    `,
  },

  'transforms styles usage before declaration': {
    input: `
      function Component() {
        styles('default');
      }

      const styles = stylex.create({
        default: {
          color: 'red',
        },
      });
    `,

    output: `
      function Component() {
        "h3ivgpu3";
      }

      stylex.inject(".h3ivgpu3{color:red}", 1);
    `,
  },

  'auto-expands overflow shorthand': {
    input: `
      const styles = stylex.create({
        default: {
          overflow: 'hidden',
        },
        short: {
          overflow: 'hidden visible',
        },
        shadow: {
          overflow: 'auto',
          overflowY: 'scroll',
        },
      });
    `,

    output: `
      stylex.inject(".lq84ybu9{overflow-x:hidden}", 1);
      stylex.inject(".hf30pyar{overflow-y:hidden}", 1);
      stylex.inject(".lq84ybu9{overflow-x:hidden}", 1);
      stylex.inject(".z2vv26z9{overflow-y:visible}", 1);
      stylex.inject(".ba4ynyj4{overflow-x:auto}", 1);
      stylex.inject(".efm7ts3d{overflow-y:scroll}", 1);
    `,
  },

  'auto-expands borderRadius shorthand': {
    input: `
      const styles = stylex.create({
        default: {
          borderRadius: '8px 8px 0 0',
        },
        withCalc: {
          borderRadius: '8px 8px calc(100% - 2px) 0',
        }
      });
    `,

    output: `
      stylex.inject(".h8391g91{border-top-left-radius:8px}", 1, ".h8391g91{border-top-right-radius:8px}");
      stylex.inject(".m0cukt09{border-top-right-radius:8px}", 1, ".m0cukt09{border-top-left-radius:8px}");
      stylex.inject(".nfcwbgbd{border-bottom-right-radius:0}", 1, ".nfcwbgbd{border-bottom-left-radius:0}");
      stylex.inject(".mivixfar{border-bottom-left-radius:0}", 1, ".mivixfar{border-bottom-right-radius:0}");
      stylex.inject(".h8391g91{border-top-left-radius:8px}", 1, ".h8391g91{border-top-right-radius:8px}");
      stylex.inject(".m0cukt09{border-top-right-radius:8px}", 1, ".m0cukt09{border-top-left-radius:8px}");
      stylex.inject(".gy0ye85a{border-bottom-right-radius:calc(100% - 2px)}", 1, ".gy0ye85a{border-bottom-left-radius:calc(100% - 2px)}");
      stylex.inject(".mivixfar{border-bottom-left-radius:0}", 1, ".mivixfar{border-bottom-right-radius:0}");
    `,
  },

  'auto-expands border shorthands': {
    input: `
      const borderRadius = 2;
      const styles = stylex.create({
        default: {
          margin: 'calc((100% - 50px) * 0.5) 20px 0',
        },
        error: {
          borderColor: 'red blue',
          borderStyle: 'dashed',
          borderWidth: '0 0 2px 0',
        },
        root: {
          border: '1px solid var(--divider)',
          borderRadius: borderRadius * 2,
          borderBottom: '5px solid red',
        },
        short: {
          padding: 'calc((100% - 50px) * 0.5) var(--rightpadding, 20px)',
          paddingTop: 0,
        },
        valid: {
          borderColor: 'green',
          borderStyle: 'solid',
          borderWidth: 1,
        }
      });
    `,

    output: `
      const borderRadius = 2;
      stylex.inject(".i3w7snjj{margin-top:calc((100% - 50px) * .5)}", 1);
      stylex.inject(".idhzwy6c{margin-right:20px}", 1, ".idhzwy6c{margin-left:20px}");
      stylex.inject(".kjdc1dyq{margin-bottom:0}", 1);
      stylex.inject(".mswf2hbd{margin-left:20px}", 1, ".mswf2hbd{margin-right:20px}");
      stylex.inject(".h0hlbn7z{border-top-color:red}", 0.4);
      stylex.inject(".tvldids3{border-right-color:blue}", 0.4, ".tvldids3{border-left-color:blue}");
      stylex.inject(".awjel6go{border-bottom-color:red}", 0.4);
      stylex.inject(".n9snmaig{border-left-color:blue}", 0.4, ".n9snmaig{border-right-color:blue}");
      stylex.inject(".mkcwp88r{border-top-style:dashed}", 0.4);
      stylex.inject(".gmfpv47j{border-right-style:dashed}", 0.4, ".gmfpv47j{border-left-style:dashed}");
      stylex.inject(".c9z4645e{border-bottom-style:dashed}", 0.4);
      stylex.inject(".su4h28ut{border-left-style:dashed}", 0.4, ".su4h28ut{border-right-style:dashed}");
      stylex.inject(".frfouenu{border-top-width:0}", 0.4);
      stylex.inject(".bonavkto{border-right-width:0}", 0.4, ".bonavkto{border-left-width:0}");
      stylex.inject(".ntrxh2kl{border-bottom-width:2px}", 0.4);
      stylex.inject(".r7bn319e{border-left-width:0}", 0.4, ".r7bn319e{border-right-width:0}");
      stylex.inject(".aiyajaxl{border-top:1px solid var(--divider)}", 0.3);
      stylex.inject(".fo7qhhrp{border-right:1px solid var(--divider)}", 0.3, ".fo7qhhrp{border-left:1px solid var(--divider)}");
      stylex.inject(".azmosjmx{border-left:1px solid var(--divider)}", 0.3, ".azmosjmx{border-right:1px solid var(--divider)}");
      stylex.inject(".dl2p71xr{border-top-left-radius:4px}", 1, ".dl2p71xr{border-top-right-radius:4px}");
      stylex.inject(".h0c7ht3v{border-top-right-radius:4px}", 1, ".h0c7ht3v{border-top-left-radius:4px}");
      stylex.inject(".j8nb7h05{border-bottom-right-radius:4px}", 1, ".j8nb7h05{border-bottom-left-radius:4px}");
      stylex.inject(".gffp4m6x{border-bottom-left-radius:4px}", 1, ".gffp4m6x{border-bottom-right-radius:4px}");
      stylex.inject(".j42iuzh4{border-bottom:5px solid red}", 0.3);
      stylex.inject(".h9d8p3y9{padding-right:var(--rightpadding,20px)}", 1, ".h9d8p3y9{padding-left:var(--rightpadding,20px)}");
      stylex.inject(".mbao2bx1{padding-bottom:calc((100% - 50px) * .5)}", 1);
      stylex.inject(".iroq9065{padding-left:var(--rightpadding,20px)}", 1, ".iroq9065{padding-right:var(--rightpadding,20px)}");
      stylex.inject(".srn514ro{padding-top:0}", 1);
      stylex.inject(".cqotfd8r{border-top-color:green}", 0.4);
      stylex.inject(".dth01l8s{border-right-color:green}", 0.4, ".dth01l8s{border-left-color:green}");
      stylex.inject(".fhwwqjh9{border-bottom-color:green}", 0.4);
      stylex.inject(".ozbm2uno{border-left-color:green}", 0.4, ".ozbm2uno{border-right-color:green}");
      stylex.inject(".s9ok87oh{border-top-style:solid}", 0.4);
      stylex.inject(".s9ljgwtm{border-right-style:solid}", 0.4, ".s9ljgwtm{border-left-style:solid}");
      stylex.inject(".lxqftegz{border-bottom-style:solid}", 0.4);
      stylex.inject(".bf1zulr9{border-left-style:solid}", 0.4, ".bf1zulr9{border-right-style:solid}");
      stylex.inject(".r4jidfu8{border-top-width:1px}", 0.4);
      stylex.inject(".ahb38r9s{border-right-width:1px}", 0.4, ".ahb38r9s{border-left-width:1px}");
      stylex.inject(".scpwgmsl{border-bottom-width:1px}", 0.4);
      stylex.inject(".opot3u1k{border-left-width:1px}", 0.4, ".opot3u1k{border-right-width:1px}");
    `,
  },

  'EDGECASE: transforms edge case property values containing CSS variables to point to a single local CSS variable': {
    input: `
      const styles = stylex.create({
        default: {
          boxShadow: '0px 2px 4px var(--shadow-1)',
        }
      });
    `,
    output: `
      stylex.inject(".gnxgxjws{--T68779821:0 2px 4px var(--shadow-1);-webkit-box-shadow:var(--T68779821);box-shadow:0 2px 4px var(--shadow-1)}", 1);
    `,
  },

  'EDGECASE: does not transform edge case property values containing no CSS variables': {
    input: `
      const styles = stylex.create({
        default: {
          boxShadow: '0px 2px 4px #000, 0px 12px 28px #000',
        }
      });
    `,
    output: `
      stylex.inject(".d5ozy75p{box-shadow:0 2px 4px #000,0 12px 28px #000}", 1, ".d5ozy75p{box-shadow:0 2px 4px #000, 0 12px 28px #000}");
    `,
  },
};

describe('stylex-transformation', () => {
  TestUtil.testSection(testData, transform);
});
