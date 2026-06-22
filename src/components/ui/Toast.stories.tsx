import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ToastProvider, useToast } from './Toast';
import { Button } from './Button';
import { type ReactNode } from 'react';

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" onClick={() => toast({ title: 'Success!', description: 'Operation completed.', variant: 'success' })}>
        Success Toast
      </Button>
      <Button variant="danger" onClick={() => toast({ title: 'Error!', description: 'Something went wrong.', variant: 'error' })}>
        Error Toast
      </Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Warning', description: 'Check your input.', variant: 'warning' })}>
        Warning Toast
      </Button>
      <Button variant="ghost" onClick={() => toast({ title: 'Info', description: 'New update available.', variant: 'info' })}>
        Info Toast
      </Button>
    </div>
  );
}

const meta = {
  title: 'UI/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  decorators: [
    (Story: () => ReactNode) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  args: { children: null },
  render: () => <ToastDemo />,
};
