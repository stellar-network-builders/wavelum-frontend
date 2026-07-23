import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CommandPalette } from './CommandPalette';

const meta = { title: 'Layout/CommandPalette', component: CommandPalette } satisfies Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { args: { open: false, onOpenChange: () => undefined } };
export const Open: Story = { args: { open: true, onOpenChange: () => undefined } };
