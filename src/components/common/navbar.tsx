'use client';

import { useCurrentUserQuery, useLogoutMutation } from '@/hooks/use-auth';
import { ApiError } from '@/lib/http';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type NavbarLink = {
  href: string;
  label: string;
  active?: boolean;
};

type NavbarAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
  hideOnMobile?: boolean;
};

type UserRole = 'ADMIN' | 'OWNER' | 'RENTER';

type NavbarProps = {
  brand: string;
  brandHref?: string;
  links?: NavbarLink[];
  actions?: NavbarAction[];
  authState?: 'guest' | 'authenticated';
  authActions?: {
    signIn?: {
      href: string;
      label?: string;
    };
    signUp?: {
      href: string;
      label?: string;
    };
    dashboard?: {
      href: string;
      label?: string;
    };
    settings?: {
      href: string;
      label?: string;
    };
  };
  search?: {
    placeholder: string;
    ariaLabel?: string;
  };
  className?: string;
  containerClassName?: string;
  brandClassName?: string;
  linksClassName?: string;
  linkClassName?: string;
  actionClassName?: string;
};

function resolveHref(href: string | undefined, fallbackHref: string) {
  if (!href || href === '#') {
    return fallbackHref;
  }

  return href;
}

function getUserInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoleLabel(role: 'ADMIN' | 'OWNER' | 'RENTER') {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function getRoleAwarePrimaryAction(role: UserRole): NavbarAction {
  switch (role) {
    case 'RENTER':
      return {
        href: '/dashboard/bookings',
        label: 'My Bookings',
        variant: 'primary'
      };
    case 'ADMIN':
      return {
        href: '/dashboard/overview',
        label: 'Admin Panel',
        variant: 'primary'
      };
    case 'OWNER':
    default:
      return {
        href: '/dashboard/add-listing',
        label: 'List Equipment',
        variant: 'primary'
      };
  }
}

export function Navbar({
  brand,
  brandHref = '/',
  links = [],
  actions = [],
  authState = 'guest',
  authActions,
  search,
  className = '',
  containerClassName = '',
  brandClassName = '',
  linksClassName = '',
  linkClassName = '',
  actionClassName = ''
}: NavbarProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const currentUser = currentUserQuery.data;
  const isAuthenticated = Boolean(currentUser);
  const shouldShowGuestActions =
    !isAuthenticated &&
    (currentUserQuery.isError ||
      (!currentUserQuery.isPending && authState === 'guest'));

  const signInHref = resolveHref(authActions?.signIn?.href, '/sign-in');
  const signUpHref = resolveHref(authActions?.signUp?.href, '/sign-up');
  const dashboardHref = resolveHref(
    authActions?.dashboard?.href,
    '/dashboard/overview'
  );
  const settingsHref = resolveHref(
    authActions?.settings?.href,
    '/dashboard/settings'
  );
  const resolvedLinks = useMemo(() => {
    const hasTermsLink = links.some(
      (link) =>
        link.href === '/terms' || link.label.trim().toLowerCase() === 'terms'
    );

    if (hasTermsLink) {
      return links;
    }

    const trustSafetyIndex = links.findIndex(
      (link) => link.label.trim().toLowerCase() === 'trust & safety'
    );

    if (trustSafetyIndex >= 0) {
      return [
        ...links.slice(0, trustSafetyIndex + 1),
        { href: '/terms', label: 'Terms' },
        ...links.slice(trustSafetyIndex + 1)
      ];
    }

    return [...links, { href: '/terms', label: 'Terms' }];
  }, [links]);
  const resolvedActions =
    isAuthenticated && currentUser
      ? actions.map((action) =>
          action.variant === 'primary'
            ? {
                ...action,
                ...getRoleAwarePrimaryAction(currentUser.role),
                hideOnMobile: action.hideOnMobile
              }
            : action
        )
      : actions;
  const mobileResolvedActions = resolvedActions.filter(
    (action) => !action.hideOnMobile
  );
  const hasMobileMenuContent =
    resolvedLinks.length > 0 ||
    mobileResolvedActions.length > 0 ||
    shouldShowGuestActions ||
    isAuthenticated;

  useEffect(() => {
    if (!isProfileMenuOpen && !isNavMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!dropdownRef.current?.contains(target)) {
        setIsProfileMenuOpen(false);
      }

      if (!navMenuRef.current?.contains(target)) {
        setIsNavMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNavMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNavMenuOpen, isProfileMenuOpen]);

  function handleLogout() {
    if (logoutMutation.isPending) {
      return;
    }

    setIsProfileMenuOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.replace('/sign-in');
        router.refresh();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          window.location.replace('/sign-in');
          router.refresh();
          return;
        }

        router.replace('/sign-in');
        router.refresh();
      }
    });
  }

  return (
    <motion.header
      className={[
        'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur',
        className
      ].join(' ')}
      initial={{ y: shouldReduceMotion ? 0 : -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: 'easeOut' }}>
      <div
        className={[
          'mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8',
          containerClassName
        ].join(' ')}>
        <div className="flex items-center gap-4 lg:gap-10">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.01 }}
            transition={{ duration: 0.2 }}>
            <Link
              prefetch
              href={brandHref}
              className={[
                'flex items-center text-primary',
                brandClassName
              ].join(' ')}>
              <Image
                src="/rentmart-logo.webp"
                alt={`${brand} logo`}
                width={144}
                height={48}
                priority
                className="h-10 md:h-8 w-auto shrink-0"
              />
              <span className="hidden pl-3 text-xl font-brand font-black md:inline md:text-2xl">
                {brand}
              </span>
            </Link>
          </motion.div>

          {resolvedLinks.length > 0 ? (
            <nav
              className={[
                'hidden items-center gap-6 lg:flex lg:gap-8',
                linksClassName
              ].join(' ')}>
              {resolvedLinks.map((link: NavbarLink, index: number) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.3,
                    delay: shouldReduceMotion ? 0 : 0.08 + index * 0.04
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -1 }}>
                  <Link
                    prefetch
                    href={link.href}
                    className={[
                      'text-sm font-display font-medium transition-colors hover:text-primary',
                      link.active
                        ? 'border-b-2 border-primary pb-1 text-primary'
                        : 'text-muted-foreground',
                      linkClassName
                    ].join(' ')}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {hasMobileMenuContent ? (
            <div
              ref={navMenuRef}
              className="relative lg:hidden">
              <motion.button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isNavMenuOpen}
                aria-label="Open navigation menu"
                onClick={() => setIsNavMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
                <Menu className="h-4 w-4 text-primary" />
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
                    className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 rounded-xl border border-border bg-background p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                    {isAuthenticated && currentUser ? (
                      <div className="border-b border-border px-3 py-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {currentUser.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    ) : null}

                    <div className="space-y-1">
                      {resolvedLinks.map((link: NavbarLink) => (
                        <Link
                          prefetch
                          key={link.label}
                          href={link.href}
                          onClick={() => setIsNavMenuOpen(false)}
                          className={[
                            'flex rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary',
                            link.active
                              ? 'bg-muted text-primary'
                              : 'text-foreground'
                          ].join(' ')}>
                          {link.label}
                        </Link>
                      ))}

                      {mobileResolvedActions.map((action) => (
                        <Link
                          prefetch
                          key={action.label}
                          href={action.href}
                          onClick={() => setIsNavMenuOpen(false)}
                          className={[
                            'flex rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary'
                          ].join(' ')}>
                          {action.label}
                        </Link>
                      ))}

                      {shouldShowGuestActions ? (
                        <>
                          <Link
                            prefetch
                            href={signInHref}
                            onClick={() => setIsNavMenuOpen(false)}
                            className="flex rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary">
                            {authActions?.signIn?.label ?? 'Login'}
                          </Link>

                          <Link
                            prefetch
                            href={signUpHref}
                            onClick={() => setIsNavMenuOpen(false)}
                            className="flex rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                            {authActions?.signUp?.label ?? 'Sign Up'}
                          </Link>
                        </>
                      ) : null}

                      {isAuthenticated ? (
                        <>
                          <div className="my-1 border-t border-border" />

                          <Link
                            prefetch
                            href={dashboardHref}
                            onClick={() => setIsNavMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                            <LayoutDashboard className="h-4 w-4" />
                            {authActions?.dashboard?.label ?? 'Dashboard'}
                          </Link>

                          <Link
                            prefetch
                            href={settingsHref}
                            onClick={() => setIsNavMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                            <Settings className="h-4 w-4" />
                            {authActions?.settings?.label ?? 'Settings'}
                          </Link>

                          <Link
                            prefetch
                            href="/terms"
                            onClick={() => setIsNavMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Terms
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setIsNavMenuOpen(false);
                              handleLogout();
                            }}
                            disabled={logoutMutation.isPending}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">
                            <LogOut className="h-4 w-4" />
                            {logoutMutation.isPending
                              ? 'Logging out...'
                              : 'Logout'}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}

          {search ? (
            <label className="hidden h-10 w-[220px] items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground lg:flex">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="search"
                placeholder={search.placeholder}
                aria-label={search.ariaLabel ?? search.placeholder}
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground/70"
              />
            </label>
          ) : null}

          {resolvedActions.map((action) => (
            <motion.div
              key={action.label}
              whileHover={shouldReduceMotion ? undefined : { y: -1.5 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.18 }}>
              <Link
                prefetch
                href={action.href}
                className={[
                  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                  action.variant === 'primary'
                    ? 'bg-linear-to-b from-primary/85 via-primary/90 to-primary/95 text-primary-foreground hover:bg-[#274e3d]'
                    : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                  'hidden lg:inline-flex',
                  actionClassName
                ].join(' ')}>
                {action.label}
              </Link>
            </motion.div>
          ))}

          {shouldShowGuestActions ? (
            <>
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                transition={{ duration: 0.18 }}>
                <Link
                  prefetch
                  href={signInHref}
                  className={[
                    'hidden rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex',
                    actionClassName
                  ].join(' ')}>
                  {authActions?.signIn?.label ?? 'Login'}
                </Link>
              </motion.div>

              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -1.5 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.18 }}>
                <Link
                  prefetch
                  href={signUpHref}
                  className={[
                    'hidden lg:inline-flex items-center justify-center rounded-md bg-linear-to-b from-primary/85 via-primary/90 to-primary/95 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]',
                    actionClassName
                  ].join(' ')}>
                  {authActions?.signUp?.label ?? 'Sign Up'}
                </Link>
              </motion.div>
            </>
          ) : null}

          {isAuthenticated && currentUser ? (
            <div
              ref={dropdownRef}
              className="relative hidden lg:block">
              <motion.button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:bg-muted"
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {getUserInitials(currentUser.fullName)}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block max-w-[120px] truncate text-sm font-semibold text-foreground">
                    {currentUser.fullName}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </span>
                <motion.span
                  animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {isProfileMenuOpen ? (
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
                        {currentUser.fullName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>

                    <div className="mt-2 space-y-1">
                      <Link
                        prefetch
                        href={dashboardHref}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                        <LayoutDashboard className="h-4 w-4" />
                        {authActions?.dashboard?.label ?? 'Dashboard'}
                      </Link>

                      <Link
                        prefetch
                        href={settingsHref}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                        <Settings className="h-4 w-4" />
                        {authActions?.settings?.label ?? 'Settings'}
                      </Link>

                      <Link
                        prefetch
                        href="/terms"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary">
                        <ShieldCheck className="h-4 w-4" />
                        Terms
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">
                        <LogOut className="h-4 w-4" />
                        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}
