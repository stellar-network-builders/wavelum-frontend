import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ErrorBoundary } from './ErrorBoundary';

const meta = { title: 'Errors/ErrorBoundary', component: ErrorBoundary } satisfies Meta<typeof ErrorBoundary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HealthyContent: Story = { args: { children: 'Content rendered successfully.' } };
export const CustomFallback: Story = {
  args: {
    children: 'Content rendered successfully.',
    fallback: ({ error, resetError }) => (
      <button type="button" onClick={resetError}>
        Recover from {error.message}
      </button>
    ),
  },
};
