'use client';

import { MarketingFooter } from '@/components/common/marketing-footer';
import { Navbar } from '@/components/common/navbar';
import {
  Banknote,
  ClipboardCheck,
  ChevronRight,
  Headset,
  Search,
  ShieldCheck,
  Tractor,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

const ownerSteps = [
  {
    step: 'STEP 01',
    title: 'List Your Machine',
    image:
      '/assets/rentmart-marketplace-assets/rentmart_about_page_design/list_your_machine.webp',
    alt: 'Illustration showing a construction machine listed on the platform',
    body: 'Upload photos, add commercial specs, define delivery coverage, and publish an equipment page that gives renters the details they need to book with confidence.'
  },
  {
    step: 'STEP 02',
    title: 'Accept Bookings & Verify',
    image:
      '/assets/rentmart-marketplace-assets/rentmart_about_page_design/accept_bookings.webp',
    alt: 'Illustration showing booking approval and verification',
    body: 'Review incoming rental requests from verified businesses, confirm scheduling, and rely on Rentmart checks to keep identity, communication, and job expectations clear before handoff.'
  },
  {
    step: 'STEP 03',
    title: 'Get Paid Safely',
    image:
      '/assets/rentmart-marketplace-assets/rentmart_about_page_design/get_paid_safely.webp',
    alt: 'Illustration showing secure payment transfer',
    body: 'Secure escrow handling and milestone-based releases help owners avoid payment friction while keeping every rental traceable from confirmation through completion.'
  }
] as const;

const renterSteps = [
  {
    step: 'STEP 01',
    title: 'Search & Book Locally',
    image:
      '/assets/rentmart-marketplace-assets/rentmart_about_page_design/search_and_book_locally.webp',
    alt: 'Illustration showing local equipment search',
    body: 'Filter by category, price, availability, and distance to find the right equipment near your project site without waiting on long procurement cycles or uncertain callbacks.'
  },
  {
    step: 'STEP 02',
    title: 'Safe Delivery & Handoff',
    image:
      '/assets/rentmart-marketplace-assets/rentmart_about_page_design/safe_delivery.webp',
    alt: 'Illustration showing delivery and handoff logistics',
    body: 'Coordinate pickup or delivery, document machine condition, and keep both parties aligned on timing, site access, and operating readiness before work begins.'
  },
  {
    step: 'STEP 03',
    title: 'Complete the Job',
    image:
      '/assets/rentmart-marketplace-assets/rentmart_about_page_design/complete_the_job.webp',
    alt: 'Illustration showing successful equipment use on-site',
    body: 'Use dependable equipment to keep the job moving, then close out the rental with a transparent return flow and review system that strengthens future trust.'
  }
] as const;

const trustHighlights = [
  {
    title: '₹50,000 Damage Protection Pool',
    body: 'Every eligible rental is backed by protection designed for high-value machines, giving both owners and renters an added layer of operational confidence.',
    accent: 'Protection',
    icon: ShieldCheck,
    className:
      'md:col-span-2 bg-primary text-primary-foreground border-primary/80'
  },
  {
    title: 'Transparent Condition Reports',
    body: 'Structured handoff notes, equipment details, and documented machine condition help both parties stay aligned before delivery, during use, and at return.',
    accent: 'Clear Handoffs',
    icon: ClipboardCheck,
    className: 'bg-[#efefeb] text-foreground border-border'
  },
  {
    title: 'Secure Escrow Payments',
    body: 'Funds stay protected during the booking journey and are released according to platform rules after a successful rental handoff and completion.',
    accent: 'Escrow Ready',
    icon: Banknote,
    className: 'bg-[#efefeb] text-foreground border-border'
  },
  {
    title: '24/7 Field Support',
    body: 'Our support team is available when scheduling changes, handoff issues, or active-rental questions need a fast and professional response.',
    accent: 'Always Available',
    icon: Headset,
    className: 'md:col-span-2 bg-[#efefeb] text-foreground border-border'
  }
] as const;

function getRevealProps(shouldReduceMotion: boolean, index = 0) {
  return {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: shouldReduceMotion
      ? { duration: 0, delay: 0 }
      : {
          duration: 0.48,
          delay: Math.min(index * 0.08, 0.32),
          ease: [0.22, 1, 0.36, 1] as const
        }
  };
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
      {children}
    </p>
  );
}

