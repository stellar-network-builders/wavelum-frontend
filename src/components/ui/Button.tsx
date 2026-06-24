'use client';

import { SpinnerGap } from '@phosphor-icons/react';
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
  return <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />;
}
