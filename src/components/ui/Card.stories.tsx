import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  args: { children: 'Card content goes here.', header: 'Card Title', footer: 'Footer' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'interactive', 'highlight'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'default', children: 'Standard card with subtle border.' },
};
export const Interactive: Story = {
  args: { variant: 'interactive', children: 'Click me — I lift on hover.' },
};
export const Highlight: Story = {
  args: {
    variant: 'highlight',
    header: 'Featured',
    children: 'This card has an accent left border.',
  },
};
export const WithoutHeader: Story = {
  args: { variant: 'default', header: undefined, children: 'Card with no header.' },
};
