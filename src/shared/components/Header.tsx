import { ArrowUpRight, ShoppingBag, UserRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cartTotals } from '../../modules/cart/cart.logic';
import { useCart } from '../../modules/cart/cart.state';
import { useAuth } from '../../modules/auth/auth.state';
import { Button } from './Button';

export function Header() {
  const { value: cart } = useCart();
  const { value: profile, actions } = useAuth();
  const { quantity } = cartTotals(cart);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="ShopBoard home">
          <span className="brand-mark" aria-hidden="true">
            <ArrowUpRight size={22} strokeWidth={3} />
          </span>
          ShopBoard<span className="brand-period">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end className="shop-nav">
            Shop
          </NavLink>
          {profile === null ? (
            <NavLink to="/login" className="account-link">
              <UserRound size={19} aria-hidden="true" />
              <span>Log in</span>
            </NavLink>
          ) : (
            <Button variant="ghost" onClick={actions.signOut}>
              Log out<span className="sr-only"> {profile.name}</span>
            </Button>
          )}
          <NavLink
            to="/cart"
            className="cart-link"
            aria-label={`Cart, ${String(quantity)} ${quantity === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag size={20} aria-hidden="true" />
            <span className="cart-label">Cart</span>
            <span className="cart-count" aria-hidden="true">
              {quantity}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
