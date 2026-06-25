import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Enter text...' },
  argTypes: {
    error: { control: 'text' },
    helperText: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Email', placeholder: 'you@example.com' } };
export const WithError: Story = {
  args: {
    label: 'Email',
    defaultValue: 'bad-email',
    error: 'Please enter a valid email address.',
  },
};
WithError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('Email');
  const error = canvas.getByRole('alert');

  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription(
    'Please enter a valid email address.',
  );
  await expect(error).toHaveTextContent('Please enter a valid email address.');
};

export const WithHelperText: Story = {
  args: { label: 'Password', helperText: 'Must be at least 8 characters.' },
};
export const WithCharCount: Story = {
  args: { label: 'Bio', maxChars: 160, placeholder: 'Tell us about yourself...' },
};
export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true, defaultValue: 'Cannot edit' },
};
export const WithAdornments: Story = {
  args: {
    label: 'Amount',
    leftAdornment: '$',
    rightAdornment: 'USD',
    placeholder: '0.00',
  },
};
