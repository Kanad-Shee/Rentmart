import Image from 'next/image';
import Link from 'next/link';

type CategoryHeroProps = {
  title: string;
  description: string;
  itemCount: string;
};

export function CategoryHero({
  title,
  description,
  itemCount
}: CategoryHeroProps) {
  return (
    <section className="relative border-b border-border bg-[#f8f8f1]">
      <div className="absolute inset-0 mask-x-from-70%">
        <Image
          src={'/assets/landing/landing-harvesting.webp'}
          alt="landing-harvesting"
          width={500}
          height={300}
          className="w-full h-full aspect-video object-cover opacity-20"
          unoptimized
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link
                prefetch
                href="/"
                className="transition-colors hover:text-primary">
                Home
              </Link>
              <span aria-hidden="true">›</span>
              <a
                href="/#categories"
                className="transition-colors hover:text-primary">
                Categories
              </a>
              <span aria-hidden="true">›</span>
              <span className="font-medium text-primary">
                {title.split(' &')[0]}
              </span>
            </nav>

            <h1 className="mt-6 text-3xl font-bold tracking-tighter text-primary sm:text-4xl lg:text-5xl xl:text-[3.15rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-shadow-2xs text-[#2e353b] sm:text-base font-display">
              {description}
            </p>
          </div>

          <div className="pt-2 text-left font-display font-semibold text-sm text-[#5d6f8f] lg:pt-20 lg:text-right">
            {itemCount}
          </div>
        </div>
      </div>
    </section>
  );
}
