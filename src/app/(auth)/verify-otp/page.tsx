'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useResendOtpMutation, useVerifyOtpMutation } from '@/hooks/use-auth';
import {
  resendOtpSchema,
  verifyOtpSchema,
  type VerifyOtpInput
} from '@/lib/auth';
import { ApiError } from '@/lib/http';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ResendOtpFormInput = {
  email: string;
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const emailFromQuery = searchParams.get('email') ?? '';

  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: ''
    }
  });

  useEffect(() => {
    if (emailFromQuery) {
      form.setValue('email', emailFromQuery);
    }
  }, [emailFromQuery, form]);

  const onSubmit = async (values: VerifyOtpInput) => {
    setFormError(null);
    setNotice(null);

    try {
      await verifyOtpMutation.mutateAsync(values);
      toast.success('Email verified successfully.');
      router.replace('/dashboard');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to verify OTP.'
      );
      setFormError(
        error instanceof ApiError ? error.message : 'Unable to verify OTP.'
      );
    }
  };

  const handleResend = async () => {
    setFormError(null);
    setNotice(null);

    const values = form.getValues();
    const parsed = resendOtpSchema.safeParse({
      email: values.email
    } satisfies ResendOtpFormInput);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue) {
        form.setError('email', { message: issue.message });
      }
      return;
    }

    try {
      await resendOtpMutation.mutateAsync(parsed.data);
      setNotice('A new OTP has been sent to your email.');
      toast.success('A fresh OTP is on its way.', {
        description: 'Check your inbox and spam folder for the latest code.'
      });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Unable to resend OTP.'
      );
      setFormError(
        error instanceof ApiError ? error.message : 'Unable to resend OTP.'
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9faf6] px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-[#dce0db] bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Rentmart Security
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary">
            Verify your OTP
          </h1>
          <p className="mt-3 text-sm  text-[#5e6661]">
            Enter the verification code sent to your email to finish signing in.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 space-y-5">
          <FieldGroup className="space-y-5">
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel
                htmlFor="email"
                className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#1f2421]">
                Email Address
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="h-11 rounded-md border-[#cfd3cf] bg-white px-4 text-sm placeholder:text-[#b8bcb8] focus:border-primary-container focus:ring-primary-container/25"
                aria-invalid={!!form.formState.errors.email}
                {...form.register('email')}
              />
              {form.formState.errors.email ? (
                <FieldError errors={[form.formState.errors.email]} />
              ) : null}
            </Field>

            <Field data-invalid={!!form.formState.errors.otp}>
              <FieldLabel
                htmlFor="otp"
                className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#1f2421]">
                OTP Code
              </FieldLabel>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                className="h-11 rounded-md border-[#cfd3cf] bg-white px-4 text-sm tracking-[0.35em] placeholder:tracking-normal placeholder:text-[#b8bcb8] focus:border-primary-container focus:ring-primary-container/25"
                aria-invalid={!!form.formState.errors.otp}
                {...form.register('otp')}
              />
              {form.formState.errors.otp ? (
                <FieldError errors={[form.formState.errors.otp]} />
              ) : null}
            </Field>
          </FieldGroup>

          {formError ? (
            <FieldError
              errors={[
                {
                  message: formError
                }
              ]}
            />
          ) : null}

          {notice ? <p className="text-sm text-primary">{notice}</p> : null}

          <Button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="h-13 w-full rounded-md text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/80 active:bg-primary/90">
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col gap-3 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendOtpMutation.isPending}
            className="font-semibold text-primary hover:underline disabled:opacity-70">
            {resendOtpMutation.isPending ? 'Sending new OTP...' : 'Resend OTP'}
          </button>

          <Link
            prefetch
            href="/sign-in"
            className="text-[#5e6661] hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
