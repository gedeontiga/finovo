import { Metadata } from 'next';
import SignUpViewPage from '@/views/auth/sign-up-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default async function Page() {

  return <SignUpViewPage />;
}
