'use client';

import type { RoleConfig } from './dashboard-config';
import { useLogoutMutation } from '@/hooks/use-auth';
import { ApiError } from '@/lib/http';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FilePlus2,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  Wrench
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type DashboardTopbarProps = {
  config: RoleConfig;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const mobileIconMap = {
  barChart3: BarChart3,
  bell: Bell,
  calendarDays: CalendarDays,
  clipboardList: ClipboardList,
  filePlus2: FilePlus2,
  heart: Heart,
  layoutDashboard: LayoutDashboard,
  logOut: LogOut,
  messagesSquare: MessagesSquare,
  receiptText: ReceiptText,
  settings: Settings,
  shieldCheck: ShieldCheck,
  users: Users,
  wrench: Wrench
};

export function DashboardTopbar({ config }: DashboardTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);
  const logoutMutation = useLogoutMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const mobileNavItems = config.sidebar.flatMap((section) =>
    section.items.filter((item) => item.href !== '/logout')
  );

  useEffect(() => {
    if (!isMenuOpen && !isNavMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!dropdownRef.current?.contains(target)) {
        setIsMenuOpen(false);
      }

      if (!navMenuRef.current?.contains(target)) {
        setIsNavMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsNavMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, isNavMenuOpen]);

  function handleLogout() {
    if (logoutMutation.isPending) {
      return;
    }

    setIsMenuOpen(false);
    setIsNavMenuOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace('/sign-in');
        router.refresh();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace('/sign-in');
          router.refresh();
          return;
        }

        router.replace('/sign-in');
        router.refresh();
      }
    });
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur lg:left-64">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:justify-end lg:px-8">
        <div
          ref={navMenuRef}
          className="relative lg:hidden">
          <motion.button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isNavMenuOpen}
            onClick={() => setIsNavMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
            <Menu className="h-4 w-4 text-primary" />
            Menu
            <motion.span
              animate={{ rotate: isNavMenuOpen ? 180 : 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {isNavMenuOpen ? (
              <motion.div
                initial={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : -8,
                  scale: shouldReduceMotion ? 1 : 0.98
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : -6,
                  scale: shouldReduceMotion ? 1 : 0.985
                }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-border bg-background p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    Dashboard
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.profileRole}
                  </p>
                </div>

              <div className="mt-2 space-y-1">
                {mobileNavItems.map((item) => {
                  const Icon = mobileIconMap[item.icon];
                  const isActive = pathname === item.href;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : -6
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.2,
                        delay: shouldReduceMotion ? 0 : 0.06 + mobileNavItems.indexOf(item) * 0.04
                      }}>
                      <Link
                        prefetch
                        href={item.href}
                        onClick={() => setIsNavMenuOpen(false)}
                        className={[
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-muted text-primary'
                            : 'text-foreground hover:bg-muted hover:text-primary'
                        ].join(' ')}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          ref={dropdownRef}
          className="relative">
          <motion.button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:bg-muted"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}>
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
            <motion.span
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {isMenuOpen ? (
              <motion.div
                initial={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : -8,
                  scale: shouldReduceMotion ? 1 : 0.98
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : -6,
                  scale: shouldReduceMotion ? 1 : 0.985
                }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                className="absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-xl border border-border bg-background p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {config.profileName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {config.profileRole}
                  </p>
                </div>

                <div className="mt-2 space-y-1">
                  <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.2,
                      delay: shouldReduceMotion ? 0 : 0.06
                    }}>
                    <Link
                      prefetch
                      href="/dashboard/overview"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary lg:hidden">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard Home
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.2,
                      delay: shouldReduceMotion ? 0 : 0.1
                    }}>
                    <Link
                      prefetch
                      href="/terms"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                      <ShieldCheck className="h-4 w-4" />
                      Terms
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.2,
                      delay: shouldReduceMotion ? 0 : 0.14
                    }}>
                    <Link
                      prefetch
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                      <Home className="h-4 w-4" />
                      Back to Home
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.2,
                      delay: shouldReduceMotion ? 0 : 0.18
                    }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">
                      <LogOut className="h-4 w-4" />
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
