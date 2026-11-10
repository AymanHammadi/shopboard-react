import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatMoney } from '../../../shared/money';

interface Props {
  quantity: number;
  subtotalCents: number;
}

export function CartSummary({ quantity, subtotalCents }: Props) {
  return (
    <aside className="cart-summary" aria-labelledby="summary-heading">
      <p className="eyebrow">All together now</p>
      <h2 id="summary-heading">Your summary</h2>
      <div className="summary-line">
        <span>Items</span>
        <span>{quantity}</span>
      </div>
      <div className="summary-total" role="status">
        <span>Subtotal</span>
        <strong>{formatMoney(subtotalCents)}</strong>
      </div>
      <p className="small muted">Prices in USD.</p>
      <Link href="/checkout" className="button button--primary">
        Checkout
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <Link href="/">Continue shopping</Link>
    </aside>
  );
}
