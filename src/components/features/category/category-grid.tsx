import { CategoryCard } from './category-card';
import type { CategoryProduct } from './category-data';

type CategoryGridProps = {
  products: CategoryProduct[];
  userRole?: string;
};

export function CategoryGrid({ products, userRole }: CategoryGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <CategoryCard
          key={product.id}
          userRole={userRole}
          product={product}
        />
      ))}
    </div>
  );
}
