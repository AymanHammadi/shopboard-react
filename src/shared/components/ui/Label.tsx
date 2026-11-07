import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentProps } from 'react';

export function Label({
  className = '',
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={`ui-label ${className}`}
      {...props}
    />
  );
}
