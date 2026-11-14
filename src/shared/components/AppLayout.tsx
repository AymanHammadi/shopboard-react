import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { RouteFocus } from './RouteFocus';

interface Props {
  children: ReactNode;
  navigation: ReactNode;
  notices: ReactNode;
}

export function AppLayout({ children, navigation, notices }: Props) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <RouteFocus />
      <Header>{navigation}</Header>
      {notices}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
