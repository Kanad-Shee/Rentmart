"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/common/navbar";
import { MarketingFooter } from "@/components/common/marketing-footer";

const sections = [
  { id: "definitions", title: "1. Definitions" },
  { id: "obligations", title: "2. User Obligations" },
  { id: "process", title: "3. Rental Process" },
  { id: "disclaimer", title: "4. Liability Disclaimer" },
  { id: "payouts", title: "5. Payouts" },
  { id: "dispute", title: "6. Dispute Resolution" },
] as const;

function Paragraph({ children }: { children: ReactNode }) {
  return <p className='text-sm md:text-base text-[#5e6661]'>{children}</p>;
}

function FooterLink({ children }: { children: string }) {
  return (
    <Link
      href='/terms'
      className='text-base text-[#6c7480] transition-colors hover:text-primary'
    >
      {children}
    </Link>
  );
}

function getSectionCardClass(isActive: boolean) {
  return [
    "scroll-mt-28 rounded-[1.75rem] border border-transparent px-6 py-8 transition-all duration-200 sm:px-8 sm:py-10",
    isActive
      ? "border-primary/20 bg-[#e8f2e9] shadow-[0_8px_24px_rgba(27,67,50,0.08)]"
      : "bg-transparent",
  ].join(" ");
}

function getDisclaimerQuoteClass(isActive: boolean) {
  return [
    "font-semibold italic leading-[1.6] tracking-[-0.02em] text-[#1f2421] transition-all duration-200",
    isActive ? "text-2xl sm:text-[2.1rem]" : "text-xl sm:text-2xl",
  ].join(" ");
}

