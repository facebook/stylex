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
  styleSheet.inject('hey {}', 0);
  expect(styleSheet.getRuleCount()).toBeGreaterThan(prevCount);
});

describe('stylex', () => {
  test('basic resolve', () => {
    expect(stylex({ a: 'aaa', b: 'bbb', $$css: true })).toBe('aaa bbb');
  });

  test('merge order', () => {
    expect(
      stylex([
        { a: 'a', ':hover__aa': 'aa', $$css: true },
        { b: 'b', $$css: true },
        { c: 'c', ':hover__cc': 'cc', $$css: true },
      ]),
    ).toBe('a aa b c cc');
  });

  test('with a top-level array of simple overridden classes', () => {
    expect(
      stylex([
        {
          backgroundColor: 'nu7423ey',
          $$css: true,
        },
        {
          backgroundColor: 'gh25dzvf',
          $$css: true,
        },
      ]),
    ).toEqual('gh25dzvf');
  });

  test('with nested arrays and pseudoClasses overriding things', () => {
    expect(
      stylex([
        {
          backgroundColor: 'nu7423ey',
          $$css: true,
        },
        [
          {
            backgroundColor: 'abcdefg',
            ':hover__backgroundColor': 'ksdfmwjs',
            $$css: true,
          },
        ],
        {
          color: 'gofk2cf1',
          ':hover__backgroundColor': 'rse6dlih',
          $$css: true,
        },
      ]),
    ).toEqual('abcdefg gofk2cf1 rse6dlih');
  });

  test('with just pseudoclasses', () => {
    expect(
      stylex(
        {
          ':hover__backgroundColor': 'rse6dlih',
          $$css: true,
        },
        {
          ':hover__color': 'gofk2cf1',
          $$css: true,
        },
      ),
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
        $$css: true,
      },
      false,
      false,
      false,
      false,
      [
        {
          cursor: 'fsf7x5fv',
          touchAction: 's3jn8y49',
          $$css: true,
        },
        false,
        {
          outline: 'icdlwmnq',
          $$css: true,
        },
        [
          {
            WebkitTapHighlightColor: 'oajrlxb2',
            cursor: 'nhd2j8a9',
            touchAction: 'f1sip0of',
            $$css: true,
          },
          false,
          false,
          {
            textDecoration: 'esuyzwwr',
            ':hover__textDecoration': 'p8dawk7l',
            $$css: true,
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
              ':hover__color': 'ksdfmwjs',
              ':hover__textDecoration': 'gofk2cf1',
              ':active__transform': 'lsqurvkf',
              ':active__transition': 'bj9fd4vl',
              $$css: true,
            },
            {
              display: 'a8c37x1j',
              width: 'k4urcfbm',
              $$css: true,
            },
            [
              {
                ':active__transform': 'tm8avpzi',
                $$css: true,
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
        .join(' '),
    );
  });
});
