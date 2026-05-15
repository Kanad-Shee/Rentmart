type DashboardRoutePlaceholderProps = {
  title: string;
  description?: string;
};

export function DashboardRoutePlaceholder({
  title,
  description,
}: DashboardRoutePlaceholderProps) {
  return (
    <section className='mx-auto flex min-h-[60vh] max-w-4xl flex-col justify-center px-6 py-12'>
      <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]'>
        Dashboard Route
      </p>
      <h1 className='mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground'>
        {title}
      </h1>
      {description ? (
        <p className='mt-4 text-sm leading-7 text-muted-foreground'>
          {description}
        </p>
      ) : null}
    </section>
  );
}
