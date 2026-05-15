"use client";

import Link from "next/link";
import { useCurrentUserQuery } from "@/hooks/use-auth";

export function HomepageRoleCtaActions() {
  const currentUserQuery = useCurrentUserQuery();
  const user = currentUserQuery.data;

  if (!user) {
    return null;
  }

  if (user.role === "RENTER") {
    return (
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center justify-center rounded-md bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f3f4f1]"
      >
        View Your Bookings
      </Link>
    );
  }

  if (user.role === "OWNER") {
    return (
      <Link
        href="/dashboard/equipment"
        className="inline-flex items-center justify-center rounded-md bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f3f4f1]"
      >
        View Your Listings
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/overview"
      className="inline-flex items-center justify-center rounded-md bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f3f4f1]"
    >
      Open Dashboard
    </Link>
  );
}
