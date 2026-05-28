import Image from 'next/image';

type ProductOwnerSummaryProps = {
  name: string;
  avatar?: string | null;
  meta: string;
  responseRate: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ProductOwnerSummary({
  name,
  avatar,
  meta,
  responseRate
}: ProductOwnerSummaryProps) {
  return (
    <div className="rounded-2xl border-l bg-linear-to-r from-primary/8 via-primary/5 to-transparent px-5 py-2 sm:flex sm:items-center sm:gap-5 w-fit">
      <div className="flex items-center gap-5">
        {avatar ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/15 shadow-md shadow-primary/10">
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="64px"
              loading={'lazy'}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/15 bg-[#c1ecd4] text-sm font-bold shadow-md shadow-primary/10 text-primary">
            {getInitials(name)}
          </div>
        )}
        <div>
          <p className="font-bold text-base tracking-[-0.01em] text-foreground">
            {name}
          </p>
          <p className="text-sm text-muted-foreground/70">{meta}</p>
        </div>
      </div>
    </div>
  );
}
