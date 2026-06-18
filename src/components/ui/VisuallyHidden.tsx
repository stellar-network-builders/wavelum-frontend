import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  as?: 'span' | 'div';
};

export function VisuallyHidden({ children, as: Tag = 'span' }: Props) {
  return (
    <Tag className="sr-only">
      {children}
    </Tag>
  );
}
