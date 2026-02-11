/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import { fn } from 'storybook/test';

import { Button } from './Button';
import { Meta, StoryObj } from '@storybook/react-vite';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'The variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;
// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    label: 'Danger Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    label: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Large Button',
  },
};
