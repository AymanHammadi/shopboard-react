import { useFormContext } from 'react-hook-form';
import type { ComponentProps } from 'react';
import { Input } from '../../../shared/components/ui/Input';
import { Label } from '../../../shared/components/ui/Label';
import type { CheckoutValues } from '../checkout.types';

interface Props {
  name: keyof CheckoutValues;
  label: string;
  autoComplete: string;
  type?: ComponentProps<'input'>['type'];
}

export function CheckoutField({
  name,
  label,
  autoComplete,
  type = 'text',
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutValues>();
  const error = errors[name];
  const id = `checkout-${name}`;

  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      <Input
        {...register(name)}
        id={id}
        type={type}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : `${id}-error`}
      />
      {error === undefined ? null : (
        <p className="field-error" id={`${id}-error`}>
          {error.message}
        </p>
      )}
    </div>
  );
}
