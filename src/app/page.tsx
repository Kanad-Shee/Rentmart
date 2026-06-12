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
        search={{
          placeholder: 'Search equipment, categories, or locations...'
        }}
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

      <section className="border-b border-border bg-linear-to-r from-[#081f15] via-primary to-[#081f15]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-primary-foreground sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="group flex items-center gap-4 transition-all duration-300 hover:scale-105">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-lg">
                <Icon className="h-5 w-5 text-[#a5d0b9] transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] group-hover:text-[#c1ecd4] transition-colors duration-300">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-border bg-linear-to-b from-[#f3f4f1] to-[#eef0eb] py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <SectionEyebrow>Seamless Process</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
              How Rentmart Works
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group relative rounded-xl border border-solid border-neutral-300/40 bg-linear-to-br from-white to-white/50 p-8 text-center shadow-sm ring-1 ring-inset ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-primary/15 to-primary/5 shadow-md ring-1 ring-inset ring-primary/10 transition-all duration-300 group-hover:from-primary/25 group-hover:to-primary/10">
                  <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-foreground group-hover:text-primary transition-colors duration-300">
                  {title}
                </h3>
                <p className="mx-auto mt-4 max-w-sm text-sm  text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary to-primary/90 px-6 py-20 text-center shadow-2xl shadow-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 sm:px-10 lg:px-16">
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute inset-x-10 top-10 h-px bg-white/40" />
              <div className="absolute inset-x-10 bottom-10 h-px bg-white/20" />
              <div className="absolute left-10 top-10 bottom-10 w-px bg-white/20" />
              <div className="absolute right-10 top-10 bottom-10 w-px bg-white/20" />
            </div>

            <h2 className="relative text-3xl font-extrabold tracking-tighter text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              Ready to Scale Your Fleet?
            </h2>
            <p className="relative mx-auto mt-6 max-w-2xl text-base  text-[#c1ecd4] sm:text-lg">
              Join over 10,000 industrial businesses optimizing their capital
              expenditure through Rentmart&apos;s marketplace.
            </p>
            <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <HomepageRoleCtaActions />
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
