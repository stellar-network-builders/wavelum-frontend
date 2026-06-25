import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

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
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox', { name: 'Fruit' });

  await userEvent.click(trigger);
  await userEvent.click(within(document.body).getByRole('option', { name: 'Banana' }));
  await expect(trigger).toHaveTextContent('Banana');
};

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
Searchable.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('combobox', { name: 'Searchable' }));
  await userEvent.type(
    within(document.body).getByPlaceholderText('Search...'),
    'cher',
  );
  await expect(
    within(document.body).getByRole('option', { name: 'Cherry' }),
  ).toBeInTheDocument();
};
