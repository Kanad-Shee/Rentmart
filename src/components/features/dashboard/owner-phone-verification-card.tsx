"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  verifyPhoneSchema,
  type User,
  type VerifyPhoneInput,
} from "@/lib/auth";
import { ApiError } from "@/lib/http";
import {
  useCurrentUserQuery,
  useStartPhoneVerificationMutation,
  useVerifyPhoneMutation,
} from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function PhoneVerificationCard({
  user,
  title = "Phone Verification",
  description = "Add your mobile number, request a verification code, and confirm it here before using protected renter or owner actions.",
}: {
  user: User;
  title?: string;
  description?: string;
}) {
  const currentUserQuery = useCurrentUserQuery();
  const startMutation = useStartPhoneVerificationMutation();
  const verifyMutation = useVerifyPhoneMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasSentCode, setHasSentCode] = useState(false);
  const [sentPhone, setSentPhone] = useState<string | null>(user.phone ?? null);
  const currentUser = currentUserQuery.data ?? user;

  const verificationForm = useForm<VerifyPhoneInput>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      phone: user.phone ?? "",
      code: "",
    },
  });
  const phoneField = verificationForm.register("phone", {
    onChange: (event) => {
      if (sentPhone && event.target.value.trim() !== sentPhone) {
        setHasSentCode(false);
        verificationForm.setValue("code", "");
      }
    },
  });

  const handleSendCode = async () => {
    const isPhoneValid = await verificationForm.trigger("phone");

    if (!isPhoneValid) {
      return;
    }

    setFormError(null);
    setNotice(null);

    try {
      const phone = verificationForm.getValues("phone").trim();
      const result = await startMutation.mutateAsync({ phone });
      verificationForm.setValue("phone", result.phone);
      verificationForm.setValue("code", "");
      setSentPhone(result.phone);
      setHasSentCode(true);
      setNotice(`Verification code sent to ${result.phone}.`);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Unable to send the verification code.",
      );
    }
  };

  const handleVerify = async (values: VerifyPhoneInput) => {
    setFormError(null);
    setNotice(null);

    try {
      await verifyMutation.mutateAsync(values);
      setHasSentCode(false);
      setSentPhone(values.phone.trim());
      verificationForm.setValue("code", "");
      setNotice("Phone number verified successfully.");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Unable to verify the phone number.",
      );
    }
  };

  return (
    <section className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
        <span
          className={[
            "w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
            currentUser.phoneVerified
              ? "bg-[#c1ecd4] text-[#002114]"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {currentUser.phoneVerified ? "Verified" : "Not Verified"}
        </span>
      </div>

      <form
        onSubmit={verificationForm.handleSubmit(handleVerify)}
        className="mt-6 space-y-5 rounded-lg border border-border bg-muted/10 p-5"
      >
        <FieldGroup className="space-y-4">
          <Field data-invalid={!!verificationForm.formState.errors.phone}>
            <FieldLabel htmlFor="owner-phone">Mobile Number</FieldLabel>
            <Input
              id="owner-phone"
              type="tel"
              placeholder="9876543210"
              aria-invalid={!!verificationForm.formState.errors.phone}
              {...phoneField}
            />
            <p className="text-xs text-muted-foreground">
              Enter your normal mobile number like `9876543210` or `+919876543210`.
            </p>
            {verificationForm.formState.errors.phone ? (
              <FieldError errors={[verificationForm.formState.errors.phone]} />
            ) : null}
          </Field>

          {hasSentCode ? (
            <Field data-invalid={!!verificationForm.formState.errors.code}>
              <FieldLabel htmlFor="owner-phone-code">Verification Code</FieldLabel>
              <Input
                id="owner-phone-code"
                type="text"
                placeholder="123456"
                aria-invalid={!!verificationForm.formState.errors.code}
                {...verificationForm.register("code")}
              />
              <p className="text-xs text-muted-foreground">
                Enter the SMS code sent to your mobile number.
              </p>
              {verificationForm.formState.errors.code ? (
                <FieldError errors={[verificationForm.formState.errors.code]} />
              ) : null}
            </Field>
          ) : null}
        </FieldGroup>

        {currentUser.phoneVerified ? (
          <div className="inline-flex items-center gap-2 rounded-md bg-[#f4fbf7] px-3 py-2 text-sm font-medium text-[#0a3925]">
            <CheckCircle2 className="h-4 w-4" />
            Your phone number is already verified.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={handleSendCode}
            disabled={startMutation.isPending}
          >
            {startMutation.isPending
              ? "Sending Code..."
              : hasSentCode
                ? "Resend Code"
                : "Send Verification Code"}
          </Button>

          {hasSentCode ? (
            <Button type="submit" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? "Verifying..." : "Verify Phone Number"}
            </Button>
          ) : null}
        </div>

        {sentPhone && hasSentCode ? (
          <p className="text-sm text-muted-foreground">
            Code sent to <span className="font-semibold text-foreground">{sentPhone}</span>.
          </p>
        ) : null}
      </form>

      {formError ? (
        <div className="mt-4">
          <FieldError errors={[{ message: formError }]} />
        </div>
      ) : null}

      {notice ? <p className="mt-4 text-sm text-primary">{notice}</p> : null}
    </section>
  );
}

export function OwnerPhoneVerificationCard({ user }: { user: User }) {
  return (
    <PhoneVerificationCard
      user={user}
      title="Owner Phone Verification"
      description="Enter your business mobile number, request a verification code, and confirm it here."
    />
  );
}
