import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, onChange }: Props) {
  if (pages < 2) return null;
  return (
    <nav className="pagination" aria-label="Product pages">
      <Button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ArrowLeft size={16} aria-hidden="true" />
        Previous
      </Button>
      <span aria-current="page">
        {page} <span className="muted">/ {pages}</span>
      </span>
      <Button disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  );
}
