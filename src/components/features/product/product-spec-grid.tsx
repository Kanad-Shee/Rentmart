type ProductSpecGridProps = {
  specs: readonly {
    label: string;
    value: string;
  }[];
};

export function ProductSpecGrid({ specs }: ProductSpecGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 py-4 sm:gap-4 lg:grid-cols-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="rounded-md border border-border bg-muted/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            {spec.label}
          </p>
          <p className="text-sm font-bold text-primary sm:text-base">{spec.value}</p>
        </div>
      ))}
    </div>
  );
}
