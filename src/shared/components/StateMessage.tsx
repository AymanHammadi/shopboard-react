import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  role?: 'status' | 'alert';
}

export function StateMessage({ title, children, role = 'status' }: Props) {
  return (
    <div className="state-message" role={role}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
