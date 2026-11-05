import { useCart } from '../../modules/cart/cart.state';
import { useAuth } from '../../modules/auth/auth.state';

export function StorageNotice() {
  const cart = useCart();
  const auth = useAuth();
  if (cart.issue === null && auth.issue === null) return null;

  return (
    <div className="container storage-notice" role="alert">
      {cart.issue !== null ? (
        <p>
          <strong>Cart:</strong> {cart.issue}
        </p>
      ) : null}
      {auth.issue !== null ? (
        <p>
          <strong>Account:</strong> {auth.issue}
        </p>
      ) : null}
    </div>
  );
}
