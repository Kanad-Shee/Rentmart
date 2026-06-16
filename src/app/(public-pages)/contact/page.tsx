import { ContactPageContent } from '@/components/features/support/contact-page-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'A contact page for renters and owners for any issues they face.'
};

export default function ContactPage() {
  return <ContactPageContent />;
}

