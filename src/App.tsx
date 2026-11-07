import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './shared/components/Header';
import { Footer } from './shared/components/Footer';
import { RouteFocus } from './shared/components/RouteFocus';
import { StorageNotice } from './shared/components/StorageNotice';
import { NotFoundPage } from './shared/components/NotFoundPage';
import { CatalogPage } from './modules/products/pages/CatalogPage';
import { ProductPage } from './modules/products/pages/ProductPage';
import { CartPage } from './modules/cart/pages/CartPage';
import { AuthPage } from './modules/auth/pages/AuthPage';
import { CartProvider } from './modules/cart/components/CartProvider';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <RouteFocus />
          <Header />
          <StorageNotice />
          <main id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products/:productId" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}
