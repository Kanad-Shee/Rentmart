import { PublicProductDetailsContent } from '@/components/features/product/public-product-details-content';
import { Metadata } from 'next';

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Equipment Details',
  description:
    'Details page about the product where user can rent product check through filters and also can view map.'
};

export default async function ProductDetailsPage({
  params
}: ProductDetailsPageProps) {
  const { id } = await params;

  return <PublicProductDetailsContent id={id} />;
}

