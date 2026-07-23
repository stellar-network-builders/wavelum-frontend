import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Breadcrumbs } from './Breadcrumbs';

const meta = { title: 'Layout/Breadcrumbs', component: Breadcrumbs } satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = { args: { crumbs: [{ label: 'Dashboard', href: '/dashboard' }] } };
export const Nested: Story = { args: { crumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vaults' }] } };
