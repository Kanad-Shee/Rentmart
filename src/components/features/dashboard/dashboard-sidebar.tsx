"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  FilePlus2,
  Heart,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useLogoutMutation } from "@/hooks/use-auth";
import {
  useMyBookingsQuery,
  useOwnerBookingsQuery,
} from "@/hooks/use-bookings";
import { usePendingEquipmentQuery } from "@/hooks/use-equipment";
import { useMyNotificationsQuery } from "@/hooks/use-notification";
import { ApiError } from "@/lib/http";
import type { RoleConfig, SidebarIcon } from "./dashboard-config";

const iconMap: Record<SidebarIcon, typeof LayoutDashboard> = {
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
  wrench: Wrench,
};

type DashboardSidebarProps = {
  config: RoleConfig;
};

export function DashboardSidebar({ config }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const logoutMutation = useLogoutMutation();
  const shouldLoadVerificationCount = config.sidebar.some((section) =>
    section.items.some((item) => item.href === "/dashboard/verifications"),
  );
  const shouldLoadOwnerBookingCount = config.sidebar.some((section) =>
    section.items.some((item) => item.href === "/dashboard/rental-requests"),
  );
  const shouldLoadNotifications = config.sidebar.some((section) =>
    section.items.some((item) => item.href === "/dashboard/notifications"),
  );
  const shouldLoadRenterBookingCount = config.sidebar.some((section) =>
    section.items.some((item) => item.href === "/dashboard/bookings"),
  );
  const pendingEquipmentQuery = usePendingEquipmentQuery(
    shouldLoadVerificationCount,
  );
  const ownerBookingsQuery = useOwnerBookingsQuery(shouldLoadOwnerBookingCount);
  const renterBookingsQuery = useMyBookingsQuery(shouldLoadRenterBookingCount);
  const notificationsQuery = useMyNotificationsQuery(shouldLoadNotifications);

  function getBadgeValue(href: string, fallbackBadge?: string) {
    if (href === "/dashboard/verifications") {
      return pendingEquipmentQuery.data
        ? String(pendingEquipmentQuery.data.length)
        : undefined;
    }

    if (href === "/dashboard/rental-requests" && shouldLoadOwnerBookingCount) {
      if (!ownerBookingsQuery.data) {
        return undefined;
      }

      const pendingCount = ownerBookingsQuery.data.filter(
        (booking) => booking.status === "PENDING_OWNER_APPROVAL",
      ).length;

      return pendingCount > 0 ? String(pendingCount) : undefined;
    }

    if (href === "/dashboard/bookings" && shouldLoadRenterBookingCount) {
      if (!renterBookingsQuery.data) {
        return undefined;
      }

      const actionCount = renterBookingsQuery.data.filter(
        (booking) =>
          booking.status === "PENDING_OWNER_APPROVAL" ||
          booking.status === "PENDING_RENTER_PAYMENT",
      ).length;

      return actionCount > 0 ? String(actionCount) : undefined;
    }

    if (href === "/dashboard/notifications" && shouldLoadNotifications) {
      if (!notificationsQuery.data) {
        return undefined;
      }

      const unreadCount = notificationsQuery.data.filter(
        (item) => !item.isRead,
      ).length;

      return unreadCount > 0 ? String(unreadCount) : undefined;
    }

    return fallbackBadge;
  }

  function handleLogout() {
    if (logoutMutation.isPending) {
      return;
    }

    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.replace("/sign-in");
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          window.location.replace("/sign-in");
          return;
        }

        router.replace("/dashboard/overview");
      },
    });
  }

  return (
    <motion.aside
      className='fixed inset-y-0 left-0 hidden min-h-0 w-64 overflow-hidden border-r border-border bg-muted/40 md:flex md:flex-col'
      initial={{
        opacity: 0,
        x: shouldReduceMotion ? 0 : -24,
      }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
    >
      <motion.div
        className='pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(165,208,185,0.2),transparent_68%)]'
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: [0.65, 0.9, 0.65], scale: [1, 1.04, 1] }
        }
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className='relative px-6 py-8'
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.35,
          delay: shouldReduceMotion ? 0 : 0.08,
        }}
      >
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.01 }}
          transition={{ duration: 0.18 }}
        >
          <Link
            href='/'
            className='text-2xl font-brand font-black uppercase text-primary'
          >
            {config.brand}
          </Link>
        </motion.div>
        <p className='mt-2 text-sm uppercase tracking-[0.24em] text-muted-foreground'>
          {config.subtitle}
        </p>
      </motion.div>

      <nav className='relative flex-1 overflow-y-auto px-4 pb-4'>
        <motion.div
          className='space-y-1'
          initial='hidden'
          animate='show'
          variants={{
            hidden: {},
            show: {
              transition: shouldReduceMotion
                ? undefined
                : { staggerChildren: 0.05, delayChildren: 0.12 },
            },
          }}
        >
          {config.sidebar.map((section, sectionIndex) => (
            <motion.div
              key={section.title ?? sectionIndex}
              className={sectionIndex > 0 ? "mt-6" : ""}
              variants={{
                hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            >
              {section.title ? (
                <motion.p
                  className='px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground'
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                >
                  {section.title}
                </motion.p>
              ) : null}
              <div className='space-y-1'>
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = pathname === item.href;
                  const isLogoutItem = item.href === "/logout";
                  const badgeValue = getBadgeValue(item.href, item.badge);
                  const itemClassName = [
                    "relative flex items-center gap-3 overflow-hidden rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-500/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-primary",
                  ].join(" ");

                  if (isLogoutItem) {
                    return (
                      <motion.button
                        key={item.label}
                        type='button'
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className={`${itemClassName} w-full text-left disabled:cursor-not-allowed disabled:opacity-60`}
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : {
                                x: 4,
                                backgroundColor: "rgba(255,255,255,0.72)",
                              }
                        }
                        whileTap={
                          shouldReduceMotion ? undefined : { scale: 0.99 }
                        }
                        transition={{ duration: 0.18 }}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId='dashboard-sidebar-active-pill'
                            className='absolute inset-y-1 left-0 w-1 rounded-full bg-primary'
                          />
                        ) : null}
                        <motion.span
                          animate={isActive ? { scale: 1.04 } : { scale: 1 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Icon className='h-4 w-4 shrink-0' />
                        </motion.span>
                        <span className='flex-1'>
                          {logoutMutation.isPending
                            ? "Logging out..."
                            : item.label}
                        </span>
                      </motion.button>
                    );
                  }

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.26 }}
                      whileHover={shouldReduceMotion ? undefined : { x: 4 }}
                    >
                      <Link href={item.href} className={itemClassName}>
                        {isActive ? (
                          <motion.span
                            layoutId='dashboard-sidebar-active-pill'
                            className='absolute inset-y-1 left-0 w-1 rounded-full bg-primary'
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        ) : null}
                        <motion.span
                          animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Icon className='h-4 w-4 shrink-0' />
                        </motion.span>
                        <span className='flex-1'>{item.label}</span>
                        {badgeValue !== undefined ? (
                          <motion.span
                            className='rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] text-primary'
                            initial={{
                              opacity: 0,
                              scale: shouldReduceMotion ? 1 : 0.9,
                            }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={
                              shouldReduceMotion ? undefined : { scale: 1.06 }
                            }
                            transition={{
                              duration: shouldReduceMotion ? 0 : 0.2,
                            }}
                          >
                            {badgeValue}
                          </motion.span>
                        ) : null}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </nav>

      <motion.div
        className='mt-auto border-t border-border px-4 py-4'
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.35,
          delay: shouldReduceMotion ? 0 : 0.2,
        }}
      >
        <motion.div
          className='flex items-center gap-3 rounded-xl px-2 py-3'
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  backgroundColor: "rgba(255,255,255,0.55)",
                  y: -2,
                }
          }
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'
            whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
            transition={{ duration: 0.18 }}
          >
            {config.profileName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </motion.div>
          <div>
            <p className='text-sm font-semibold text-foreground'>
              {config.profileName}
            </p>
            <p className='text-xs text-muted-foreground'>
              {config.profileRole}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}
