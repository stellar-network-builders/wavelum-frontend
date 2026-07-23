import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MobileNav } from './MobileNav';

const meta = { title: 'Layout/MobileNav', component: MobileNav } satisfies Meta<typeof MobileNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { args: { open: false, onOpenChange: () => undefined } };
export const Open: Story = { args: { open: true, onOpenChange: () => undefined } };
