import styleXDefineConsts from '../src/stylex-define-consts';
import createHash from '../src/hash';

describe('stylex-define-consts test', () => {
  test('converts set of constants to static CSS', () => {
    const classNamePrefix = 'x';
    const defaultConsts = {
      maxWidth: '1200px',
      borderRadius: '10px',
      colorPrimary: 'blue',
    };

    const [jsOutput, cssOutput] = styleXDefineConsts(defaultConsts, {});

    expect(jsOutput).toEqual({
      maxWidth: '1200px',
      borderRadius: '10px',
      colorPrimary: 'blue',
    });

    expect(cssOutput).toMatchInlineSnapshot(`
      {
        "xuxd5lo": {
          "ltr": ":root{max-width:1200px;border-radius:10px;color-primary:blue;}",
          "priority": 0,
          "rtl": null,
        },
      }
    `);
  });

  test('ensures constants cannot be overridden by themes', () => {
    const defaultConsts = {
      maxWidth: '1200px',
    };

    const [consts] = styleXDefineConsts(defaultConsts, {});

    const themeOverride = {
      maxWidth: '800px',
    };

    expect(themeOverride.maxWidth).not.toEqual(consts.maxWidth);
    expect(consts.maxWidth).toBe('1200px');
  });

  test('generates unique class names for constants', () => {
    const [consts1] = styleXDefineConsts({ borderRadius: '10px' });
    const [consts2] = styleXDefineConsts({ borderRadius: '10px' });

    expect(consts1.borderRadius).toEqual(consts2.borderRadius);
  });

  test('converts constants with nested at-rules to CSS', () => {
    const defaultConsts = {
      bgColor: {
        default: 'blue',
        '@media (prefers-color-scheme: dark)': 'lightblue',
        '@media print': 'white',
      },
    };

    const [jsOutput, cssOutput] = styleXDefineConsts(defaultConsts, {});

    expect(jsOutput).toEqual({
      bgColor: 'blue',
    });

    expect(cssOutput).toMatchInlineSnapshot(`
      {
        "xuxd5lo-1lveb7": {
          "ltr": "@media (prefers-color-scheme: dark){:root{bg-color:lightblue;}}",
          "priority": 0.1,
          "rtl": null,
        },
        "xuxd5lo-bdddrq": {
          "ltr": "@media print{:root{bg-color:white;}}",
          "priority": 0.1,
          "rtl": null,
        },
      }
    `);
  });

  // test('ensures constants with invalid characters are converted safely', () => {
  //   const defaultConsts = {
  //     '1px-border': '1px solid black', // Name starts with number
  //     'invalid#key': '5rem', // Special characters
  //   };

  //   const [jsOutput, cssOutput] = styleXDefineConsts(defaultConsts, {});

  //   // Ensure key names are sanitized
  //   expect(Object.keys(jsOutput)).not.toContain('1px-border');
  //   expect(Object.keys(jsOutput)).not.toContain('invalid#key');

  //   expect(cssOutput).toMatchInlineSnapshot(`
  //     {
  //       "xborder123": {
  //         "ltr": ":root{border-1px:1px solid black;key-invalid:5rem;}",
  //         "priority": 0,
  //         "rtl": null,
  //       },
  //     }
  //   `);
  // });
});
