import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/features/category/category-page-content";

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const normalized = categoryId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${normalized || "Category"} | Rentmart`,
    description: "Browse verified active listings in this equipment category.",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  return <CategoryPageContent categoryId={categoryId} />;
}
