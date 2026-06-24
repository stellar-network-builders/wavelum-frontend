'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';

import { inputBaseClasses, inputErrorClasses } from './styles';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Label text displayed above the input. */
  label?: string;
  /** Error message — when set, the input shows a red ring. */
  error?: string;
  /** Helper text displayed below the input. */
  helperText?: string;
  /** Maximum character count — shows a counter below the input. */
  maxChars?: number;
  /** Optional leading adornment (icon, text). */
  leftAdornment?: ReactNode;
  /** Optional trailing adornment (icon, text). */
  rightAdornment?: ReactNode;
};

/**
 * Text input with label, error state, helper text, and character count.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    maxChars,
    leftAdornment,
    rightAdornment,
    className,
    id: externalId,
    value,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftAdornment && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
            {leftAdornment}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          value={value}
          className={`${error ? inputErrorClasses : inputBaseClasses} ${leftAdornment ? 'pl-10' : ''} ${rightAdornment ? 'pr-10' : ''} ${className ?? ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            [error ? `${id}-error` : '', helperText ? `${id}-helper` : '', maxChars ? `${id}-counter` : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...rest}
        />
        {rightAdornment && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 dark:text-zinc-500">
            {rightAdornment}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          {error && (
            <p id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={`${id}-helper`} className="text-xs text-zinc-500 dark:text-zinc-400">
              {helperText}
            </p>
          )}
        </div>
        {maxChars !== undefined && (
          <p
            id={`${id}-counter`}
            className={`text-xs ${charCount > maxChars ? 'text-red-600 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500'}`}
          >
            {charCount}/{maxChars}
          </p>
        )}
      </div>
    </div>
  );
});
