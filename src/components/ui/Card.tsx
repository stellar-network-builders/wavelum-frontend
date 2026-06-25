import { type HTMLAttributes, type ReactNode } from 'react';

import { cardVariants, type CardVariantProps } from './styles';

type CardProps = HTMLAttributes<HTMLDivElement> &
  CardVariantProps & {
    /** Optional header content rendered at the top of the card. */
    header?: ReactNode;
    /** Optional footer content rendered at the bottom. */
    footer?: ReactNode;
  };

/**
 * Card component with default, interactive, and highlight variants.
 *
 * Variants:
 * - default:     Standard card with subtle border
 * - interactive: Hover lift effect for clickable cards
 * - highlight:   Accent left border for featured content
 */
export function Card({
  variant,
  header,
  footer,
  children,
  className,
  ...rest
}: CardProps) {
  return (
    <div className={cardVariants({ variant, className })} {...rest}>
      {header && (
        <div className="mb-4 border-b border-zinc-200 pb-3 dark:border-zinc-800">
          {header}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          {footer}
        </div>
      )}
    </div>
  );
}
