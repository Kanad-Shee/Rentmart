import Link from "next/link";

type CategoryHeroProps = {
  title: string;
  description: string;
  itemCount: string;
};

export function CategoryHero({ title, description, itemCount }: CategoryHeroProps) {
  return (
    <section className="border-b border-border bg-[#f8f8f1]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-4xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>
              <span aria-hidden="true">›</span>
              <a href="#" className="transition-colors hover:text-primary">
                Categories
              </a>
              <span aria-hidden="true">›</span>
              <span className="font-medium text-primary">
                {title.split(" &")[0]}
              </span>
            </nav>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-primary sm:text-5xl lg:text-[3.15rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4f5964]">
              {description}
            </p>
          </div>

          <div className="pt-2 text-right text-sm text-[#5d6f8f] md:pt-20">
            {itemCount}
          </div>
        </div>
      </div>
    </section>
  );
}
