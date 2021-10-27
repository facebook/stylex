/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync: babelTransform } = require('@babel/core');

function transform(source, opts = {}) {
  return babelTransform(source, {
    filename: opts.filename,
    plugins: [[require('../src/index'), opts]],
  });
}

test('ensure metadata is correctly set', () => {
  const res = transform(` 
    const styles = stylex.create({
      foo: {
        color: 'red',
        height: 5,

        ':hover': {
          width: 10,
        }
      },
    });

    const name = stylex.keyframes({
      from: {
        left: 0,
      },

      to: {
        left: 100,
      }
    });
  `);

  expect(res.metadata).toEqual({
    stylex: [
      ['h3ivgpu3', { ltr: '.h3ivgpu3{color:red}', rtl: null }, 1],
      ['sws6tvwg', { ltr: '.sws6tvwg{height:5px}', rtl: null }, 1],
      ['ennk8xi2', { ltr: '.ennk8xi2:hover{width:10px}', rtl: null }, 8],
      [
        'gd0gnj7z-B',
        {
          ltr: '@keyframes gd0gnj7z-B{from{left:0;}to{left:100px;}}',
          rtl: null,
        },
        1,
      ],
    ],
  });
});

test('ensure stylex.create metadata is correctly set', () => {
  const res = transform(`
    const styles = stylex.create({
      foo: {
        color: 'red',
        height: 5,

        ':hover': {
          width: 10,
        }
      },
    });

    const name = stylex.keyframes({
      from: {
        left: 0,
      },

      to: {
        left: 100,
      }
    });
  `);

  expect(res.metadata).toEqual({
    stylex: [
      ['h3ivgpu3', { ltr: '.h3ivgpu3{color:red}', rtl: null }, 1],
      ['sws6tvwg', { ltr: '.sws6tvwg{height:5px}', rtl: null }, 1],
      ['ennk8xi2', { ltr: '.ennk8xi2:hover{width:10px}', rtl: null }, 8],
      [
        'gd0gnj7z-B',
        {
          ltr: '@keyframes gd0gnj7z-B{from{left:0;}to{left:100px;}}',
          rtl: null,
        },
        1,
      ],
    ],
  });
});

test('ensure spreads work correctly', () => {
  const res = transform(`
    const styles = stylex.create({
      foo: {
        ...stylex.flexBase,
        color: 'red',
        height: 5,

        ':hover': {
          width: 10,
        }
      },
    });
  `);

  expect(res.metadata).toEqual({
    stylex: [
      // Spread Styles
      ['o9w3sbdw', { ltr: '.o9w3sbdw{align-items:stretch}', rtl: null }, 1],
      ['gewhe1h2', { ltr: '.gewhe1h2{border-style:solid}', rtl: null }, 0.2],
      ['gcovof34', { ltr: '.gcovof34{border-width:0}', rtl: null }, 0.2],
      ['bdao358l', { ltr: '.bdao358l{box-sizing:border-box}', rtl: null }, 1],
      ['alzwoclg', { ltr: '.alzwoclg{display:flex}', rtl: null }, 1],
      ['cqf1kptm', { ltr: '.cqf1kptm{flex-direction:column}', rtl: null }, 1],
      ['cgu29s5g', { ltr: '.cgu29s5g{flex-grow:1}', rtl: null }, 1],
      ['i15ihif8', { ltr: '.i15ihif8{flex-shrink:1}', rtl: null }, 1],
      [
        'sl27f92c',
        { ltr: '.sl27f92c{justify-content:space-between}', rtl: null },
        1,
      ],
      ['kjdc1dyq', { ltr: '.kjdc1dyq{margin-bottom:0}', rtl: null }, 1],
      [
        'l7ghb35v',
        { ltr: '.l7ghb35v{margin-right:0}', rtl: '.l7ghb35v{margin-left:0}' },
        1,
      ],
      [
        'kmwttqpk',
        { ltr: '.kmwttqpk{margin-left:0}', rtl: '.kmwttqpk{margin-right:0}' },
        1,
      ],
      ['m8h3af8h', { ltr: '.m8h3af8h{margin-top:0}', rtl: null }, 1],
      ['dnr7xe2t', { ltr: '.dnr7xe2t{min-height:0}', rtl: null }, 1],
      ['aeinzg81', { ltr: '.aeinzg81{min-width:0}', rtl: null }, 1],
      ['rl78xhln', { ltr: '.rl78xhln{padding-bottom:0}', rtl: null }, 1],
      [
        'oxkhqvkx',
        { ltr: '.oxkhqvkx{padding-right:0}', rtl: '.oxkhqvkx{padding-left:0}' },
        1,
      ],
      [
        'nch0832m',
        { ltr: '.nch0832m{padding-left:0}', rtl: '.nch0832m{padding-right:0}' },
        1,
      ],
      ['srn514ro', { ltr: '.srn514ro{padding-top:0}', rtl: null }, 1],
      ['om3e55n1', { ltr: '.om3e55n1{position:relative}', rtl: null }, 1],
      ['g4tp4svg', { ltr: '.g4tp4svg{z-index:0}', rtl: null }, 1],
      // Other Styles
      ['h3ivgpu3', { ltr: '.h3ivgpu3{color:red}', rtl: null }, 1],
      ['sws6tvwg', { ltr: '.sws6tvwg{height:5px}', rtl: null }, 1],
      ['ennk8xi2', { ltr: '.ennk8xi2:hover{width:10px}', rtl: null }, 8],
    ],
  });
});

