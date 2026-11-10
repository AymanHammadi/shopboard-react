'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RouteFocus() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
