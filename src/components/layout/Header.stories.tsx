import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Header } from './Header';

const meta = { title: 'Layout/Header', component: Header } satisfies Meta<typeof Header>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { onOpenMobileNav: () => undefined, onOpenCommandPalette: () => undefined } };
