/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Example/Card',
  component: Card,
  argTypes: {
    elevated: { control: 'boolean' },
    title: { control: 'text' },
    content: { control: 'text' },
  },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    content: 'This is some example content for the card component.',
  },
};

export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    content: 'This card has an elevated shadow effect.',
    elevated: true,
  },
};
