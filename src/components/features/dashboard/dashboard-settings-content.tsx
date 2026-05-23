'use client';

import { PhoneVerificationCard } from '@/components/features/dashboard/owner-phone-verification-card';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  useCurrentUserQuery,
  useUpdatePasswordMutation,
  useUpdateProfileMutation
} from '@/hooks/use-auth';
import {
  type UpdatePasswordInput,
  type UpdateProfileInput,
  type User,
  updatePasswordSchema,
  updateProfileSchema
} from '@/lib/auth';
import { ApiError } from '@/lib/http';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, MapPinHouse, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

function getUserInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatRoleLabel(role: User['role']) {
  switch (role) {
    case 'ADMIN':
      return 'Platform Admin';
    case 'OWNER':
      return 'Equipment Owner';
    case 'RENTER':
    default:
      return 'Verified Renter';
  }
}

export function DashboardSettingsContent({
  initialUser
}: {
  initialUser: User;
}) {
  const currentUserQuery = useCurrentUserQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const user = currentUserQuery.data ?? initialUser;

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      address: user.address
    }
  });

  const passwordForm = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  useEffect(() => {
    profileForm.reset({
      address: user.address
    });
  }, [profileForm, user.address]);

  async function handleProfileSubmit(values: UpdateProfileInput) {
    setProfileError(null);

    try {
      await updateProfileMutation.mutateAsync(values);
    } catch (error) {
      setProfileError(
        error instanceof ApiError
          ? error.message
          : 'Unable to update your address right now.'
      );
    }
  }

  async function handlePasswordSubmit(values: UpdatePasswordInput) {
    setPasswordError(null);

    try {
      await updatePasswordMutation.mutateAsync(values);
      passwordForm.reset();
    } catch (error) {
      setPasswordError(
        error instanceof ApiError
          ? error.message
          : 'Unable to update your password right now.'
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
          {formatRoleLabel(user.role)}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-primary">
          Account Settings
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Review your account details, keep your address current, verify your
          phone number, and manage your password securely.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-black tracking-[-0.06em] text-primary">
              {getUserInitials(user.fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Account Details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This section reflects the current information stored for your
                account.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-[#c1ecd4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#002114]">
            {user.emailVerified ? 'Email Verified' : 'Email Pending'}
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { label: 'Full Name', value: user.fullName },
            { label: 'Email Address', value: user.email },
            { label: 'Role', value: formatRoleLabel(user.role) },
            {
              label: 'Phone Status',
              value: user.phoneVerified ? 'Verified' : 'Not Verified'
            }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <MapPinHouse className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Address
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Update the address stored on your account. This is the same
              address used elsewhere in the platform.
            </p>
          </div>
        </div>

        <form
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
          className="mt-6 space-y-5">
          <Field data-invalid={!!profileForm.formState.errors.address}>
            <FieldLabel htmlFor="settings-address">Address</FieldLabel>
            <Input
              id="settings-address"
              type="text"
              placeholder="Enter your address"
              aria-invalid={!!profileForm.formState.errors.address}
              {...profileForm.register('address')}
            />
            <FieldDescription>
              Keep this current so booking and profile flows reflect the right
              location.
            </FieldDescription>
            {profileForm.formState.errors.address ? (
              <FieldError errors={[profileForm.formState.errors.address]} />
            ) : null}
          </Field>

          {profileError ? (
            <FieldError errors={[{ message: profileError }]} />
          ) : null}

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending
              ? 'Saving Address...'
              : 'Save Address'}
          </Button>
        </form>
      </section>

      <PhoneVerificationCard
        user={user}
        title="Phone Verification"
        description="Verify your phone number here so renter bookings and owner actions stay available from your dashboard."
      />

      <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Update Password
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Change your password by confirming the current one first.
            </p>
          </div>
        </div>

        <form
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          className="mt-6 space-y-5">
          <FieldGroup className="grid gap-5 md:grid-cols-3">
            <Field
              data-invalid={!!passwordForm.formState.errors.currentPassword}>
              <FieldLabel htmlFor="current-password">
                Current Password
              </FieldLabel>
              <Input
                id="current-password"
                type="password"
                aria-invalid={!!passwordForm.formState.errors.currentPassword}
                {...passwordForm.register('currentPassword')}
              />
              {passwordForm.formState.errors.currentPassword ? (
                <FieldError
                  errors={[passwordForm.formState.errors.currentPassword]}
                />
              ) : null}
            </Field>

            <Field data-invalid={!!passwordForm.formState.errors.newPassword}>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                aria-invalid={!!passwordForm.formState.errors.newPassword}
                {...passwordForm.register('newPassword')}
              />
              {passwordForm.formState.errors.newPassword ? (
                <FieldError
                  errors={[passwordForm.formState.errors.newPassword]}
                />
              ) : null}
            </Field>

            <Field
              data-invalid={!!passwordForm.formState.errors.confirmNewPassword}>
              <FieldLabel htmlFor="confirm-new-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-new-password"
                type="password"
                aria-invalid={
                  !!passwordForm.formState.errors.confirmNewPassword
                }
                {...passwordForm.register('confirmNewPassword')}
              />
              {passwordForm.formState.errors.confirmNewPassword ? (
                <FieldError
                  errors={[passwordForm.formState.errors.confirmNewPassword]}
                />
              ) : null}
            </Field>
          </FieldGroup>

          {passwordError ? (
            <FieldError errors={[{ message: passwordError }]} />
          ) : null}

          <Button
            type="submit"
            disabled={updatePasswordMutation.isPending}>
            {updatePasswordMutation.isPending
              ? 'Updating Password...'
              : 'Update Password'}
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-border bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <UserRound className="mt-1 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">Account Health</p>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              Your email is {user.emailVerified ? 'verified' : 'not verified'}{' '}
              and your phone is{' '}
              {user.phoneVerified ? 'verified' : 'not verified'}. Verified
              contact details unlock protected actions across Rentmart.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
