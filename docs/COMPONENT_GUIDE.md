# Component Guide

This document explains how to build and use UI components in Lumina Frontend: the component categories, the variant system, and theming.

## Component categories

| Category | Location | Description |
|----------|----------|-------------|
| Primitives | `components/ui/` | Low-level building blocks (button, input, card, dialog). Presentational, no business logic. |
| Feature components | `components/<feature>/` | Compose primitives into feature UI (for example a vesting schedule card). |
| Layout | `app/` | Route-level layouts and pages. |

Keep primitives free of data fetching. Feature components own data and behavior; primitives own appearance.

## Server vs client components

Components are Server Components by default. Add the `"use client"` directive only when a component needs:

- React state or effects (`useState`, `useEffect`)
- Browser-only APIs
- Event handlers (`onClick`, `onChange`)
- Wallet or React Query hooks

Keep client boundaries as low in the tree as possible so most of the UI stays server-rendered.

## The variant system

Primitives expose visual options through variants rather than ad hoc class names. The recommended approach is [class-variance-authority](https://cva.style/) (`cva`) with `tailwind-merge` to resolve conflicting Tailwind classes.

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-[#383838]",
        secondary: "border border-black/[.08] hover:bg-black/[.04]",
        ghost: "bg-transparent hover:bg-black/[.04]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

/**
 * Primary button primitive.
 *
 * @param variant - Visual style: "primary" | "secondary" | "ghost".
 * @param size - "sm" | "md".
 */
export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

Usage:

```tsx
<Button>Connect wallet</Button>
<Button variant="secondary" size="sm">Cancel</Button>
```

### The `cn` helper

`cn` merges class names and resolves Tailwind conflicts so a caller-supplied class always wins:

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names and resolve conflicting Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

## Theming

Theme tokens are defined as CSS variables in [`app/globals.css`](../app/globals.css) and exposed to Tailwind through the `@theme inline` block. Light and dark values are switched with `prefers-color-scheme`.

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

Reference tokens through Tailwind utilities (`bg-background`, `text-foreground`) rather than hard-coded hex values so dark mode and future theme changes apply everywhere at once.

## Conventions summary

- Primitives are presentational; feature components own data.
- Use variants for visual options, not bespoke class strings.
- Always pass user classes through `cn` so they can override defaults.
- Use theme tokens, not raw colors.
- Keep `"use client"` boundaries as low as possible.
