import { AboutPage } from './client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'An in details explanation why people would choose rentmart.'
};

const About = () => {
  return <AboutPage />;
};
export default About;
