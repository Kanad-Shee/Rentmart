'use client';

import { useLogoutMutation } from '@/hooks/use-auth';
import { ApiError } from '@/lib/http';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function LogoutPage() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace('/sign-in');
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace('/sign-in');
          return;
        }

        toast.error("We couldn't sign you out cleanly.");
        router.replace('/dashboard');
      }
    });
  }, [logoutMutation, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9faf6] px-6">
      <p className="text-sm text-[#5e6661]">Signing you out...</p>
    </main>
  );
}
