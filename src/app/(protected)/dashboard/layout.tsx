import { DashboardShell } from '@/components/features/dashboard/dashboard-shell';
import { requireUser } from '@/lib/user';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

