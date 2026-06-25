import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const colors = [
  { name: 'Background', className: 'bg-background', text: 'text-foreground' },
  { name: 'Foreground', className: 'bg-foreground', text: 'text-background' },
  { name: 'Zinc 50', className: 'bg-zinc-50', text: 'text-zinc-900' },
  { name: 'Zinc 200', className: 'bg-zinc-200', text: 'text-zinc-900' },
  { name: 'Zinc 500', className: 'bg-zinc-500', text: 'text-white' },
  { name: 'Zinc 900', className: 'bg-zinc-900', text: 'text-white' },
  { name: 'Emerald', className: 'bg-emerald-500', text: 'text-white' },
  { name: 'Amber', className: 'bg-amber-500', text: 'text-zinc-950' },
  { name: 'Red', className: 'bg-red-600', text: 'text-white' },
  { name: 'Blue', className: 'bg-blue-600', text: 'text-white' },
  { name: 'Indigo', className: 'bg-indigo-600', text: 'text-white' },
];

const typeScale = [
  { name: 'Text XS', className: 'text-xs', sample: 'Status labels and metadata' },
  { name: 'Text SM', className: 'text-sm', sample: 'Forms, tables, and controls' },
  { name: 'Text Base', className: 'text-base', sample: 'Default reading text' },
  { name: 'Text LG', className: 'text-lg', sample: 'Section headings' },
  { name: 'Text 3XL', className: 'text-3xl', sample: 'Page-level headings' },
];

const spacing = [
  { name: '2', className: 'w-2' },
  { name: '3', className: 'w-3' },
  { name: '4', className: 'w-4' },
  { name: '6', className: 'w-6' },
  { name: '8', className: 'w-8' },
  { name: '12', className: 'w-12' },
];

function DesignTokens() {
  return (
    <div className="max-w-5xl space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Color Palette
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((color) => (
            <div
              key={color.name}
              className={`rounded-lg border border-zinc-200 p-4 shadow-sm dark:border-zinc-800 ${color.className}`}
            >
              <p className={`text-sm font-medium ${color.text}`}>{color.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Typography Scale
        </h2>
        <div className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {typeScale.map((item) => (
            <div key={item.name} className="grid gap-3 p-4 sm:grid-cols-[8rem_1fr]">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {item.name}
              </p>
              <p className={`${item.className} text-zinc-900 dark:text-zinc-50`}>
                {item.sample}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Spacing Scale
        </h2>
        <div className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {spacing.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className="w-12 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {item.name}
              </span>
              <span className={`block h-4 rounded bg-indigo-600 ${item.className}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: 'UI/Design Tokens',
  component: DesignTokens,
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta<typeof DesignTokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {};
