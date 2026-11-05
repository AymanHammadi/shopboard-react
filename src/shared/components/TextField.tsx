import type { ComponentProps } from 'react';

interface Props extends ComponentProps<'input'> {
  id: string;
  label: string;
  error?: string | undefined;
}

export function TextField({ id, label, error, ...props }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : `${id}-error`}
      />
      {error === undefined ? null : (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
