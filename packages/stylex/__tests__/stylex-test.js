/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 */

'use strict';

import { styleSheet } from '../src/StyleXSheet';
import stylex from '../src/stylex';

// TODO: priorities need testing
test('stylex.inject', () => {
  const prevCount = styleSheet.getRuleCount();
  stylex.inject('hey {}', 0);
  expect(styleSheet.getRuleCount()).toBeGreaterThan(prevCount);
});

describe('stylex', () => {
  test('basic resolve', () => {
    expect(stylex({ a: 'aaa', b: 'bbb' })).toBe('aaa bbb');
  });

  test('merge order', () => {
    expect(
      stylex([
        { a: 'a', ':hover': { aa: 'aa' } },
        { b: 'b' },
        { c: 'c', ':hover': { cc: 'cc' } },
      ])
    ).toBe('a aa b c cc');
  });

  test('with a top-level array of simple overridden classes', () => {
    expect(
      stylex([
        {
          backgroundColor: 'nu7423ey',
        },
        {
          backgroundColor: 'gh25dzvf',
        },
      ])
    ).toEqual('gh25dzvf');
  });

  test('with nested arrays and pseudoClasses overriding things', () => {
    expect(
      stylex([
        {
          backgroundColor: 'nu7423ey',
        },
        [
          {
            backgroundColor: 'abcdefg',
            ':hover': {
              backgroundColor: 'ksdfmwjs',
            },
          },
        ],
        {
          color: 'gofk2cf1',
          ':hover': {
            backgroundColor: 'rse6dlih',
          },
        },
      ])
    ).toEqual('abcdefg gofk2cf1 rse6dlih');
  });

  test('with just pseudoclasses', () => {
    expect(
      stylex(
        {
          ':hover': {
            backgroundColor: 'rse6dlih',
          },
        },
        {
          ':hover': {
            color: 'gofk2cf1',
          },
        }
      )
    ).toEqual('rse6dlih gofk2cf1');
  });

  test('with complicated set of arguments', () => {
    const styles = [
      {
        backgroundColor: 'nu7423ey',
        borderColor: 'tpe1esc0',
        borderStyle: 'gewhe1h2',
        borderWidth: 'gcovof34',
        boxSizing: 'bdao358l',
        display: 'rse6dlih',
        listStyle: 's5oniofx',
        marginTop: 'm8h3af8h',
        marginEnd: 'l7ghb35v',
        marginBottom: 'kjdc1dyq',
        marginStart: 'kmwttqpk',
        paddingTop: 'srn514ro',
        paddingEnd: 'oxkhqvkx',
        paddingBottom: 'rl78xhln',
        paddingStart: 'nch0832m',
        WebkitTapHighlightColor: 'qi72231t',
        textAlign: 'cr00lzj9',
        textDecoration: 'rn8ck1ys',
        whiteSpace: 'n3t5jt4f',
        wordWrap: 'gh25dzvf',
        zIndex: 'g4tp4svg',
      },
      false,
      false,
      false,
      false,
      [
        {
          cursor: 'fsf7x5fv',
          touchAction: 's3jn8y49',
        },
        false,
        {
          outline: 'icdlwmnq',
        },
        [
          {
            WebkitTapHighlightColor: 'oajrlxb2',
            cursor: 'nhd2j8a9',
            touchAction: 'f1sip0of',
          },
          false,
          false,
          {
            textDecoration: 'esuyzwwr',
            ':hover': {
              textDecoration: 'p8dawk7l',
            },
          },
          false,
          [
            {
              backgroundColor: 'g5ia77u1',
              border: 'e4t7hp5w',
              color: 'gmql0nx0',
              cursor: 'nhd2j8a9',
              display: 'q9uorilb',
              fontFamily: 'ihxqhq3m',
              fontSize: 'l94mrbxd',
              lineHeight: 'aenfhxwr',
              marginTop: 'kvgmc6g5',
              marginEnd: 'cxmmr5t8',
              marginBottom: 'oygrvhab',
              marginStart: 'hcukyx3x',
              paddingTop: 'jb3vyjys',
              paddingEnd: 'rz4wbd8a',
              paddingBottom: 'qt6c0cv9',
              paddingStart: 'a8nywdso',
              textAlign: 'i1ao9s8h',
              textDecoration: 'myohyog2',
              ':hover': {
                color: 'ksdfmwjs',
                textDecoration: 'gofk2cf1',
              },
              ':active': {
                transform: 'lsqurvkf',
                transition: 'bj9fd4vl',
              },
            },
            {
              display: 'a8c37x1j',
              width: 'k4urcfbm',
            },
            [
              {
                ':active': {
                  transform: 'tm8avpzi',
                },
              },
            ],
          ],
        ],
      ],
    ];

    const value = stylex(styles);
    const repeat = stylex(styles);

    // Check the cached-derived result is correct
    expect(value).toEqual(repeat);

    expect(value.split(' ').sort().join(' ')).toEqual(
      'g5ia77u1 tpe1esc0 gewhe1h2 gcovof34 bdao358l a8c37x1j s5oniofx kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso oajrlxb2 i1ao9s8h myohyog2 n3t5jt4f gh25dzvf g4tp4svg nhd2j8a9 f1sip0of icdlwmnq e4t7hp5w gmql0nx0 ihxqhq3m l94mrbxd aenfhxwr k4urcfbm gofk2cf1 ksdfmwjs tm8avpzi bj9fd4vl'
        .split(' ')
        .sort()
        .join(' ')
    );
  });
});
