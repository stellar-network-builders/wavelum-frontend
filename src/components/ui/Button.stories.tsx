import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { onClick: fn(), children: 'Button' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'cta'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary', children: 'Primary' } };
Primary.play = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: 'Primary' }));
  await expect(args.onClick).toHaveBeenCalled();
};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };
export const CTA: Story = { args: { variant: 'cta', children: 'Get Started' } };
export const Small: Story = { args: { size: 'sm', children: 'Small' } };
export const Large: Story = { args: { size: 'lg', children: 'Large' } };
export const Loading: Story = { args: { loading: true, children: 'Loading' } };
Loading.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button', { name: 'Loading' });

  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('aria-busy', 'true');
};

export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } };
export const WithIcons: Story = {
  args: {
    children: 'Send',
    leftIcon: '→',
    rightIcon: '₿',
  },
};
