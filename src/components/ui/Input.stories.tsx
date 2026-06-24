import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
  args: { label: 'Email', value: 'bad-email', error: 'Please enter a valid email address.' },
};
export const WithHelperText: Story = {
  args: { label: 'Password', helperText: 'Must be at least 8 characters.' },
};
export const WithCharCount: Story = {
  args: { label: 'Bio', maxChars: 160, placeholder: 'Tell us about yourself...' },
};
export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true, value: 'Cannot edit' },
};
export const WithAdornments: Story = {
  args: {
    label: 'Amount',
    leftAdornment: '$',
    rightAdornment: 'USD',
    placeholder: '0.00',
  },
};
