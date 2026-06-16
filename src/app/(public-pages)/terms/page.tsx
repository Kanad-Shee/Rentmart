'use client';

import { MarketingFooter } from '@/components/common/marketing-footer';
import { Navbar } from '@/components/common/navbar';
import { ChevronRight, Shield, FileText, Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const sections = [
  { id: 'definitions', title: '1. Definitions' },
  { id: 'obligations', title: '2. User Obligations' },
  { id: 'process', title: '3. Rental Process' },
  { id: 'disclaimer', title: '4. Liability Disclaimer' },
  { id: 'payouts', title: '5. Payouts' },
  { id: 'dispute', title: '6. Dispute Resolution' }
] as const;

function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p className="text-base  text-muted-foreground sm:text-lg">{children}</p>
  );
}

function getSectionCardClass(isActive: boolean) {
  return [
    'min-w-0 overflow-hidden scroll-mt-32 rounded-2xl border px-7 py-8 transition-all duration-300 sm:px-10 sm:py-12',
    isActive
      ? 'border-primary/20 bg-gradient-to-br from-white via-white to-white/95 shadow-lg shadow-primary/15 ring-1 ring-inset ring-primary/10'
      : 'border-primary/8 bg-white/60 shadow-md shadow-primary/5 ring-1 ring-inset ring-primary/5 hover:border-primary/15 hover:shadow-md hover:shadow-primary/8'
  ].join(' ');
}

function getDisclaimerQuoteClass(isActive: boolean) {
  return [
    'font-semibold italic  tracking-[-0.02em] text-primary transition-all duration-300',
    isActive ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
  ].join(' ');
}

