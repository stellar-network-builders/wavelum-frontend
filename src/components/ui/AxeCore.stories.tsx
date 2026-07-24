import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AxeCore } from './AxeCore';

const meta = { title: 'UI/AxeCore', component: AxeCore } satisfies Meta<typeof AxeCore>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
