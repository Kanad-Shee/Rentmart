import type { ReactNode } from "react";
import { requireGuest } from "@/lib/user";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireGuest();
  return children;
}
