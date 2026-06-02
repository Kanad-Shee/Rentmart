'use client';

import { MarketingFooter } from '@/components/common/marketing-footer';
import { Navbar } from '@/components/common/navbar';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCurrentUserQuery } from '@/hooks/use-auth';
import { useCreateSupportQueryMutation } from '@/hooks/use-support-query';
import { ApiError } from '@/lib/http';
import {
  createSupportQuerySchema,
  supportQueryLabels,
  type CreateSupportQueryInput
} from '@/lib/support-query';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronRight,
  CircleAlert,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  Phone,
  SendHorizontal
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function getRevealProps(shouldReduceMotion: boolean, index = 0) {
  return {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: shouldReduceMotion
      ? { duration: 0, delay: 0 }
      : {
          duration: 0.42,
          delay: Math.min(index * 0.08, 0.28),
          ease: [0.22, 1, 0.36, 1] as const
        }
  };
}

function formatRoleLabel(role: 'ADMIN' | 'OWNER' | 'RENTER') {
  if (role === 'OWNER') {
    return 'Equipment Owner';
  }

  if (role === 'RENTER') {
    return 'Renter';
  }

  return 'Platform Admin';
}

export function ContactPageContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const currentUserQuery = useCurrentUserQuery();
  const createSupportQueryMutation = useCreateSupportQueryMutation();
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const user = currentUserQuery.data;
  const canSubmit = user?.role === 'OWNER' || user?.role === 'RENTER';

  const contactLinks = useMemo(
    () => [
      {
        label: 'Phone',
        value: '+91 98765 43210',
        meta: 'Mon-Fri 9am-6pm',
        icon: Phone,
        href: 'tel:+919876543210'
      },
      {
        label: 'Email',
        value: 'support@rentmart.in',
        meta: "We'll respond within 24 hours",
        icon: Mail,
        href: 'mailto:support@rentmart.in'
      },
      {
        label: 'Headquarters',
        value: 'Rentmart Tower, 4th Floor',
        meta: 'Hitech City, Hyderabad, 500081',
        icon: MapPin,
        href: 'https://maps.google.com/?q=Hitech+City+Hyderabad'
      }
    ],
    []
  );

  const form = useForm<CreateSupportQueryInput>({
    resolver: zodResolver(createSupportQuerySchema),
    defaultValues: {
      topic: 'GENERAL_INQUIRY',
      message: ''
    }
  });

  async function handleSubmit(values: CreateSupportQueryInput) {
    setSubmitNotice(null);
    setSubmitError(null);

    try {
      await createSupportQueryMutation.mutateAsync(values);
      form.reset({
        topic: 'GENERAL_INQUIRY',
        message: ''
      });
      setSubmitNotice('Your query has been sent to the Rentmart support desk.');
      toast.success('Support request sent.', {
        description:
          'Our team will review it and follow up through your account email.'
      });
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "We couldn't send your query right now. Please try again shortly."
      );
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "We couldn't send your query right now. Please try again shortly."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f9faf6] text-foreground">
      <Navbar
        brand="RENTMART"
        links={[
          { href: '/#featured', label: 'Marketplace' },
          { href: '/about', label: 'About Us' },
          { href: '/contact', label: 'Support', active: true }
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

      <section className="border-b border-border bg-[#fbfbf8]">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
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
            <span className="font-medium text-foreground">Contact Us</span>
          </motion.nav>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.15fr] lg:gap-12 lg:px-8">
          <motion.div
            className="flex flex-col justify-between"
            {...getRevealProps(shouldReduceMotion, 1)}>
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-primary sm:text-4xl lg:text-5xl">
                We&apos;re here to help.
              </h1>
              <p className="mt-5 max-w-md text-sm  text-muted-foreground sm:text-base lg:text-lg lg:">
                Have a question about a rental or need help listing your
                machinery? Reach out to our team.
              </p>

              <div className="mt-10 space-y-7">
                {contactLinks.map(
                  ({ label, value, meta, icon: Icon, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="group flex items-start gap-4 rounded-xl transition-transform hover:-translate-y-0.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-[#f3f4f1]">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                          {label}
                        </h2>
                        <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground sm:text-xl">
                          {value}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {meta}
                        </p>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>
          </motion.div>

          <motion.section
            className="rounded-2xl border border-border bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-8"
            {...getRevealProps(shouldReduceMotion, 2)}>
            <div className="flex items-start gap-3">
              <Headphones className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                  Send us a message
                </h2>
                <p className="mt-2 text-sm  text-muted-foreground">
                  Support queries can be submitted only by owner and renter
                  accounts. We use your logged-in profile details automatically.
                </p>
              </div>
            </div>

            {!user ? (
              <div className="mt-6 rounded-xl border border-[#d9e0d9] bg-[#f8faf7] p-5">
                <p className="text-sm  text-muted-foreground">
                  Sign in as an owner or renter to submit a support request.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    prefetch
                    href="/sign-in"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]">
                    Sign In
                  </Link>
                  <Link
                    prefetch
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : null}

            {user && !canSubmit ? (
              <div className="mt-6 rounded-xl border border-[#ffe0cf] bg-[#fff6f0] p-5">
                <div className="flex items-start gap-3 text-[#8b3f1f]">
                  <CircleAlert className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-semibold">
                      Admin accounts can review support queries but cannot
                      create them.
                    </p>
                    <p className="mt-2 text-sm ">
                      Please use an owner or renter account if you need to
                      submit a marketplace support request.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="contact-full-name">Full Name</FieldLabel>
                  <Input
                    id="contact-full-name"
                    value={user?.fullName ?? ''}
                    readOnly
                    disabled
                    placeholder="Sign in to autofill"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="contact-email">Email Address</FieldLabel>
                  <Input
                    id="contact-email"
                    value={user?.email ?? ''}
                    readOnly
                    disabled
                    placeholder="Sign in to autofill"
                  />
                </Field>
              </div>

              <Field data-invalid={!!form.formState.errors.topic}>
                <FieldLabel htmlFor="contact-topic">
                  How can we help?
                </FieldLabel>
                <select
                  id="contact-topic"
                  className="flex h-12 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canSubmit || createSupportQueryMutation.isPending}
                  aria-invalid={!!form.formState.errors.topic}
                  {...form.register('topic')}>
                  {Object.entries(supportQueryLabels).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.topic ? (
                  <FieldError errors={[form.formState.errors.topic]} />
                ) : null}
              </Field>

              <Field data-invalid={!!form.formState.errors.message}>
                <FieldLabel htmlFor="contact-message">Your Message</FieldLabel>
                <textarea
                  id="contact-message"
                  rows={6}
                  placeholder="Tell us more about your request..."
                  disabled={!canSubmit || createSupportQueryMutation.isPending}
                  aria-invalid={!!form.formState.errors.message}
                  className="flex min-h-40 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  {...form.register('message')}
                />
                <FieldDescription>
                  We store support queries securely in the admin queue for
                  review.
                </FieldDescription>
                {form.formState.errors.message ? (
                  <FieldError errors={[form.formState.errors.message]} />
                ) : null}
              </Field>

              {user ? (
                <div className="rounded-xl border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Account Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {formatRoleLabel(user.role)}
                  </p>
                </div>
              ) : null}

              {submitError ? (
                <FieldError errors={[{ message: submitError }]} />
              ) : null}
              {submitNotice ? (
                <p className="text-sm font-medium text-primary">
                  {submitNotice}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={!canSubmit || createSupportQueryMutation.isPending}
                className="h-14 w-full text-base font-semibold">
                {createSupportQueryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message
                    <SendHorizontal className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.section>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
