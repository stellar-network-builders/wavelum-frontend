import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DashboardLayout } from './DashboardLayout';

const meta = { title: 'Layout/DashboardLayout', component: DashboardLayout } satisfies Meta<typeof DashboardLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Dashboard content' } };
