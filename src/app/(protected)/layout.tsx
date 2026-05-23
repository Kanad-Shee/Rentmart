import { requireUser } from '@/lib/user';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireUser();
  return children;
}