export default function TermsPage() {
  const [activeSection, setActiveSection] =
    useState<(typeof sections)[number]["id"]>("disclaimer");

  const sectionIds = useMemo(() => sections.map((section) => section.id), []);

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (sectionIds.includes(hash as (typeof sections)[number]["id"])) {
        setActiveSection(hash as (typeof sections)[number]["id"]);
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length === 0) {
          return;
        }

        const closestEntry = visibleEntries.reduce((current, entry) =>
          entry.boundingClientRect.top < current.boundingClientRect.top
            ? entry
            : current,
        );

        setActiveSection(
          closestEntry.target.id as (typeof sections)[number]["id"],
        );
      },
      {
        root: null,
        threshold: 0.35,
        rootMargin: "-18% 0px -60% 0px",
      },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
      observer.disconnect();
    };
  }, [sectionIds]);

  const handleSectionClick = (id: (typeof sections)[number]["id"]) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    setActiveSection(id);
    window.history.replaceState(null, "", `#${id}`);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className='min-h-screen bg-[#f9faf6] text-foreground'>
      <Navbar
        brand='RENTMART'
        links={[
          { href: "/#featured", label: "Marketplace" },
          { href: "/about", label: "About Us" },
          { href: "/contact", label: "Support" },
          { href: "/terms", label: "Terms", active: true },
        ]}
        authState='guest'
        authActions={{
          signIn: { href: "/sign-in", label: "Login" },
          signUp: { href: "/sign-up", label: "Sign Up" },
        }}
        actions={[
          {
            href: "/dashboard/add-listing",
            label: "List Equipment",
            variant: "primary",
          },
        ]}
        className='bg-white/95'
      />

      <section className='border-b border-[#e2e3e0] bg-white'>
        <div className='mx-auto max-w-[1440px] px-6 py-12 lg:px-16 lg:py-16'>
          <nav
            aria-label='Breadcrumb'
            className='flex items-center gap-2 text-lg text-[#6b7075]'
          >
            <Link href='/' className='transition-colors hover:text-primary'>
              Home
            </Link>
            <ChevronRight className='h-4 w-4' />
            <Link
              href='/terms'
              className='transition-colors hover:text-primary'
            >
              Legal
            </Link>
            <ChevronRight className='h-4 w-4' />
            <span className='font-medium text-primary'>Terms of Service</span>
          </nav>

          <div className='mt-14 max-w-4xl'>
            <h1 className='text-3xl sm:text-4xl font-semibold tracking-[-0.05em] text-primary '>
              Terms of Service
            </h1>
            <p className='mt-6 text-lg font-medium text-[#6b7075]'>
              Last updated: March 24, 2026
            </p>
          </div>
        </div>
      </section>

      <div className='mx-auto grid max-w-[1440px] gap-12 px-6 py-16 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-20 lg:px-16 lg:py-20'>
        <aside className='lg:sticky lg:top-28 lg:h-fit'>
          <div className='hidden border-l border-[#d9dcd5] pl-6 lg:block'>
            <nav className='flex flex-col gap-2'>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type='button'
                  onClick={() => handleSectionClick(section.id)}
                  className={[
                    "border-l-2 py-1.5 pl-5 text-left text-sm leading-tight transition-colors",
                    activeSection === section.id
                      ? "border-emerald-600 bg-emerald-50 shadow-md/5 font-medium text-primary"
                      : "border-transparent text-[#6b7075] hover:border-primary hover:text-primary",
                  ].join(" ")}
                >
                  {section.title}
                </button>
              ))}
            </nav>

            <div className='mt-10 rounded-xl bg-[#f3f4f1] px-6 py-6 text-xs text-[#4f5752] shadow-[0_1px_0_rgba(0,0,0,0.02)]'>
              <p>Need legal assistance regarding these terms?</p>
              <p>Contact our compliance department at</p>
              <p className='break-words'>legal@rentmart.com</p>
            </div>
          </div>

          <div className='lg:hidden'>
            <div className='flex gap-3 overflow-x-auto rounded-2xl border border-[#e2e3e0] bg-white p-3'>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type='button'
                  onClick={() => handleSectionClick(section.id)}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-white"
                      : "bg-[#f3f4f1] text-[#4f5964]",
                  ].join(" ")}
                >
                  {section.title}
                </button>
              ))}
            </div>

            <div className='mt-6 rounded-2xl bg-[#f3f4f1] px-5 py-5 text-sm leading-7 text-[#4f5752]'>
              <p>Need legal assistance regarding these terms?</p>
              <p>Contact our compliance department at</p>
              <p className='break-words'>legal@rentmart.com</p>
            </div>
          </div>
        </aside>

        <article className='space-y-16'>
          <section
            id='definitions'
            className={getSectionCardClass(activeSection === "definitions")}
          >
            <h2 className='text-xl font-semibold tracking-[-0.03em] text-primary md:text-2xl'>
              1. Definitions
            </h2>
            <div className='mt-8 space-y-6'>
              <Paragraph>
                In these Terms of Service, &quot;Rentmart,&quot; &quot;we,&quot;
                &quot;us,&quot; and &quot;our&quot; refer to the digital
                platform operating as Rentmart Industrial Marketplace.
                &quot;User&quot; refers to any individual or entity utilizing
                the platform for listing, renting, or purchasing industrial
                machinery.
              </Paragraph>
              <Paragraph>
                &quot;Platform&quot; means the Rentmart website, mobile
                applications, and associated services. &quot;Asset&quot; refers
                to any heavy machinery, industrial equipment, or high-value tool
                listed for transaction on the platform.
              </Paragraph>
            </div>
          </section>

          <section
            id='obligations'
            className={getSectionCardClass(activeSection === "obligations")}
          >
            <h2 className='text-xl font-semibold tracking-[-0.03em] text-primary md:text-2xl'>
              2. User Obligations
            </h2>
            <div className='mt-8 space-y-6'>
              <Paragraph>
                Users must provide accurate, current, and complete information
                during the registration process. You are responsible for
                safeguarding your account credentials and for all activities
                that occur under your account.
              </Paragraph>
              <div className='space-y-3 pl-2 font-semibold text-lg text-[#4a524d]'>
                <p>
                  Maintain compliance with all local industrial safety
                  regulations.
                </p>
                <p>
                  Ensure all listed machinery meets certified inspection
                  standards.
                </p>
                <p>
                  Provide accurate hour-meter readings and maintenance logs for
                  all assets.
                </p>
              </div>
            </div>
          </section>

          <section
            id='process'
            className={getSectionCardClass(activeSection === "process")}
          >
            <h2 className='text-xl font-semibold tracking-[-0.03em] text-primary md:text-2xl'>
              3. Rental Process
            </h2>
            <div className='mt-8 space-y-6'>
              <Paragraph>
                The rental process begins when a Renter submits a formal request
                via the platform. Owners have 24 hours to accept or decline the
                request. Once accepted, the Renter&apos;s payment method is
                authorized for the full transaction value plus a security
                deposit.
              </Paragraph>
              <Paragraph>
                Physical handover must be documented via the Rentmart Mobile
                Inspection App. Both parties are required to take
                high-resolution photographs of the asset at the time of delivery
                and return.
              </Paragraph>
            </div>
          </section>

          <section
            id='disclaimer'
            className={[
              getSectionCardClass(activeSection === "disclaimer"),
              activeSection === "disclaimer"
                ? "border-l-[6px] border-primary sm:px-12 sm:py-14"
                : "border-border/60 bg-white/40 sm:px-10 sm:py-12",
            ].join(" ")}
          >
            <h2 className='text-xl font-semibold tracking-[-0.03em] text-primary md:text-2xl'>
              4. Liability Disclaimer
            </h2>
            <div className='mt-8 space-y-8'>
              <Paragraph>
                Rentmart is not an insurance company, brokerage, or agent. We
                are a technology facilitator.
              </Paragraph>
              <p
                className={getDisclaimerQuoteClass(
                  activeSection === "disclaimer",
                )}
              >
                You agree that Rentmart shall not be liable for any damage to or
                loss of machinery, personal injury, or catastrophic loss, and
                all legal disputes are between owner and renter directly.
              </p>
              <p className='max-w-4xl text-lg leading-8 text-[#5b6460]'>
                Users are strongly advised to maintain independent commercial
                general liability insurance and equipment floater policies for
                all high-capital assets.
              </p>
            </div>
          </section>

          <section
            id='payouts'
            className={getSectionCardClass(activeSection === "payouts")}
          >
            <h2 className='text-xl font-semibold tracking-[-0.03em] text-primary md:text-2xl'>
              5. Payouts
            </h2>
            <div className='mt-8 space-y-6'>
              <Paragraph>
                Payouts to Owners are initiated 48 hours after the confirmed
                return of the machinery, provided no damage claims have been
                filed. Rentmart retains a platform fee as specified in the Fee
                Schedule at the time of listing.
              </Paragraph>
            </div>
          </section>

          <section
            id='dispute'
            className={getSectionCardClass(activeSection === "dispute")}
          >
            <h2 className='text-xl font-semibold tracking-[-0.03em] text-primary md:text-2xl'>
              6. Dispute Resolution
            </h2>
            <div className='mt-8 space-y-6'>
              <Paragraph>
                Any dispute arising out of or in connection with these Terms,
                including any question regarding its existence, validity, or
                termination, shall be referred to and finally resolved by
                arbitration in accordance with the rules of the International
                Chamber of Commerce (ICC).
              </Paragraph>
              <Paragraph>
                The seat of arbitration shall be Delaware, USA. The language of
                the arbitration shall be English.
              </Paragraph>
            </div>
          </section>
        </article>
      </div>

      {/* <footer className='border-t border-[#e2e3e0] bg-white'>
        <div className='mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-14 lg:flex-row lg:items-start lg:justify-between lg:px-16 lg:py-16'>
          <div className='max-w-sm'>
            <Link
              href='/'
              className='text-3xl font-black tracking-[-0.04em] text-slate-900'
            >
              Rentmart
            </Link>
            <p className='mt-4 text-lg leading-8 text-[#6c7480]'>
              © 2024 Rentmart Industrial Marketplace. All rights reserved.
              High-capital asset procurement.
            </p>
          </div>

          <div className='flex flex-wrap gap-x-12 gap-y-4 lg:pt-4'>
            <FooterLink>Terms of Service</FooterLink>
            <FooterLink>Privacy Policy</FooterLink>
            <FooterLink>Cookie Policy</FooterLink>
            <FooterLink>Compliance</FooterLink>
            <FooterLink>Safety Standards</FooterLink>
            <FooterLink>Contact Support</FooterLink>
          </div>
        </div>
      </footer> */}
      <MarketingFooter />
    </main>
  );
}
