import type { ComponentProps } from 'react';

export function Input({
  className = '',
  type,
  ...props
}: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={`ui-input ${className}`}
      {...props}
    />
  );
}
