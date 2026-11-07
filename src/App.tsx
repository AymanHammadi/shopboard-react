import { lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './shared/components/AppLayout';
import { CartProvider } from './modules/cart/components/CartProvider';
import { AuthProvider } from './modules/auth/components/AuthProvider';

const CatalogPage = lazy(() =>
  import('./modules/products/pages/CatalogPage').then((module) => ({
    default: module.CatalogPage,
  })),
);
const ProductPage = lazy(() =>
  import('./modules/products/pages/ProductPage').then((module) => ({
    default: module.ProductPage,
  })),
);
const CartPage = lazy(() =>
  import('./modules/cart/pages/CartPage').then((module) => ({
    default: module.CartPage,
  })),
);
const CheckoutPage = lazy(() =>
  import('./modules/checkout/pages/CheckoutPage').then((module) => ({
    default: module.CheckoutPage,
  })),
);
const AuthPage = lazy(() =>
  import('./modules/auth/pages/AuthPage').then((module) => ({
    default: module.AuthPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('./shared/components/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<CatalogPage />} />
                <Route path="/products/:productId" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
