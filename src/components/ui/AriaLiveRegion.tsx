'use client';

import { type ReactNode } from 'react';

type Props = {
  priority?: 'polite' | 'assertive';
  children?: ReactNode;
};

export function AriaLiveRegion({ priority = 'polite', children }: Props) {
  return (
    <div
      id="a11y-announcements"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}
