"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, LogOut, ShieldCheck } from "lucide-react";
import { useLogoutMutation } from "@/hooks/use-auth";
import { ApiError } from "@/lib/http";
import type { RoleConfig } from "./dashboard-config";

type DashboardTopbarProps = {
  config: RoleConfig;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardTopbar({ config }: DashboardTopbarProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const logoutMutation = useLogoutMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  function handleLogout() {
    if (logoutMutation.isPending) {
      return;
    }

    setIsMenuOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace("/sign-in");
        router.refresh();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/sign-in");
          router.refresh();
          return;
        }

        router.replace("/sign-in");
        router.refresh();
      },
    });
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur md:left-64">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-end gap-4 px-4 sm:px-6 lg:px-8">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:bg-muted"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {getInitials(config.profileName)}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-[180px] truncate text-sm font-semibold text-foreground">
                {config.profileName}
              </span>
              <span className="block text-xs text-muted-foreground">
                {config.profileRole}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-xl border border-border bg-background p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {config.profileName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {config.profileRole}
              </p>
            </div>

            <div className="mt-2 space-y-1">
              <Link
                href="/terms"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                Terms
              </Link>

              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
