'use client';

import { Navbar } from '@/components/common/navbar';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSignUpMutation } from '@/hooks/use-auth';
import { signUpSchema, type SignUpInput } from '@/lib/auth';
import { ApiError } from '@/lib/http';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeClosed, Shield, ShieldCheck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Controller, type Control, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const roleOptions = [
  {
    value: 'owner' as const,
    title: 'I am an Owner',
    description: 'List machinery and manage your fleet.',
    icon: Shield
  },
  {
    value: 'renter' as const,
    title: 'I am a Renter',
    description: 'Find and book industrial equipment.',
    icon: Wallet
  }
] as const;

function AuthField({
  name,
  label,
  placeholder,
  control,
  type = 'text',
  isPassword = false
}: {
  name: keyof SignUpInput;
  label: ReactNode;
  placeholder: string;
  control: Control<SignUpInput>;
  type?: string;
  isPassword?: boolean;
}) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className="relative">
          <FieldLabel
            htmlFor={name}
            className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#1f2421]">
            {label}
          </FieldLabel>
          <div className="relative">
            <Input
              {...field}
              id={name}
              type={isPassword ? (showPassword ? 'text' : 'password') : type}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              value={field.value ?? ''}
              className={cn(
                'h-11 rounded-md border-[#cfd3cf] bg-white px-4 text-sm placeholder:text-[#b8bcb8] focus:border-primary-container focus:ring-primary-container/25',
                isPassword && 'pr-10'
              )}
            />
            {isPassword && (
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 -translate-y-1/2 my-auto right-2">
                {showPassword ? <Eye /> : <EyeClosed />}
              </span>
            )}
          </div>

          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
        </Field>
      )}
    />
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const signUpMutation = useSignUpMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'renter',
      fullName: '',
      email: '',
      address: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: SignUpInput) => {
    setFormError(null);

    try {
      await signUpMutation.mutateAsync(values);
      toast.success('Account created. Verify your email to continue.', {
        action: {
          label: 'Open verification',
          onClick: () => {
            router.push(
              `/verify-otp?email=${encodeURIComponent(values.email)}`
            );
          }
        }
      });
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to create account.'
      );
      setFormError(
        error instanceof ApiError ? error.message : 'Unable to create account.'
      );
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f9faf6] text-foreground">
      <Navbar
        brand="RENTMART"
        links={[
          { href: '/#featured', label: 'Marketplace' },
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

      <div className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfeff_52%,#ffffff_100%)] px-10 py-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-start xl:px-14 xl:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(#012d1d_1px,transparent_1px)] bg-size-[42px_42px] opacity-[0.05]" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary-fixed opacity-25 blur-3xl" />

          <div className="relative pt-10 w-fit ml-auto z-10 max-w-xl">
            <h1 className="max-w-lg text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-[2.65rem] lg:text-[3.2rem] xl:text-[3.35rem] xl:leading-[1.06]">
              Join the Future of Rural Machinery
            </h1>
            <p className="mt-5 max-w-xl text-base  text-[#5c615e] lg:text-[17px]">
              Experience the most reliable machinery ecosystem. Precision in
              procurement for owners and renters alike.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <Shield className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Secure Payments
                  </p>
                  <p className="mt-1 text-sm  text-[#5e6661]">
                    Escrow-protected transactions for every rental contract.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Verified Users
                  </p>
                  <p className="mt-1 text-sm  text-[#5e6661]">
                    Strict identity verification for a high-trust marketplace.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <Wallet className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Platform Insurance
                  </p>
                  <p className="mt-1 text-sm  text-[#5e6661]">
                    Comprehensive damage coverage on all industrial equipment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <footer className="relative mt-auto text-center z-10 text-sm text-[#5e6661]">
            © 2026 Rentmart Industrial. All rights reserved. Precision in
            Procurement.
          </footer>
        </section>

        <section className="relative flex w-full flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-[54%] lg:px-14 lg:py-14 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(#012d1d_1px,transparent_1px)] bg-size-[36px_36px] opacity-[0.03]" />

          <div className="relative z-10 w-fit lg:mr-auto max-w-xl">
            <header className="mb-7">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-[2.15rem]">
                Create your account
              </h2>
              <p className="mt-2 text-sm  text-[#5e6661] sm:text-[15px]">
                Join our industrial network and start trading today.
              </p>
            </header>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6">
              <FieldGroup className="space-y-6">
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <div className="grid gap-3 md:grid-cols-2">
                      {roleOptions.map((option) => {
                        const isSelected = field.value === option.value;
                        const Icon = option.icon;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              'rounded-md border border-[#cfd3cf] bg-[#fcfcfb] p-4 text-left transition-all hover:border-primary-container hover:bg-[#f7fbf8]',
                              isSelected &&
                                'border-primary-container bg-primary-fixed/10 ring-1 ring-primary-container/15'
                            )}>
                            <div className="flex items-start gap-2.5">
                              <Icon className="mt-0.5 h-4.5 w-4.5 text-primary" />
                              <div>
                                <p className="text-base font-medium tracking-[-0.02em] text-primary">
                                  {option.title}
                                </p>
                                <p className="mt-1.5 text-sm  text-[#5e6661]">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <AuthField
                    control={form.control}
                    name="fullName"
                    label="Full Name"
                    placeholder="John Doe"
                  />
                  <AuthField
                    control={form.control}
                    name="email"
                    label="Email Address"
                    placeholder="john@industrial.com"
                    type="email"
                  />
                </div>

                <AuthField
                  control={form.control}
                  name="address"
                  label="Business Address"
                  placeholder="123 Industrial Way"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <AuthField
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                    isPassword={true}
                  />
                  <AuthField
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="••••••••"
                    type="password"
                    isPassword={true}
                  />
                </div>
              </FieldGroup>

              <div className="pt-1">
                {formError ? (
                  <div className="mb-4">
                    <FieldError
                      errors={[
                        {
                          message: formError
                        }
                      ]}
                    />
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={signUpMutation.isPending}
                  className="h-13 w-full rounded-md bg-linear-to-b from-primary/85 via-primary/90 to-primary/95 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/80 active:bg-primary/90">
                  {signUpMutation.isPending
                    ? 'Creating Account...'
                    : 'Create Account'}
                </Button>
              </div>

              <p className="text-center text-sm text-[#5e6661] sm:text-[15px]">
                Already have an account?{' '}
                <Link
                  prefetch
                  href="/sign-in"
                  className="font-semibold text-primary hover:underline">
                  Sign in.
                </Link>
              </p>

              <Separator className="bg-[#d8dbd7]" />

              <p className="text-center text-xs  text-[#6b7075] sm:text-sm">
                By signing up, you agree to our{' '}
                <Link
                  prefetch
                  href="/terms"
                  className="underline underline-offset-4">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  prefetch
                  href="/terms"
                  className="underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
