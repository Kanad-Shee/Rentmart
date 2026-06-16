import VerifyOtpPage from './client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OTP Verification',
  description: 'OTP verification page to authorize user to protected routes'
};

const page = () => {
  return (
    <>
      <VerifyOtpPage />
    </>
  );
};
export default page;

