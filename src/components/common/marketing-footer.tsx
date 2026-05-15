import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        {title}
      </h3>
      <ul className="mt-6 space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CircleIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
      {label}
    </span>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Link
            href="/"
            className="text-base font-black tracking-[0.24em] text-primary"
          >
            RENTMART
          </Link>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The leading marketplace for industrial equipment rental, built to
            help owners unlock revenue and help teams source dependable machines
            faster.
          </p>
          <div className="mt-6 flex items-center gap-4 text-muted-foreground">
            <CircleIcon label="web" />
            <CircleIcon label="grid" />
            <CircleIcon label="shield" />
          </div>
        </div>

        <FooterColumn
          title="Explore"
          links={[
            { href: "/#featured", label: "Browse Machinery" },
            { href: "/about", label: "About Us" },
            { href: "/dashboard/transactions", label: "Rental Insurance" },
          ]}
        />
        <FooterColumn
          title="Support"
          links={[
            { href: "/contact", label: "Support Center" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/terms", label: "Privacy Policy" },
            { href: "/terms", label: "Trust & Safety" },
          ]}
        />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Subscribe
          </h3>
          <p className="mt-4 text-sm text-muted-foreground">
            Get the latest marketplace updates.
          </p>
          <form className="mt-4 flex overflow-hidden rounded-md border border-border bg-background">
            <input
              type="email"
              placeholder="Email"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-primary px-3 text-primary-foreground transition-colors hover:bg-[#274e3d]"
            >
              <ArrowUpRight className="h-4 w-4 rotate-45" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-muted-foreground lg:px-8">
          © 2026 Rentmart Industrial Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
