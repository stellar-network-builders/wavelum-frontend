import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AriaLiveRegion } from './AriaLiveRegion';

const meta = { title: 'UI/AriaLiveRegion', component: AriaLiveRegion } satisfies Meta<typeof AriaLiveRegion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Polite: Story = { args: { children: 'Changes saved.' } };
export const Assertive: Story = { args: { priority: 'assertive', children: 'Connection lost.' } };
