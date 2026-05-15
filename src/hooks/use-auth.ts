"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AdminUsersQueryInput,
  authQueryKeys,
  getAdminUsers,
  getDashboardMetrics,
  getMe,
  logout,
  resendOtp,
  signIn,
  signUp,
  startPhoneVerification,
  verifyOtp,
  verifyPhone,
  updatePassword,
  updateProfile,
  type ResendOtpInput,
  type SignInInput,
  type SignUpInput,
  type StartPhoneVerificationInput,
  type UpdatePasswordInput,
  type UpdateProfileInput,
  type VerifyOtpInput,
  type VerifyPhoneInput,
} from "@/lib/auth";

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: getMe,
    retry: false,
  });
}

export function useAdminUsersQuery(input: AdminUsersQueryInput, enabled = true) {
  return useQuery({
    queryKey: authQueryKeys.adminUsers(input),
    queryFn: () => getAdminUsers(input),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useDashboardMetricsQuery(enabled = true) {
  return useQuery({
    queryKey: authQueryKeys.dashboardMetrics,
    queryFn: getDashboardMetrics,
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInInput) => signIn(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (input: SignUpInput) => signUp(input),
  });
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyOtpInput) => verifyOtp(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (input: ResendOtpInput) => resendOtp(input),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
    },
  });
}

export function useStartPhoneVerificationMutation() {
  return useMutation({
    mutationFn: (input: StartPhoneVerificationInput) =>
      startPhoneVerification(input),
  });
}

export function useVerifyPhoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyPhoneInput) => verifyPhone(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (input: UpdatePasswordInput) => updatePassword(input),
  });
}
