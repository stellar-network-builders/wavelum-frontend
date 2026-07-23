import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LocaleSwitcher } from './LocaleSwitcher';

const meta = { title: 'UI/LocaleSwitcher', component: LocaleSwitcher } satisfies Meta<typeof LocaleSwitcher>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
