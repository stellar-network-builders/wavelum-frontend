'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { buttonVariants, type ButtonVariantProps } from './styles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps & {
    /** Show a loading spinner and disable the button. */
    loading?: boolean;
    /** Icon or element to display before the label. */
    leftIcon?: ReactNode;
    /** Icon or element to display after the label. */
    rightIcon?: ReactNode;
  };

/**
 * Reusable Button component with variant, size, and loading support.
 *
 * Variants: primary | secondary | ghost | danger | cta
 * Sizes:    sm | md | lg
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonVariants({ variant, size, className })}
      {...rest}
    >
      {loading ? (
        <Spinner />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="presentation"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
