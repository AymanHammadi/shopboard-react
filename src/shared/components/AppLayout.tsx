import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { RouteFocus } from './RouteFocus';
import { StorageNotice } from './StorageNotice';
import { StateMessage } from './StateMessage';
import { Button } from './Button';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <RouteFocus />
      <Header />
      <StorageNotice />
      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary
          key={pathname}
          fallbackRender={() => (
            <div className="container page-section">
              <StateMessage title="This page couldn’t load" role="alert">
                <p>
                  Reload the page to download it again, or use the navigation to
                  keep shopping.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Reload page
                </Button>
              </StateMessage>
            </div>
          )}
        >
          <Suspense
            fallback={
              <div className="container page-section" role="status">
                Loading page…
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
