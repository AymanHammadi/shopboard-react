'use client';

import { ShoppingBag, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../modules/auth/auth.state';
import { cartTotals } from '../modules/cart/cart.logic';
import { useCart } from '../modules/cart/cart.state';
import { Button } from '../shared/components/Button';
import { StorageNotice } from '../shared/components/StorageNotice';

export function StorefrontNavigation() {
  const pathname = usePathname();
  const { value: cart } = useCart();
  const { value: profile, actions } = useAuth();
  const { quantity } = cartTotals(cart);

  return (
    <>
      <Link
        href="/"
        className="shop-nav"
        aria-current={pathname === '/' ? 'page' : undefined}
      >
        Shop
      </Link>
      {profile === null ? (
        <Link
          href="/login"
          className="account-link"
          aria-current={pathname === '/login' ? 'page' : undefined}
        >
          <UserRound size={19} aria-hidden="true" />
          <span>Log in</span>
        </Link>
      ) : (
        <Button variant="ghost" onClick={actions.signOut}>
          Log out<span className="sr-only"> {profile.name}</span>
        </Button>
      )}
      <Link
        href="/cart"
        aria-current={pathname === '/cart' ? 'page' : undefined}
        className="cart-link"
        aria-label={`Cart, ${String(quantity)} ${quantity === 1 ? 'item' : 'items'}`}
      >
        <ShoppingBag size={20} aria-hidden="true" />
        <span className="cart-label">Cart</span>
        <span className="cart-count" aria-hidden="true">
          {quantity}
        </span>
      </Link>
    </>
  );
}

export function StorefrontStorageNotice() {
  const cart = useCart();
  const auth = useAuth();
  return <StorageNotice cartIssue={cart.issue} authIssue={auth.issue} />;
}
