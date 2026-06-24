import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Select } from './Select';

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    placeholder: 'Choose an option',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'disabled', label: 'Disabled Option', disabled: true },
    ],
  },
  argTypes: {
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    searchable: { control: 'boolean' },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Fruit' } };
export const WithError: Story = {
  args: { label: 'Fruit', error: 'Please select a fruit.' },
};
export const Disabled: Story = { args: { label: 'Fruit', disabled: true } };
export const Grouped: Story = {
  args: {
    label: 'Food',
    options: [
      { label: 'Fruits', options: [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }] },
      { label: 'Vegetables', options: [{ value: 'carrot', label: 'Carrot' }, { value: 'spinach', label: 'Spinach' }] },
    ],
  },
};
export const Searchable: Story = {
  args: { label: 'Searchable', searchable: true },
};
