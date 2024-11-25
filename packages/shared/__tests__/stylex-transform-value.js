/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
* @flow strict
*/
import transformValue from '../src/transform-value';

describe('transformValue content property tests', () => {
 test('preserves CSS functions without quotes', () => {
   const functions = [
     ['counters(div, ".")', 'counters(div, ".")'],
     ['counter(chapter)', 'counter(chapter)'], 
     ['counter(chapter, upper-roman)', 'counter(chapter, upper-roman)'],
     ['attr(href)', 'attr(href)'],
     ['url(image.jpg)', 'url(image.jpg)'],
     ['linear-gradient(#e66465, #9198e5)', 'linear-gradient(#e66465, #9198e5)'],
     ['image-set("image1x.png" 1x, "image2x.png" 2x)', 'image-set("image1x.png" 1x, "image2x.png" 2x)']
   ];

   functions.forEach(([input, expected]) => {
     expect(transformValue('content', input, {})).toBe(expected);
   });
 });

 test('preserves CSS keywords without quotes', () => {
   const keywords = [
     'normal',
     'none', 
     'open-quote',
     'close-quote',
     'no-open-quote',
     'no-close-quote',
     'inherit',
     'initial',
     'revert',
     'revert-layer',
     'unset'
   ];

   keywords.forEach(keyword => {
     expect(transformValue('content', keyword, {})).toBe(keyword);
   });
 });

 test('handles mixed content values', () => {
   const mixedValues = [
     ['open-quote counter(chapter)', 'open-quote counter(chapter)'],
     ['"prefix" url(image.jpg)', '"prefix" url(image.jpg)'],
     ['url("test.png") / "Alt text"', 'url("test.png") / "Alt text"'],
     ['open-quote counter(chapter) close-quote', 'open-quote counter(chapter) close-quote']
   ];

   mixedValues.forEach(([input, expected]) => {
     expect(transformValue('content', input, {})).toBe(expected);
   });
 });

 test('adds quotes to plain strings', () => {
   const strings = [
     ['Hello world', '"Hello world"'],
     ['Simple text', '"Simple text"'],
     ['123', '"123"']
   ];

   strings.forEach(([input, expected]) => {
     expect(transformValue('content', input, {})).toBe(expected);
   });
 });

 test('preserves existing quotes', () => {
   const quotedStrings = [
     ['"already quoted"', '"already quoted"'],
     ["'single quotes'", "'single quotes'"],
     ['"mixed "nested" quotes"', '"mixed "nested" quotes"']
   ];

   quotedStrings.forEach(([input, expected]) => {
     expect(transformValue('content', input, {})).toBe(expected);
   });
 });
});