function JourneyStep({
  step,
  title,
  body,
  image,
  alt,
  reverse,
  index,
  shouldReduceMotion
}: {
  step: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  reverse?: boolean;
  index: number;
  shouldReduceMotion: boolean;
}) {
  return (
    <motion.div
      className={[
        'grid items-center gap-10 lg:gap-14',
        reverse
          ? 'md:grid-cols-[1.05fr_0.95fr]'
          : 'md:grid-cols-[0.95fr_1.05fr]'
      ].join(' ')}
      {...getRevealProps(shouldReduceMotion, index)}>
      <div className={reverse ? 'md:order-2' : ''}>
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6d8b7b]">
          {step}
        </span>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl">
          {title}
        </h3>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          {body}
        </p>
      </div>

      <div
        className={[
          'relative overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-6',
          reverse ? 'md:order-1' : ''
        ].join(' ')}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(193,236,212,0.35),_transparent_48%)]" />
        <Image
          src={image}
          alt={alt}
          width={1200}
          loading={'lazy'}
          height={900}
          className="relative h-auto w-full object-contain"
        />
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <main className="min-h-screen font-display bg-[#f9faf6] text-foreground">
      <Navbar
        brand="RENTMART"
        links={[
          { href: '/#featured', label: 'Marketplace' },
          { href: '/about', label: 'About Us', active: true },
          { href: '/contact', label: 'Support' },
          { href: '/terms', label: 'Terms' }
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

      <section className="border-b border-border bg-[#fbfbf8]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <motion.nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-muted-foreground"
            {...getRevealProps(shouldReduceMotion, 0)}>
            <Link
              prefetch
              href="/"
              className="transition-colors hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">About Us</span>
          </motion.nav>

          <div className="grid gap-14 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:py-16">
            <motion.div {...getRevealProps(shouldReduceMotion, 1)}>
              <SectionEyebrow>
                Built For Modern Equipment Sharing
              </SectionEyebrow>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-primary sm:text-5xl lg:text-6xl">
                Moving idle machines into active, revenue-generating work.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Rentmart helps equipment owners earn from underused assets and
                helps contractors, builders, and industrial teams book verified
                machinery faster with clearer trust, logistics, and payment
                safeguards.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  prefetch
                  href="/dashboard/add-listing"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]">
                  List My Equipment
                </Link>
                <Link
                  prefetch
                  href="/#featured"
                  className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white">
                  Browse Machinery
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative min-h-[380px] overflow-hidden rounded-[32px] bg-[#f7f8f3] sm:min-h-[500px] lg:min-h-[620px]"
              {...getRevealProps(shouldReduceMotion, 2)}>
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0)_48%,_rgba(249,250,246,0.28)_68%,_rgba(249,250,246,0.82)_86%,_rgba(249,250,246,1)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,_rgba(249,250,246,0.92)_0%,_rgba(249,250,246,0.08)_18%,_rgba(249,250,246,0.02)_50%,_rgba(249,250,246,0.12)_82%,_rgba(249,250,246,0.88)_100%),linear-gradient(90deg,_rgba(249,250,246,0.82)_0%,_rgba(249,250,246,0.06)_16%,_rgba(249,250,246,0)_50%,_rgba(249,250,246,0.06)_84%,_rgba(249,250,246,0.82)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_left,_rgba(193,236,212,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(193,236,212,0.14),_transparent_24%)]" />
              <Image
                src="/assets/rentmart-marketplace-assets/rentmart_about_page_design/rentmart_about_hero.webp"
                alt="Rentmart hero illustration showing a trusted equipment marketplace handoff"
                fill
                loading={'lazy'}
                priority
                className="object-cover object-center scale-[1.06] [mask-image:radial-gradient(circle_at_center,black_52%,rgba(0,0,0,0.94)_68%,rgba(0,0,0,0.58)_84%,transparent_100%)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.article
              className="rounded-2xl border border-[#e4d4d1] bg-[#f5efee] p-8 shadow-[0_12px_30px_rgba(0,0,0,0.03)]"
              {...getRevealProps(shouldReduceMotion, 0)}>
              <div className="flex items-center gap-3 text-[#9a463d]">
                <TrendingDown className="h-5 w-5" />
                <h2 className="text-xl font-semibold tracking-[-0.03em]">
                  The Problem
                </h2>
              </div>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-[#6f6664] sm:text-base">
                <li>
                  Idle machinery loses value while still carrying maintenance,
                  financing, and storage costs.
                </li>
                <li>
                  Contractors often need reliable equipment quickly, but buying
                  outright for short-duration jobs ties up too much capital.
                </li>
              </ul>
            </motion.article>

            <motion.article
              className="rounded-2xl border border-[#cce3d6] bg-[#dff3e6] p-8 shadow-[0_12px_30px_rgba(0,0,0,0.03)]"
              {...getRevealProps(shouldReduceMotion, 1)}>
              <div className="flex items-center gap-3 text-primary">
                <TrendingUp className="h-5 w-5" />
                <h2 className="text-xl font-semibold tracking-[-0.03em]">
                  The Rentmart Solution
                </h2>
              </div>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-[#355344] sm:text-base">
                <li>
                  Owners unlock new revenue from existing fleets without adding
                  heavy admin overhead.
                </li>
                <li>
                  Renters can source verified machines with clearer pricing,
                  scheduling, trust checks, and secure payment flow.
                </li>
              </ul>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="text-center"
            {...getRevealProps(shouldReduceMotion, 0)}>
            <SectionEyebrow>Owner Journey</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl">
              How It Works For Owners
            </h2>
            <div className="mx-auto mt-5 h-px w-24 bg-primary/45" />
          </motion.div>

          <div className="mt-14 space-y-16 sm:space-y-20 lg:space-y-24">
            {ownerSteps.map((step, index) => (
              <JourneyStep
                key={step.title}
                {...step}
                reverse={index % 2 === 1}
                index={index + 1}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f1f2ee] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="text-center"
            {...getRevealProps(shouldReduceMotion, 0)}>
            <SectionEyebrow>Renter Journey</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl">
              How It Works For Renters
            </h2>
            <div className="mx-auto mt-5 h-px w-24 bg-primary/45" />
          </motion.div>

          <div className="mt-14 space-y-16 sm:space-y-20 lg:space-y-24">
            {renterSteps.map((step, index) => (
              <JourneyStep
                key={step.title}
                {...step}
                reverse={index % 2 === 1}
                index={index + 1}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="text-center"
            {...getRevealProps(shouldReduceMotion, 0)}>
            <SectionEyebrow>Platform Standards</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl">
              Trust & Safety
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              The protections that make equipment rentals feel more
              professional, more transparent, and easier to scale.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {trustHighlights.map(
              ({ title, body, accent, icon: Icon, className }, index) => (
                <motion.article
                  key={title}
                  className={[
                    'rounded-2xl border p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]',
                    className
                  ].join(' ')}
                  {...getRevealProps(shouldReduceMotion, index + 1)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-xl bg-white/10 p-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-65">
                      {accent}
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold tracking-[-0.04em]">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 opacity-85 sm:text-base">
                    {body}
                  </p>
                </motion.article>
              )
            )}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="relative overflow-hidden rounded-[28px] bg-primary px-6 py-14 text-center text-primary-foreground shadow-[0_24px_60px_rgba(1,45,29,0.22)] sm:px-10 lg:px-16 lg:py-18"
            {...getRevealProps(shouldReduceMotion, 0)}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(165,208,185,0.16),_transparent_45%)]" />
            <div className="pointer-events-none absolute inset-x-10 top-10 h-px bg-white/20" />
            <div className="pointer-events-none absolute inset-x-10 bottom-10 h-px bg-white/10" />
            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/8">
                <Tractor className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                Ready to join the Rentmart community?
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#cde4d7] sm:text-base">
                Whether you want to monetize your fleet or source dependable
                machinery for the next project, Rentmart is built to make the
                process faster and more trusted.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  prefetch
                  href="/dashboard/add-listing"
                  className="inline-flex items-center justify-center rounded-md bg-[#c1ecd4] px-6 py-3 text-sm font-semibold text-[#022618] transition-colors hover:bg-[#d2f4df]">
                  List My Equipment
                </Link>
                <Link
                  prefetch
                  href="/#featured"
                  className="inline-flex items-center justify-center rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/8">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Machinery
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
