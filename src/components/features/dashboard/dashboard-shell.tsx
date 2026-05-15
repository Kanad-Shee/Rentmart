import type { ReactNode } from "react";
import type { User } from "@/lib/auth";
import { getRoleConfigForUser } from "./dashboard-config";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

type DashboardShellProps = {
  user: User;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const { config } = getRoleConfigForUser(user);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar config={config} />
      <DashboardTopbar config={config} />
      <main className="pt-16 md:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
