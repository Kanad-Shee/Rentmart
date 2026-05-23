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
        <div className="flex h-[380px] items-center justify-center rounded-md border border-border bg-muted/30 text-sm text-muted-foreground md:h-[520px]">
          Images will appear here soon.
        </div>
      </section>
    );
  }

  const [heroImage, ...thumbnailImages] = images;

  return (
    <section
      aria-label={`${title} gallery`}
      className="overflow-hidden rounded-md">
      <div className="grid gap-2 md:h-[520px] md:grid-cols-4 md:grid-rows-2">
        <div className="relative h-[380px] overflow-hidden rounded-md md:col-span-2 md:row-span-2 md:h-full">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            loading={'lazy'}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {thumbnailImages.slice(0, 4).map((image, index) => (
          <div
            key={image.src}
            className="relative h-[180px] overflow-hidden rounded-md md:h-full">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              loading={'lazy'}
              sizes="(max-width: 768px) 50vw, 22vw"
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
