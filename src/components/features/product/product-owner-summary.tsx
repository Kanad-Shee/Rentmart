import Image from 'next/image';
import Link from 'next/link';

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
    <div className="flex flex-col gap-4 border-y border-border py-6 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {avatar ? (
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-muted">
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="56px"
              loading={'lazy'}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-muted bg-[#c1ecd4] text-sm font-bold text-primary">
            {getInitials(name)}
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">
            {meta} <span className="text-primary">• {responseRate}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
