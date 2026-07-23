import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WalletStatus } from './WalletStatus';

const meta = { title: 'Layout/WalletStatus', component: WalletStatus } satisfies Meta<typeof WalletStatus>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
