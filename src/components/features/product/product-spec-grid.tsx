type ProductSpecGridProps = {
  specs: readonly {
    label: string;
    value: string;
  }[];
};

export function ProductSpecGrid({ specs }: ProductSpecGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4 sm:gap-5 lg:grid-cols-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-5 shadow-sm shadow-primary/5 transition-all duration-300 hover:border-primary/25 hover:bg-gradient-to-br hover:from-primary/8 hover:to-primary/2 hover:shadow-md hover:shadow-primary/10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
            {spec.label}
          </p>
          <p className="text-base font-bold tracking-[-0.01em] text-primary sm:text-base">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}
