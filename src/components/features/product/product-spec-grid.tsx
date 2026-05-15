type ProductSpecGridProps = {
  specs: readonly {
    label: string;
    value: string;
  }[];
};

export function ProductSpecGrid({ specs }: ProductSpecGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4 md:grid-cols-4">
      {specs.map((spec) => (
        <div key={spec.label} className="rounded-md border border-border bg-muted/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            {spec.label}
          </p>
          <p className="text-base font-bold text-primary">{spec.value}</p>
        </div>
      ))}
    </div>
  );
}
