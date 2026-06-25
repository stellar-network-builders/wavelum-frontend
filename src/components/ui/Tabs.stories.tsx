import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Tabs } from './Tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    defaultValue: 'overview',
    tabs: [
      { value: 'overview', label: 'Overview', content: 'Overview content — summary of vesting schedules.' },
      { value: 'claims', label: 'Claims', content: 'Claims content — history of past claims.' },
      { value: 'settings', label: 'Settings', content: 'Settings content — configure preferences.' },
      { value: 'disabled', label: 'Disabled', content: 'This tab is disabled.', disabled: true },
    ],
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('tab', { name: 'Claims' }));
  await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Claims content');
};
