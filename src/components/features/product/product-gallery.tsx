import Image from 'next/image';

type ProductGalleryImage = {
  src: string;
  alt: string;
};

type ProductGalleryProps = {
  images: readonly ProductGalleryImage[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  if (images.length === 0) {
    return (
      <section
        aria-label={`${title} gallery`}
        className="overflow-hidden rounded-md">
        <div className="flex h-70 items-center justify-center rounded-md border border-border bg-muted/30 text-sm text-muted-foreground sm:h-85 lg:h-130">
          Images will appear here soon.
        </div>
      </section>
    );
  }

  const [heroImage, ...thumbnailImages] = images;

  return (
    <section
      aria-label={`${title} gallery`}
      className="overflow-hidden rounded-2xl">
      <div className="grid gap-2 sm:grid-cols-2 lg:h-[520px] lg:grid-cols-4 lg:grid-rows-2">
        <div className="relative h-[280px] overflow-hidden rounded-2xl sm:h-[340px] sm:col-span-2 lg:row-span-2 lg:h-full border border-primary/10">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {thumbnailImages.slice(0, 4).map((image, index) => (
          <div
            key={image.src}
            className="relative h-[160px] overflow-hidden rounded-2xl sm:h-[200px] lg:h-full border border-primary/10">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              loading={'lazy'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 22vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            {index === 3 ? (
              <div className="absolute inset-x-0 bottom-0 bg-primary/80 px-3 py-2 text-xs font-semibold text-primary-foreground">
                View all photos
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
