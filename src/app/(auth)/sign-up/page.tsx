import SignUpPage from './client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registration',
  description: 'Sign Up page to authorize user to application according to role'
};

const page = () => {
  return (
    <>
      <SignUpPage />
    </>
  );
};
export default page;

