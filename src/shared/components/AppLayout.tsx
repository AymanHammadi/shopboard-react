import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { RouteFocus } from './RouteFocus';
import { StorageNotice } from './StorageNotice';

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <RouteFocus />
      <Header />
      <StorageNotice />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
