"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  LoaderCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useMyNotificationsQuery,
} from "@/hooks/use-notification";
import type { NotificationItem } from "@/lib/notification";
import { ApiError } from "@/lib/http";
import { getDashboardRevealProps } from "./dashboard-motion";

type NotificationSectionKey = "today" | "yesterday" | "earlier";

type NotificationsContentProps = {
  profileRole: string;
};

function NotificationSectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
      <span className="h-px flex-1 bg-border" />
    </h2>
  );
}

function getNotificationPresentation(item: NotificationItem) {
  switch (item.type) {
    case "EQUIPMENT_APPROVED":
      return {
        icon: CheckCircle2,
        iconClassName: "text-emerald-600",
        cardClassName: item.isRead
          ? "border-border bg-background"
          : "bg-[#f0fdf4] border-emerald-100",
        accentClassName: "bg-emerald-500",
      };
    case "EQUIPMENT_REJECTED":
      return {
        icon: AlertTriangle,
        iconClassName: "text-amber-600",
        cardClassName: item.isRead
          ? "border-border bg-background"
          : "bg-[#fff7ed] border-amber-200",
        accentClassName: "bg-amber-500",
      };
    case "BOOKING_REQUEST_RECEIVED":
      return {
        icon: CalendarCheck2,
        iconClassName: "text-blue-600",
        cardClassName: item.isRead
          ? "border-border bg-background"
          : "bg-[#eff6ff] border-blue-100",
        accentClassName: "bg-blue-500",
      };
    default:
      return {
        icon: Bell,
        iconClassName: "text-slate-600",
        cardClassName: item.isRead
          ? "border-border bg-background"
          : "bg-[#f8fafc] border-slate-200",
        accentClassName: "bg-slate-500",
      };
  }
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getSectionKey(value: string): NotificationSectionKey {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "earlier";
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfNotificationDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffInDays = Math.floor(
    (startOfToday.getTime() - startOfNotificationDay.getTime()) /
      (24 * 60 * 60 * 1000),
  );

  if (diffInDays <= 0) {
    return "today";
  }

  if (diffInDays === 1) {
    return "yesterday";
  }

  return "earlier";
}

function getThisWeekCount(items: NotificationItem[]) {
  const now = Date.now();
  const weekInMs = 7 * 24 * 60 * 60 * 1000;

  return items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return !Number.isNaN(createdAt) && now - createdAt <= weekInMs;
  }).length;
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background px-8 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Bell className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-primary">
        No updates yet
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        Listing moderation alerts and booking request updates will appear here with direct actions into the right dashboard workspace.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
      <div className="flex items-center gap-3 text-[#7a120c]">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-xl font-semibold tracking-[-0.03em]">
          We couldn&apos;t load your notifications
        </h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]">
        {message}
      </p>
    </div>
  );
}

