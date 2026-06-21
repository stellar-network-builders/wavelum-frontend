import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Table } from './Table';

type VestingRow = { id: number; name: string; amount: string; status: string; date: string };

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date', sortable: true },
];

const data: VestingRow[] = [
  { id: 1, name: 'Team A', amount: '1,000 XLM', status: 'Active', date: '2026-01-15' },
  { id: 2, name: 'Team B', amount: '500 XLM', status: 'Paused', date: '2026-02-20' },
  { id: 3, name: 'Team C', amount: '2,500 XLM', status: 'Completed', date: '2026-03-10' },
  { id: 4, name: 'Team D', amount: '750 XLM', status: 'Active', date: '2026-04-05' },
  { id: 5, name: 'Team E', amount: '3,000 XLM', status: 'Expired', date: '2025-12-01' },
];

const meta = {
  title: 'UI/Table',
  component: Table<VestingRow>,
  tags: ['autodocs'],
  args: { columns, data },
} satisfies Meta<typeof Table<VestingRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = {
  args: {
    data: [],
    emptyState: (
      <div>
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">No vesting schedules</p>
        <p className="mt-1 text-sm text-zinc-500">Create your first vesting schedule to get started.</p>
      </div>
    ),
  },
};
export const Paginated: Story = {
  args: {
    pageSize: 2,
    data: [
      ...data,
      { id: 6, name: 'Team F', amount: '1,200 XLM', status: 'Active', date: '2026-05-01' },
      { id: 7, name: 'Team G', amount: '800 XLM', status: 'Paused', date: '2026-06-15' },
    ],
  },
};
