import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './Button';
import { Modal } from './Modal';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    trigger: <Button variant="primary">Open Modal</Button>,
    title: 'Modal Title',
    description: 'This is a description of the modal content.',
    children: 'Modal body content goes here.',
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </>
    ),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutDescription: Story = {
  args: { description: undefined },
};
export const LongContent: Story = {
  args: {
    children: (
      <div className="space-y-2">
        <p>
          This modal demonstrates how longer content is handled. Vesting schedules can contain
          multiple line items, vesting dates, and claim amounts that need to be displayed clearly.
        </p>
        <p>
          The modal is centered on screen with a backdrop blur effect and traps focus inside the
          dialog while it is open.
        </p>
      </div>
    ),
  },
};
