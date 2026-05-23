import { MarketingFooter } from '@/components/common/marketing-footer';
import { Navbar } from '@/components/common/navbar';
import { HomepageMarketplaceSections } from '@/components/features/landing/homepage-marketplace-sections';
import { HomepageRoleCtaActions } from '@/components/features/landing/homepage-role-cta-actions';
import {
  Clock3,
  Hammer,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench
} from 'lucide-react';

const trustItems = [
  { icon: ShieldCheck, label: 'Comprehensive Rental Insurance' },
  { icon: Sparkles, label: 'Secure Escrow Payments' },
  { icon: Clock3, label: '24/7 Field Support' },
  { icon: Wrench, label: 'Certified Maintenance' }
];

const steps = [
  {
    icon: Search,
    title: '1. List or Find',
    text: 'Upload your machinery fleet or search verified industrial equipment listings near you.'
  },
  {
    icon: ShieldCheck,
    title: '2. Secure Booking',
    text: 'Book with confidence using secure escrow and instant rental insurance coverage.'
  },
  {
    icon: Hammer,
    title: '3. Get to Work',
    text: 'Pick up your machine or have it delivered directly to your job site.'
  }
];

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar
        brand="RENTMART"
        links={[
          { href: '/#featured', label: 'Marketplace', active: true },
          { href: '/about', label: 'About Us' },
          { href: '/contact', label: 'Support' }
        ]}
        authActions={{
          signIn: { href: '/sign-in', label: 'Login' },
          signUp: { href: '/sign-up', label: 'Sign Up' },
          dashboard: { href: '/dashboard/overview', label: 'Dashboard' },
          settings: { href: '/dashboard/settings', label: 'Settings' }
        }}
        actions={[
          {
            href: '/dashboard/add-listing',
            label: 'List Equipment',
            variant: 'primary'
          }
        ]}
      />

      <HomepageMarketplaceSections />

      <section className="border-b border-border bg-primary">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 text-primary-foreground sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-[#a5d0b9]" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-border bg-[#f3f4f1] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <SectionEyebrow>Seamless Process</SectionEyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
              How Rentmart Works
            </h2>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-foreground">
                  {title}
                </h3>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:px-10 lg:px-16">
            <div className="pointer-events-none absolute inset-0 opacity-15">
              <div className="absolute inset-x-10 top-10 h-px bg-white/40" />
              <div className="absolute inset-x-10 bottom-10 h-px bg-white/20" />
              <div className="absolute left-10 top-10 bottom-10 w-px bg-white/20" />
              <div className="absolute right-10 top-10 bottom-10 w-px bg-white/20" />
            </div>

            <h2 className="relative text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl xl:text-5xl">
              Ready to Scale Your Fleet?
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#c1ecd4] sm:text-base">
              Join over 10,000 industrial businesses optimizing their capital
              expenditure through Rentmart&apos;s marketplace.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <HomepageRoleCtaActions />
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