export default function TermsPage() {
  const [activeSection, setActiveSection] =
    useState<(typeof sections)[number]['id']>('disclaimer');
  const shouldReduceMotion = useReducedMotion() ?? false;

  const sectionIds = useMemo(() => sections.map((section) => section.id), []);

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (sectionIds.includes(hash as (typeof sections)[number]['id'])) {
        setActiveSection(hash as (typeof sections)[number]['id']);
      }
    };

    updateFromHash();
    window.addEventListener('hashchange', updateFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length === 0) {
          return;
        }

        const closestEntry = visibleEntries.reduce((current, entry) =>
          entry.boundingClientRect.top < current.boundingClientRect.top
            ? entry
            : current
        );

        setActiveSection(
          closestEntry.target.id as (typeof sections)[number]['id']
        );
      },
      {
        root: null,
        threshold: 0.35,
        rootMargin: '-18% 0px -60% 0px'
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      window.removeEventListener('hashchange', updateFromHash);
      observer.disconnect();
    };
  }, [sectionIds]);

  const handleSectionClick = (id: (typeof sections)[number]['id']) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    setActiveSection(id);
    window.history.replaceState(null, '', `#${id}`);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f9faf6] text-foreground">
      <Navbar
        brand="RENTMART"
        links={[
          { href: '/#featured', label: 'Marketplace' },
          { href: '/about', label: 'About Us' },
          { href: '/contact', label: 'Support' },
          { href: '/terms', label: 'Terms', active: true }
        ]}
        search={{
          placeholder: 'Search equipment, categories, or locations...'
        }}
        authState="guest"
        authActions={{
          signIn: { href: '/sign-in', label: 'Login' },
          signUp: { href: '/sign-up', label: 'Sign Up' }
        }}
        actions={[
          {
            href: '/dashboard/add-listing',
            label: 'List Equipment',
            variant: 'primary'
          }
        ]}
        className="bg-white/95"
      />

      {/* Hero Section */}
      <section className="border-b relative border-primary/10 bg-gradient-to-br from-white via-white to-[#f7f8f3]">
        <div className="absolute inset-0">
          <Image
            src={'/assets/landing/landing-harvesting.webp'}
            alt="landing-harvesting"
            width={500}
            height={300}
            className="w-full h-full aspect-video object-cover opacity-30 mask-b-from-40% mask-b-to-90%"
            unoptimized
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <motion.nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 relative text-xs font-semibold uppercase tracking-[0.16em] text-primary/70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <Link
              prefetch
              href="/"
              className="transition-colors hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary">Terms of Service</span>
          </motion.nav>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="flex relative items-start gap-4 sm:gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 shadow-md shadow-primary/10 ring-1 ring-inset ring-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl leading-tight">
                  Terms of Service
                </h1>
                <p className="mt-4 text-base  text-muted-foreground sm:text-lg max-w-2xl">
                  Guidelines, obligations, and legal protections that govern
                  your use of the Rentmart platform and all equipment
                  transactions.
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary/70">
                  <span>Last updated: March 24, 2026</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="relative grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
          {/* Sidebar Navigation */}
          <motion.aside
            className="lg:sticky lg:top-28 lg:h-fit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <nav className="space-y-1.5 rounded-2xl border border-primary/10 bg-gradient-to-br from-white to-white/95 p-5 shadow-md shadow-primary/8 ring-1 ring-inset ring-primary/5">
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionClick(section.id)}
                    className={[
                      'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-300 flex items-start gap-3',
                      activeSection === section.id
                        ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-md shadow-primary/10'
                        : 'border-transparent text-muted-foreground hover:border-primary/20 hover:text-primary hover:bg-white'
                    ].join(' ')}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}>
                    <span className="mt-0.5 text-xs font-semibold opacity-70">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{section.title}</span>
                  </motion.button>
                ))}
              </nav>

              {/* Legal Contact Card */}
              <motion.div
                className="mt-8 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/8 to-primary/3 px-6 py-6 shadow-md shadow-primary/8 ring-1 ring-inset ring-primary/8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">
                      Legal Support
                    </p>
                    <p className="mt-2 text-xs  text-muted-foreground">
                      Questions about these terms?
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary break-words">
                      legal@rentmart.com
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <motion.div
                className="rounded-2xl border border-primary/10 bg-white p-4 shadow-md shadow-primary/8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                <div className="max-w-full overflow-x-auto">
                  <div className="flex min-w-max gap-2">
                    {sections.map((section) => (
                      <motion.button
                        key={section.id}
                        type="button"
                        onClick={() => handleSectionClick(section.id)}
                        className={[
                          'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 border',
                          activeSection === section.id
                            ? 'border-primary bg-primary text-white shadow-md shadow-primary/30'
                            : 'border-primary/15 bg-white text-muted-foreground hover:border-primary/30 hover:text-primary'
                        ].join(' ')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        {section.title}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="mt-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/8 to-primary/3 px-5 py-5 shadow-md shadow-primary/8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Legal Support
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Questions? Contact legal@rentmart.com
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>

          {/* Content Sections */}
          <motion.article
            className="min-w-0 max-w-full space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}>
            <section
              id="definitions"
              className={getSectionCardClass(activeSection === 'definitions')}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                    1. Definitions
                  </h2>
                </div>
              </motion.div>
              <div className="mt-8 space-y-6">
                <Paragraph>
                  In these Terms of Service, &quot;Rentmart,&quot;
                  &quot;we,&quot; &quot;us,&quot; and &quot;our&quot; refer to
                  the digital platform operating as Rentmart Industrial
                  Marketplace. &quot;User&quot; refers to any individual or
                  entity utilizing the platform for listing, renting, or
                  purchasing industrial machinery.
                </Paragraph>
                <Paragraph>
                  &quot;Platform&quot; means the Rentmart website, mobile
                  applications, and associated services. &quot;Asset&quot;
                  refers to any heavy machinery, industrial equipment, or
                  high-value tool listed for transaction on the platform.
                </Paragraph>
              </div>
            </section>

            <section
              id="obligations"
              className={getSectionCardClass(activeSection === 'obligations')}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                    2. User Obligations
                  </h2>
                </div>
              </motion.div>
              <div className="mt-8 space-y-6">
                <Paragraph>
                  Users must provide accurate, current, and complete information
                  during the registration process. You are responsible for
                  safeguarding your account credentials and for all activities
                  that occur under your account.
                </Paragraph>
                <div className="space-y-3 rounded-lg border border-primary/10 bg-primary/5 p-5 ring-1 ring-inset ring-primary/10">
                  <p className="text-sm font-semibold text-primary/80">
                    Key Compliance Areas:
                  </p>
                  <ul className="space-y-2 text-sm  text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>
                        Maintain compliance with all local industrial safety
                        regulations.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>
                        Ensure all listed machinery meets certified inspection
                        standards.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>
                        Provide accurate hour-meter readings and maintenance
                        logs for all assets.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="process"
              className={getSectionCardClass(activeSection === 'process')}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                    3. Rental Process
                  </h2>
                </div>
              </motion.div>
              <div className="mt-8 space-y-6">
                <Paragraph>
                  The rental process begins when a Renter submits a formal
                  request via the platform. Owners have 24 hours to accept or
                  decline the request. Once accepted, the Renter&apos;s payment
                  method is authorized for the full transaction value plus a
                  security deposit.
                </Paragraph>
                <Paragraph>
                  Physical handover must be documented via the Rentmart Mobile
                  Inspection App. Both parties are required to take
                  high-resolution photographs of the asset at the time of
                  delivery and return.
                </Paragraph>
              </div>
            </section>

            <section
              id="disclaimer"
              className={getSectionCardClass(activeSection === 'disclaimer')}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                    4. Liability Disclaimer
                  </h2>
                </div>
              </motion.div>
              <div className="mt-8 space-y-8">
                <Paragraph>
                  Rentmart is not an insurance company, brokerage, or agent. We
                  are a technology facilitator.
                </Paragraph>
                <motion.div
                  className="rounded-lg border border-primary/15 bg-gradient-to-br from-primary/8 to-primary/3 p-6 ring-1 ring-inset ring-primary/10"
                  animate={
                    activeSection === 'disclaimer'
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.98, opacity: 0.85 }
                  }
                  transition={{ duration: 0.3 }}>
                  <p
                    className={getDisclaimerQuoteClass(
                      activeSection === 'disclaimer'
                    )}>
                    You agree that Rentmart shall not be liable for any damage
                    to or loss of machinery, personal injury, or catastrophic
                    loss, and all legal disputes are between owner and renter
                    directly.
                  </p>
                </motion.div>
                <div className="rounded-lg border border-primary/10 bg-white/50 p-5 ring-1 ring-inset ring-primary/5">
                  <p className="text-sm  text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Important:
                    </span>{' '}
                    Users are strongly advised to maintain independent
                    commercial general liability insurance and equipment floater
                    policies for all high-capital assets.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="payouts"
              className={getSectionCardClass(activeSection === 'payouts')}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                    5. Payouts
                  </h2>
                </div>
              </motion.div>
              <div className="mt-8 space-y-6">
                <Paragraph>
                  Payouts to Owners are initiated 48 hours after the confirmed
                  return of the machinery, provided no damage claims have been
                  filed. Rentmart retains a platform fee as specified in the Fee
                  Schedule at the time of listing.
                </Paragraph>
              </div>
            </section>

            <section
              id="dispute"
              className={getSectionCardClass(activeSection === 'dispute')}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                    6. Dispute Resolution
                  </h2>
                </div>
              </motion.div>
              <div className="mt-8 space-y-6">
                <Paragraph>
                  Any dispute arising out of or in connection with these Terms,
                  including any question regarding its existence, validity, or
                  termination, shall be referred to and finally resolved by
                  arbitration in accordance with the rules of the International
                  Chamber of Commerce (ICC).
                </Paragraph>
                <Paragraph>
                  The seat of arbitration shall be Delaware, USA. The language
                  of the arbitration shall be English.
                </Paragraph>
              </div>
            </section>
          </motion.article>
        </div>
      </div>

      <MarketingFooter />
    </main>
  );
}

