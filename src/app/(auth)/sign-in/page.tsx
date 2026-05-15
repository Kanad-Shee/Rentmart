"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FieldError as RHFFieldError,
  type UseFormRegister,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";

import { useSignInMutation } from "@/hooks/use-auth";
import { signInSchema, type SignInInput } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function AuthField({
  name,
  label,
  placeholder,
  register,
  error,
  type = "text",
}: {
  name: keyof SignInInput;
  label: string;
  placeholder: string;
  register: UseFormRegister<SignInInput>;
  error?: RHFFieldError;
  type?: string;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel
        htmlFor={name}
        className='text-[13px] font-medium uppercase tracking-[0.08em] text-[#1f2421]'
      >
        {label}
      </FieldLabel>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className='h-11 rounded-md border-[#cfd3cf] bg-white px-4 text-sm placeholder:text-[#b8bcb8] focus:border-primary-container focus:ring-primary-container/25'
        aria-invalid={!!error}
        {...register(name)}
      />
      {error ? <FieldError errors={[error]} /> : null}
    </Field>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const signInMutation = useSignInMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  

  const onSubmit = async (values: SignInInput) => {
    setFormError(null);

    try {
      await signInMutation.mutateAsync(values);
      router.replace("/dashboard");
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "EMAIL_NOT_VERIFIED"
      ) {
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
        return;
      }

      setFormError(
        error instanceof ApiError ? error.message : "Unable to sign in.",
      );
    }
  };

  return (
    <main className='min-h-screen overflow-hidden bg-[#f9faf6] text-foreground'>
      <div className='flex min-h-screen flex-col lg:flex-row'>
        <section className='relative flex w-full flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-[48%] lg:px-14 lg:py-14 xl:px-20'>
          <div className='relative z-10 w-full max-w-[420px]'>
            <div className='mb-8'>
              <span className='text-2xl font-bold tracking-[-0.04em] text-primary'>
                Rentmart
              </span>
            </div>

            <header className='mb-7'>
              <h1 className='max-w-xl text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-[2.55rem] sm:leading-[1.1]'>
                Welcome back to Rentmart
              </h1>
              <p className='mt-3 max-w-md text-sm leading-6 text-[#5e6661] sm:text-[15px]'>
                Please enter your details to access your dashboard.
              </p>
            </header>

            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              <FieldGroup className='space-y-5'>
                <AuthField
                  name='email'
                  label='Email Address'
                  placeholder='name@company.com'
                  register={form.register}
                  error={form.formState.errors.email}
                  type='email'
                />

                <AuthField
                  name='password'
                  label='Password'
                  placeholder='••••••••'
                  register={form.register}
                  error={form.formState.errors.password}
                  type='password'
                />
              </FieldGroup>

              {formError ? (
                <FieldError
                  errors={[
                    {
                      message: formError,
                    },
                  ]}
                />
              ) : null}

              <div className='flex items-center justify-between gap-4'>
                <label className='flex items-center gap-2 text-xs text-[#5e6661] sm:text-sm'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 rounded-sm border-[#cfd3cf] text-primary focus:ring-primary'
                    {...form.register("rememberMe")}
                  />
                  <span className='select-none'>Remember me</span>
                </label>

                <Link
                  href='/terms'
                  className='text-xs font-semibold text-primary hover:underline sm:text-sm'
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type='submit'
                disabled={signInMutation.isPending}
                className='h-[52px] w-full rounded-md bg-primary text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/80 active:bg-primary/90'
              >
                {signInMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <footer className='mt-8 text-center'>
              <p className='text-sm text-[#5e6661] sm:text-[15px]'>
                Don&apos;t have an account?{" "}
                <Link
                  href='/sign-up'
                  className='font-semibold text-primary hover:underline'
                >
                  Sign up.
                </Link>
              </p>
            </footer>
          </div>
        </section>

        <section className='relative hidden overflow-hidden bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfeff_50%,#ffffff_100%)] px-10 py-10 lg:flex lg:w-[52%] lg:flex-col lg:items-center lg:justify-center xl:px-14 xl:py-14'>
          <div className='absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#012d1d_1px,transparent_1px)] [background-size:40px_40px]' />
          <div className='absolute inset-x-0 top-12 flex justify-center'>
            <div className='flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-primary sm:text-xs'>
              <span className='h-1.5 w-1.5 rounded-full bg-primary' />
              Precision Engineered
              <span className='h-1.5 w-1.5 rounded-full bg-primary' />
            </div>
          </div>

          <div className='relative z-10 w-full max-w-[600px]'>
            <div className='relative mx-auto aspect-[1.05] w-full max-w-[520px] overflow-hidden'>
              <div className='absolute inset-0 rounded-md bg-primary-fixed/40 blur-3xl' />
              <div className='relative h-full w-full overflow-hidden rounded-md border border-[#dce0db] bg-white shadow-[0_20px_50px_rgba(1,45,29,0.08)]'>
                <Image
                  src='/assets/landing/harvesting.webp'
                  alt='Modern harvester machine'
                  fill
                  priority
                  className='object-cover'
                  sizes='(max-width: 1024px) 100vw, 50vw'
                />

                <Card className='absolute bottom-6 right-5 w-[280px] border border-[#dce0db] bg-white/95 py-0 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur'>
                  <CardContent className='flex items-center gap-3 px-4 py-3'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-primary-fixed'>
                      <ShieldCheck className='h-[18px] w-[18px] text-primary' />
                    </div>
                    <div>
                      <CardTitle className='text-xl font-semibold tracking-[-0.03em] text-primary'>
                        Over 5,000+
                      </CardTitle>
                      <CardDescription className='text-sm text-[#5e6661]'>
                        safe rentals completed.
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <p className='mx-auto mt-10 max-w-xl text-center text-base leading-7 text-primary'>
              Experience the most reliable machinery ecosystem for owners and
              renters alike.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
