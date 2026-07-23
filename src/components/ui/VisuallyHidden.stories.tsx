import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { VisuallyHidden } from './VisuallyHidden';

const meta = { title: 'UI/VisuallyHidden', component: VisuallyHidden } satisfies Meta<typeof VisuallyHidden>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Screen reader content' } };
