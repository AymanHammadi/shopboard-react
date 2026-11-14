import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

export function Header({ children }: Props) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="ShopBoard home">
          <span className="brand-mark" aria-hidden="true">
            <ArrowUpRight size={22} strokeWidth={3} />
          </span>
          ShopBoard<span className="brand-period">.</span>
        </Link>
        <nav aria-label="Main navigation">{children}</nav>
      </div>
    </header>
  );
}
