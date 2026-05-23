import Link from "next/link";

export function ProductFooter() {
  const links = [
    { href: "/terms", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Support" },
    { href: "/terms", label: "Operator Certification" },
  ];

  return (
    <footer className='border-t border-border bg-muted/30'>
      <div className='mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8'>
        <div>
          <Link href='/' className='text-lg font-bold text-primary'>
            Rentmart
          </Link>
          <p className='mt-2 max-w-sm text-xs font-semibold uppercase text-muted-foreground'>
            © 2026 Rentmart Machinery Marketplace. All rights reserved.
          </p>
        </div>

        <nav className='flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold uppercase text-muted-foreground'>
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className='transition-colors hover:text-primary'
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
