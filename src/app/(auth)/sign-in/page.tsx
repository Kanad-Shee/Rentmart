import SignInPage from './client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in page for authentication of the incoming user and their role'
};

const page = () => {
  return (
    <>
      <SignInPage />
    </>
  );
};
export default page;

