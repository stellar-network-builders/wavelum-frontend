import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { children: 'Badge' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['active', 'paused', 'completed', 'expired', 'default'],
    },
    dot: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { variant: 'active', children: 'Active', dot: true } };
export const Paused: Story = { args: { variant: 'paused', children: 'Paused', dot: true } };
export const Completed: Story = { args: { variant: 'completed', children: 'Completed', dot: true } };
export const Expired: Story = { args: { variant: 'expired', children: 'Expired', dot: true } };
export const Default: Story = { args: { variant: 'default', children: 'Default' } };
export const WithoutDot: Story = { args: { variant: 'active', children: 'Active', dot: false } };
