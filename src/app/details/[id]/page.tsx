import { PublicProductDetailsContent } from "@/components/features/product/public-product-details-content";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  return <PublicProductDetailsContent id={id} />;
}
