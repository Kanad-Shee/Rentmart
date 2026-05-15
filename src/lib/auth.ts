import { z } from "zod";
import { apiRequest } from "./http";
import { AUTH_COOKIE_NAME } from "./auth-cookie";

export { AUTH_COOKIE_NAME };

function sanitizePhoneInput(phone: string) {
  return phone.trim().replace(/[\s()-]/g, "");
}

export function normalizePhoneInput(phone: string) {
  const sanitized = sanitizePhoneInput(phone);

  if (sanitized.startsWith("+")) {
    return `+${sanitized.slice(1).replace(/\D/g, "")}`;
  }

  if (sanitized.startsWith("00")) {
    return `+${sanitized.slice(2).replace(/\D/g, "")}`;
  }

  const digits = sanitized.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  return sanitized;
}

const phoneNumberSchema = z
  .string({ message: "Phone number is required." })
  .trim()
  .transform(normalizePhoneInput)
  .pipe(
    z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter a valid mobile number."),
  );

export const signUpSchema = z
  .object({
    role: z.enum(["owner", "renter"]),
    fullName: z
      .string({ message: "Full name is required." })
      .trim()
      .min(2, "Enter your full name.")
      .max(50, "Full name is too long."),
    email: z
      .string({ message: "Email is required." })
      .trim()
      .email("Enter a valid email address."),
    address: z
      .string({ message: "Business address is required." })
      .trim()
      .min(2, "Enter a valid business address.")
      .max(80, "Business address is too long."),
    password: z
      .string({ message: "Password is required." })
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z
      .string({ message: "Confirm your password." })
      .min(8, "Password must be at least 8 characters."),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export const signInSchema = z.object({
  email: z
    .string({ message: "Email is required." })
    .trim()
    .email("Enter a valid email address."),
  password: z
    .string({ message: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean().optional(),
});

export const verifyOtpSchema = z.object({
  email: z
    .string({ message: "Email is required." })
    .trim()
    .email("Enter a valid email address."),
  otp: z
    .string({ message: "OTP is required." })
    .trim()
    .length(6, "OTP must be 6 digits."),
});

export const resendOtpSchema = z.object({
  email: z
    .string({ message: "Email is required." })
    .trim()
    .email("Enter a valid email address."),
});

export const startPhoneVerificationSchema = z.object({
  phone: phoneNumberSchema,
});

export const verifyPhoneSchema = z.object({
  phone: phoneNumberSchema,
  code: z
    .string({ message: "Verification code is required." })
    .trim()
    .min(4, "Verification code is too short.")
    .max(10, "Verification code is too long."),
});

export const updateProfileSchema = z.object({
  address: z
    .string({ message: "Address is required." })
    .trim()
    .min(2, "Enter a valid address.")
    .max(120, "Address is too long."),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ message: "Current password is required." })
      .min(8, "Password must be at least 8 characters."),
    newPassword: z
      .string({ message: "New password is required." })
      .min(8, "Password must be at least 8 characters."),
    confirmNewPassword: z
      .string({ message: "Confirm your new password." })
      .min(8, "Password must be at least 8 characters."),
  })
  .superRefine((values, ctx) => {
    if (values.newPassword !== values.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Passwords do not match.",
      });
    }

    if (values.currentPassword === values.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password must be different from the current password.",
      });
    }
  });

export type UserRole = "ADMIN" | "OWNER" | "RENTER";

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserVerificationFilter = "ALL" | "VERIFIED" | "ACTION_REQUIRED";

export type AdminUsersQueryInput = {
  search?: string;
  role?: "ALL" | UserRole;
  verification?: AdminUserVerificationFilter;
};

export type AdminUserManagementItem = User & {
  listingCount: number;
  renterBookingCount: number;
  ownerBookingCount: number;
  unreadNotificationCount: number;
  lastActivityAt: string;
};

export type DashboardMetrics = {
  pendingVerifications: number;
  activeUsers: number;
  platformAlerts: number;
  manualSettlementQueue: number;
  totalUsers: number;
  activeListings: number;
  bookingRequests: number;
  recentSignups: number;
};

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type StartPhoneVerificationInput = z.infer<typeof startPhoneVerificationSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export type AuthUserPayload = {
  user: User;
};

export type SignUpPayload = {
  user: User;
  otpExpiresAt: string;
};

export type ResendOtpPayload = {
  user: User;
  otpExpiresAt: string;
};

export type StartPhoneVerificationPayload = {
  phone: string;
};

export type PasswordUpdatePayload = null;

export const authQueryKeys = {
  currentUser: ["auth", "me"] as const,
  adminUsers: (input: AdminUsersQueryInput) =>
    [
      "auth",
      "admin-users",
      input.search?.trim() ?? "",
      input.role ?? "ALL",
      input.verification ?? "ALL",
    ] as const,
  dashboardMetrics: ["auth", "dashboard-metrics"] as const,
};

export async function signUp(input: SignUpInput) {
  const response = await apiRequest<SignUpPayload>("/auth/signup", {
    method: "POST",
    body: input,
  });

  return response.data;
}

export async function signIn(input: SignInInput) {
  const response = await apiRequest<AuthUserPayload>("/auth/signin", {
    method: "POST",
    body: input,
  });

  return response.data;
}

export async function verifyOtp(input: VerifyOtpInput) {
  const response = await apiRequest<AuthUserPayload>("/auth/verify-otp", {
    method: "POST",
    body: input,
  });

  return response.data;
}

export async function resendOtp(input: ResendOtpInput) {
  const response = await apiRequest<ResendOtpPayload>("/auth/resend-otp", {
    method: "POST",
    body: input,
  });

  return response.data;
}

export async function logout() {
  const response = await apiRequest<null>("/auth/logout", {
    method: "POST",
  });

  return response.data;
}

export async function getMe() {
  const response = await apiRequest<AuthUserPayload>("/auth/me");
  return response.data.user;
}

export async function getAdminUsers(input: AdminUsersQueryInput = {}) {
  const searchParams = new URLSearchParams();

  if (input.search?.trim()) {
    searchParams.set("search", input.search.trim());
  }

  if (input.role && input.role !== "ALL") {
    searchParams.set("role", input.role);
  }

  if (input.verification && input.verification !== "ALL") {
    searchParams.set("verification", input.verification);
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<AdminUserManagementItem[]>(
    `/auth/users${suffix ? `?${suffix}` : ""}`,
  );

  return response.data;
}

export async function getDashboardMetrics() {
  const response = await apiRequest<DashboardMetrics>("/auth/dashboard-metrics");
  return response.data;
}

export async function startPhoneVerification(input: StartPhoneVerificationInput) {
  const response = await apiRequest<StartPhoneVerificationPayload>("/auth/phone/start", {
    method: "POST",
    body: input,
  });

  return response.data;
}

export async function verifyPhone(input: VerifyPhoneInput) {
  const response = await apiRequest<AuthUserPayload>("/auth/phone/verify", {
    method: "POST",
    body: input,
  });

  return response.data;
}

export async function updateProfile(input: UpdateProfileInput) {
  const response = await apiRequest<AuthUserPayload>("/auth/profile", {
    method: "PATCH",
    body: input,
  });

  return response.data;
}

export async function updatePassword(input: UpdatePasswordInput) {
  const response = await apiRequest<PasswordUpdatePayload>("/auth/password", {
    method: "PATCH",
    body: input,
  });

  return response.data;
}