function SkeletonState() {
  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6 animate-pulse">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-xl border border-border bg-background p-6">
            <div className="flex items-start gap-5">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-6 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                </div>
                <div className="mt-3 h-5 w-full rounded bg-muted" />
                <div className="mt-2 h-5 w-5/6 rounded bg-muted" />
                <div className="mt-4 h-10 w-36 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-6 animate-pulse">
        <div className="rounded-xl border border-border bg-[#f3f4f1] p-6">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="mt-6 h-24 rounded bg-muted" />
          <div className="mt-4 h-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function NotificationCardRow({
  item,
  index = 0,
}: {
  item: NotificationItem;
  index?: number;
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const presentation = getNotificationPresentation(item);
  const Icon = presentation.icon;
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const isMarkingAsRead =
    markAsReadMutation.isPending &&
    markAsReadMutation.variables === item.id;

  return (
    <motion.div
      {...getDashboardRevealProps(shouldReduceMotion, index)}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -3, transition: { duration: 0.18 } }
      }
      className={[
        "relative flex items-start gap-5 border p-6 transition-shadow hover:shadow-md",
        presentation.cardClassName,
      ].join(" ")}
    >
      {!item.isRead ? (
        <div
          className={[
            "absolute left-2 top-1/2 h-12 w-1 -translate-y-1/2 rounded-full",
            presentation.accentClassName,
          ].join(" ")}
        />
      ) : null}

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-white">
        <Icon className={["h-5 w-5", presentation.iconClassName].join(" ")} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-primary">
            {item.title}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatTimestamp(item.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          {item.message}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {item.actionLabel && item.actionHref ? (
            <Link
              href={item.actionHref}
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]"
            >
              {item.actionLabel}
            </Link>
          ) : null}

          {!item.isRead ? (
            <button
              type="button"
              onClick={() => markAsReadMutation.mutate(item.id)}
              disabled={isMarkingAsRead}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMarkingAsRead ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Marking...
                </>
              ) : (
                "Mark as read"
              )}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationsContent({ profileRole }: NotificationsContentProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const notificationsQuery = useMyNotificationsQuery();
  const markAllMutation = useMarkAllNotificationsAsReadMutation();

  if (notificationsQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
                  {profileRole}
                </p>
                <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-primary sm:text-5xl">
                  Notifications
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Track listing and booking updates from one shared inbox.
            </p>
          </div>
        </div>
        <SkeletonState />
      </div>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
                  {profileRole}
                </p>
                <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-primary sm:text-5xl">
                  Notifications
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Track listing and booking updates from one shared inbox.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <ErrorState
            message={
              notificationsQuery.error instanceof ApiError
                ? notificationsQuery.error.message
                : "Try refreshing this page in a moment."
            }
          />
        </div>
      </div>
    );
  }

  const notifications = notificationsQuery.data;
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const thisWeekCount = getThisWeekCount(notifications);
  const approvedCount = notifications.filter(
    (item) => item.type === "EQUIPMENT_APPROVED",
  ).length;
  const rejectedCount = notifications.filter(
    (item) => item.type === "EQUIPMENT_REJECTED",
  ).length;
  const bookingRequestCount = notifications.filter(
    (item) => item.type === "BOOKING_REQUEST_RECEIVED",
  ).length;
  const sections: Record<NotificationSectionKey, NotificationItem[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  for (const item of notifications) {
    sections[getSectionKey(item.createdAt)].push(item);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
                {profileRole}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-primary sm:text-5xl">
                Notifications
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            Track listing moderation and booking request updates from one shared inbox.
          </p>
        </div>

        <button
          type="button"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || unreadCount === 0}
          className="inline-flex items-center gap-2 self-start rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {markAllMutation.isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Marking...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Mark all as read
            </>
          )}
        </button>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-12">
          {notifications.length === 0 ? <EmptyState /> : null}

          {sections.today.length > 0 ? (
            <section>
              <NotificationSectionTitle>Today</NotificationSectionTitle>
              <div className="space-y-3">
                {sections.today.map((item, index) => (
                  <NotificationCardRow key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          {sections.yesterday.length > 0 ? (
            <section>
              <NotificationSectionTitle>Yesterday</NotificationSectionTitle>
              <div className="space-y-3">
                {sections.yesterday.map((item, index) => (
                  <NotificationCardRow key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          {sections.earlier.length > 0 ? (
            <section>
              <NotificationSectionTitle>Earlier</NotificationSectionTitle>
              <div className="space-y-3">
                {sections.earlier.map((item, index) => (
                  <NotificationCardRow key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-[#f3f4f1] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  Inbox Summary
                </h2>
              </div>
              <Clock3 className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Unread
                </p>
                <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-primary">
                  {unreadCount}
                </p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  This Week
                </p>
                <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-primary">
                  {thisWeekCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Moderation Alerts
            </h3>
            <div className="mt-5 space-y-4">
              {[
                {
                  title: "Listings approved",
                  text: `${approvedCount} listing${approvedCount === 1 ? "" : "s"} published live.`,
                  icon: CheckCircle2,
                },
                {
                  title: "Changes requested",
                  text: `${rejectedCount} listing${rejectedCount === 1 ? "" : "s"} need updates.`,
                  icon: ShieldAlert,
                },
                {
                  title: "Booking requests",
                  text: `${bookingRequestCount} rental request${bookingRequestCount === 1 ? "" : "s"} reached your inbox.`,
                  icon: CalendarCheck2,
                },
                {
                  title: "Pending attention",
                  text: `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"} in your inbox.`,
                  icon: FileCheck2,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    {...getDashboardRevealProps(shouldReduceMotion, index)}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
