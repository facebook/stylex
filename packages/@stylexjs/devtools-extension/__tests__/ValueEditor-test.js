/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ValueEditor } from '../src/panel/components/ValueEditor';

jest.mock('@stylexjs/stylex', () => ({
  create: (styles) => styles,
  defineConsts: (values) => values,
  props: () => ({}),
}));

global.IS_REACT_ACT_ENVIRONMENT = true;

function renderEditor(props = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onCommit = jest.fn(() => Promise.resolve());
  act(() => {
    root.render(
      <ValueEditor
        onCommit={onCommit}
        suggestions={['red', 'blue']}
        value="red"
        {...props}
      />,
    );
  });
  return { container, onCommit, root };
}

afterEach(() => {
  document.body.innerHTML = '';
});

test('prefills the editor with the displayed value', () => {
  const { container } = renderEditor();
  act(() => container.querySelector('button').click());

  expect(container.querySelector('input').value).toBe('red');
});

test('pretty prints a long function without changing the editable value', () => {
  const value = `clamp(${Array(3)
    .fill('calc(var(--width) / var(--scale) * 100vw)')
    .join(', ')})`;
  const { container } = renderEditor({ value });
  const button = container.querySelector('button');

  expect(button.textContent).toContain('\n');
  act(() => button.click());
  expect(container.querySelector('input').value).toBe(value);
});

test('cancels an empty value on blur without committing', () => {
  const { container, onCommit } = renderEditor();
  act(() => container.querySelector('button').click());
  const input = container.querySelector('input');
  act(() => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });

  expect(onCommit).not.toHaveBeenCalled();
  expect(container.querySelector('input')).toBeNull();
  expect(container.textContent).toContain('red');
});

test('cancels on Escape', () => {
  const { container, onCommit } = renderEditor();
  act(() => container.querySelector('button').click());
  act(() => {
    container
      .querySelector('input')
      .dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      );
  });
  expect(onCommit).not.toHaveBeenCalled();
  expect(container.querySelector('input')).toBeNull();
});
