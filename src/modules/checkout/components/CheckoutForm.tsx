import { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../shared/components/Button';
import { useAuth } from '../../auth/auth.state';
import { checkoutSchema } from '../checkout.types';
import type { CheckoutValues } from '../checkout.types';
import { CheckoutField } from './CheckoutField';

interface Props {
  onComplete: (values: CheckoutValues) => void | Promise<void>;
}

export function CheckoutForm({ onComplete }: Props) {
  const submitting = useRef(false);
  const { value: profile } = useAuth();
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: profile?.name ?? '',
      email: profile?.email ?? '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
  });
  const { isSubmitting, isSubmitSuccessful, errors } = form.formState;
  const completed = isSubmitSuccessful && errors.root === undefined;

  async function submit(values: CheckoutValues) {
    try {
      await onComplete(values);
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Your order could not be confirmed. Please try again.',
      });
    }
  }

  return (
    <FormProvider {...form}>
      <form
        className="checkout-form"
        noValidate
        onSubmit={(event) => {
          if (submitting.current || completed) {
            event.preventDefault();
            return;
          }
          submitting.current = true;
          form.clearErrors('root');
          void form
            .handleSubmit(submit)(event)
            .finally(() => {
              submitting.current = false;
            });
        }}
      >
        <fieldset disabled={isSubmitting || completed}>
          <legend>Contact details</legend>
          <CheckoutField
            name="fullName"
            label="Full name"
            autoComplete="name"
          />
          <CheckoutField
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
          />
        </fieldset>
        <fieldset disabled={isSubmitting || completed}>
          <legend>Shipping address</legend>
          <CheckoutField
            name="address"
            label="Street address"
            autoComplete="shipping street-address"
          />
          <div className="checkout-field-pair">
            <CheckoutField
              name="city"
              label="City"
              autoComplete="shipping address-level2"
            />
            <CheckoutField
              name="postalCode"
              label="Postal code"
              autoComplete="shipping postal-code"
            />
          </div>
          <CheckoutField
            name="country"
            label="Country"
            autoComplete="shipping country-name"
          />
        </fieldset>
        <p className="small muted">
          No payment will be collected. All fields are required.
        </p>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || completed}
        >
          {isSubmitting ? 'Confirming order…' : 'Confirm order'}
        </Button>
        {errors.root?.message === undefined ? null : (
          <p role="alert" className="field-error">
            {errors.root.message}
          </p>
        )}
      </form>
    </FormProvider>
  );
}