test('ensure spreads work correctly with stylex.create', () => {
  const res = transform(`
    const styles = stylex.create({
      foo: {
        ...stylex.flexBase,
        color: 'red',
        height: 5,

        ':hover': {
          width: 10,
        }
      },
    });
  `);

  expect(res.metadata).toEqual({
    stylex: [
      // Spread Styles
      ['o9w3sbdw', { ltr: '.o9w3sbdw{align-items:stretch}', rtl: null }, 1],
      ['gewhe1h2', { ltr: '.gewhe1h2{border-style:solid}', rtl: null }, 0.2],
      ['gcovof34', { ltr: '.gcovof34{border-width:0}', rtl: null }, 0.2],
      ['bdao358l', { ltr: '.bdao358l{box-sizing:border-box}', rtl: null }, 1],
      ['alzwoclg', { ltr: '.alzwoclg{display:flex}', rtl: null }, 1],
      ['cqf1kptm', { ltr: '.cqf1kptm{flex-direction:column}', rtl: null }, 1],
      ['cgu29s5g', { ltr: '.cgu29s5g{flex-grow:1}', rtl: null }, 1],
      ['i15ihif8', { ltr: '.i15ihif8{flex-shrink:1}', rtl: null }, 1],
      [
        'sl27f92c',
        { ltr: '.sl27f92c{justify-content:space-between}', rtl: null },
        1,
      ],
      ['kjdc1dyq', { ltr: '.kjdc1dyq{margin-bottom:0}', rtl: null }, 1],
      [
        'l7ghb35v',
        { ltr: '.l7ghb35v{margin-right:0}', rtl: '.l7ghb35v{margin-left:0}' },
        1,
      ],
      [
        'kmwttqpk',
        { ltr: '.kmwttqpk{margin-left:0}', rtl: '.kmwttqpk{margin-right:0}' },
        1,
      ],
      ['m8h3af8h', { ltr: '.m8h3af8h{margin-top:0}', rtl: null }, 1],
      ['dnr7xe2t', { ltr: '.dnr7xe2t{min-height:0}', rtl: null }, 1],
      ['aeinzg81', { ltr: '.aeinzg81{min-width:0}', rtl: null }, 1],
      ['rl78xhln', { ltr: '.rl78xhln{padding-bottom:0}', rtl: null }, 1],
      [
        'oxkhqvkx',
        { ltr: '.oxkhqvkx{padding-right:0}', rtl: '.oxkhqvkx{padding-left:0}' },
        1,
      ],
      [
        'nch0832m',
        { ltr: '.nch0832m{padding-left:0}', rtl: '.nch0832m{padding-right:0}' },
        1,
      ],
      ['srn514ro', { ltr: '.srn514ro{padding-top:0}', rtl: null }, 1],
      ['om3e55n1', { ltr: '.om3e55n1{position:relative}', rtl: null }, 1],
      ['g4tp4svg', { ltr: '.g4tp4svg{z-index:0}', rtl: null }, 1],
      // Other Styles
      ['h3ivgpu3', { ltr: '.h3ivgpu3{color:red}', rtl: null }, 1],
      ['sws6tvwg', { ltr: '.sws6tvwg{height:5px}', rtl: null }, 1],
      ['ennk8xi2', { ltr: '.ennk8xi2:hover{width:10px}', rtl: null }, 8],
    ],
  });
});
