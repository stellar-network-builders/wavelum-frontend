import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button variants — primary, secondary, ghost, danger, cta
 * with sm / md / lg sizes and a loading state.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-all duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-100',
        secondary:
          'border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600',
        ghost:
          'text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:active:bg-zinc-700',
        danger:
          'bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-800',
        cta: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:from-violet-500 hover:to-indigo-500 active:from-violet-700 active:to-indigo-700',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/**
 * Card variants — default, interactive (hover lift), highlight (accent border).
 */
export const cardVariants = cva(
  [
    'rounded-xl border bg-white p-6 shadow-sm transition-all duration-200',
    'dark:border-zinc-800 dark:bg-zinc-900',
  ],
  {
    variants: {
      variant: {
        default: 'border-zinc-200 dark:border-zinc-800',
        interactive:
          'border-zinc-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800',
        highlight: 'border-l-4 border-l-indigo-500 border-zinc-200 dark:border-l-indigo-400 dark:border-zinc-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type CardVariantProps = VariantProps<typeof cardVariants>;

/**
 * Badge status variants with semantic color coding.
 */
export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
    'transition-colors duration-150',
  ],
  {
    variants: {
      variant: {
        active:
          'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-400/20',
        paused:
          'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-400/20',
        completed:
          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-400/20',
        expired:
          'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-400/20',
        default:
          'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-400/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;

/**
 * Input shared styles — base ring/focus treatment.
 */
export const inputBaseClasses = [
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900',
  'placeholder:text-zinc-400',
  'transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:border-transparent',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
  'dark:focus:ring-zinc-500',
].join(' ');

/**
 * Input with error state — red ring.
 */
export const inputErrorClasses = [
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900',
  'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:border-transparent',
  'dark:border-red-400 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-red-500',
].join(' ');
