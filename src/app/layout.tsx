import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { AppLayout } from '../shared/components/AppLayout';
import '../styles.css';

export const metadata: Metadata = {
  title: {
    default: 'ShopBoard — Everyday, upgraded.',
    template: '%s | ShopBoard',
  },
  description:
    'Find your next everyday favorite at ShopBoard. Browse beauty, home, tech, and more.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#e8ebe6' };

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/inter-latin-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
