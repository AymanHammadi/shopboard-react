import Link from 'next/link';
import { formatMoney } from '../../../shared/money';
import type { OrderReceipt } from '../checkout.types';

interface Props {
  receipt: OrderReceipt;
}

export function OrderConfirmation({ receipt }: Props) {
  return (
    <div className="state-message">
      <p className="eyebrow">All set</p>
      <h1 tabIndex={-1} ref={(node) => node?.focus()}>
        Order confirmed
      </h1>
      <p>
        Thanks, {receipt.fullName}. Your order has {receipt.quantity}{' '}
        {receipt.quantity === 1 ? 'item' : 'items'}, totaling{' '}
        {formatMoney(receipt.subtotalCents)}.
      </p>
      <p>No payment was taken.</p>
      <Link href="/" className="button button--primary">
        Continue shopping
      </Link>
    </div>
  );
}
