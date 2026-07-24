import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NavLinks } from './NavLinks';

const meta = { title: 'Layout/NavLinks', component: NavLinks } satisfies Meta<typeof NavLinks>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = { args: { collapsed: false, onNavigate: () => undefined } };
export const Collapsed: Story = { args: { collapsed: true, onNavigate: () => undefined } };
