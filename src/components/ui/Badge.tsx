import { type HTMLAttributes } from 'react';
import { badgeVariants, type BadgeVariantProps } from './styles';

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  BadgeVariantProps & {
    /** Optional dot indicator before the label. */
    dot?: boolean;
  };

/**
 * Status badge with semantic color coding.
 *
 * Variants: active | paused | completed | expired | default
 */
export function Badge({
  variant,
  dot = false,
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, className })} {...rest}>
      {dot && <Dot variant={variant} />}
      {children}
    </span>
  );
}

function Dot({ variant }: { variant?: BadgeVariantProps['variant'] }) {
  const colorMap: Record<string, string> = {
    active: 'bg-emerald-500 dark:bg-emerald-400',
    paused: 'bg-amber-500 dark:bg-amber-400',
    completed: 'bg-blue-500 dark:bg-blue-400',
    expired: 'bg-zinc-400 dark:bg-zinc-500',
    default: 'bg-zinc-400 dark:bg-zinc-500',
  };

  return (
    <span
      aria-hidden="true"
      className={`inline-block h-1.5 w-1.5 rounded-full ${colorMap[variant ?? 'default']}`}
    />
  );
}
