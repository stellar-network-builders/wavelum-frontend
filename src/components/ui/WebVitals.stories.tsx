import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WebVitals } from './WebVitals';

const meta = { title: 'UI/WebVitals', component: WebVitals } satisfies Meta<typeof WebVitals>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
