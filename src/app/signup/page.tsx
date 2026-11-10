import type { Metadata } from 'next';
import { AuthPage } from '../../modules/auth/pages/AuthPage';

export const metadata: Metadata = { title: 'Create account' };

export default function Page() {
  return <AuthPage mode="signup" />;
}
