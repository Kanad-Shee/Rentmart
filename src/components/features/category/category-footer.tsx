export function CategoryFooter() {
  return (
    <footer className='border-t border-border bg-[#f3f4f1]'>
      <div className='mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_repeat(2,minmax(0,0.8fr))] lg:px-8'>
        <div className='max-w-sm'>
          <h2 className='text-2xl font-black tracking-[-0.04em] text-primary'>
            Rentmart
          </h2>
          <p className='mt-4 text-xs font-medium uppercase tracking-[0.26em] text-[#5d6f8f]'>
            The world&apos;s leading marketplace for heavy machinery rental and
            procurement.
          </p>
        </div>

        <FooterColumn
          title='Marketplace'
          links={["Browse Categories", "Partner Program", "Rental Terms"]}
        />
        <FooterColumn
          title='Support'
          links={["Technical Support", "Insurance & Protection", "Help Center"]}
        />
      </div>

      <div className='border-t border-border bg-[#f7f8f4]'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 text-xs uppercase tracking-[0.24em] text-[#7d889b] sm:px-6 lg:px-8'>
          <p>
            © 2026 Rentmart Global Machinery Marketplace. Professional
            procurement simplified.
          </p>
          <div className='hidden items-center gap-4 md:flex'>
            <span>◎</span>
            <span>↗</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>
        {title}
      </h3>
      <ul className='mt-6 space-y-4'>
        {links.map((link) => (
          <li key={link}>
            <a
              href='#'
              className='text-xs font-medium uppercase tracking-[0.2em] text-[#7d889b] transition-colors hover:text-primary'
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
