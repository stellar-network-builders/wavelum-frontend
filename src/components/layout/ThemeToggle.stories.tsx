import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ThemeToggle } from './ThemeToggle';

const meta = {
  title: 'Layout/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CyclesTheme: Story = {};
CyclesTheme.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  // Every click advances Light → Dark → System, so the label always changes.
  const before = button.getAttribute('aria-label');
  await userEvent.click(button);
  const after = button.getAttribute('aria-label');

  await expect(after).not.toEqual(before);
  await expect(after).toMatch(/^Theme:/);
};
