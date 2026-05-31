'use client';

import { getDashboardRevealProps } from './dashboard-motion';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useDashboardMetricsQuery, useAdminUsersQuery } from '@/hooks/use-auth';
import { useAdminBookingsQuery } from '@/hooks/use-bookings';
import { usePendingEquipmentQuery } from '@/hooks/use-equipment';
import { useAdminSupportQueriesQuery } from '@/hooks/use-support-query';
import type { BookingStatus, BookingSummary } from '@/lib/booking';
import { supportQueryLabels } from '@/lib/support-query';
import {
  ArrowRight,
  BarChart3,
  ChartColumn,
  CircleHelp,
  Loader2,
  ShieldCheck,
  UsersRound,
  Wallet
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts';

function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm  text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-xl h-full border border-border bg-emerald-800/5 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-primary">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
    </article>
  );
}

function ChartCard({
  title,
  description,
  href,
  icon: Icon,
  children
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof BarChart3;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-emerald-950/5 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
              {title}
            </h2>
          </div>
          <p className="mt-3 text-sm  text-muted-foreground">{description}</p>
        </div>
        <Link
          prefetch
          href={href}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-muted">
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function formatNumber(value: number | string) {
  return new Intl.NumberFormat('en-IN').format(Number(value));
}

function createMonthBuckets(monthCount = 6) {
  const now = new Date();
  const buckets = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (monthCount - 1 - index),
      1
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    return {
      key,
      label: date.toLocaleDateString('en-IN', {
        month: 'short'
      })
    };
  });

  return {
    buckets,
    indexMap: new Map(buckets.map((bucket, index) => [bucket.key, index]))
  };
}

function toMonthKey(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isApprovedBookingStatus(status: BookingStatus) {
  return [
    'PENDING_RENTER_PAYMENT',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'DISPUTED'
  ].includes(status);
}

function isDepositResolved(status: BookingSummary['depositRefundStatus']) {
  return status === 'REFUNDED' || status === 'SKIPPED';
}

const paymentChartConfig = {
  captured: {
    label: 'Captured',
    color: 'var(--chart-1)'
  },
  failed: {
    label: 'Failed',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

const bookingFlowConfig = {
  approved: {
    label: 'Approved',
    color: 'var(--chart-1)'
  },
  dropped: {
    label: 'Rejected / Cancelled',
    color: 'var(--chart-3)'
  }
} satisfies ChartConfig;

const settlementConfig = {
  payoutPending: {
    label: 'Owner Payout Pending',
    color: 'var(--chart-1)'
  },
  refundPending: {
    label: 'Deposit Refund Pending',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

const supportConfig = {
  owner: {
    label: 'Owners',
    color: 'var(--chart-1)'
  },
  renter: {
    label: 'Renters',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

const verificationConfig = {
  ready: {
    label: 'Ready / Verified',
    color: 'var(--chart-4)'
  },
  pending: {
    label: 'Pending / Action Required',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

const userMixConfig = {
  owners: {
    label: 'Owners',
    color: 'var(--chart-1)'
  },
  renters: {
    label: 'Renters',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function AdminChartViewContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const metricsQuery = useDashboardMetricsQuery();
  const bookingsQuery = useAdminBookingsQuery();
  const usersQuery = useAdminUsersQuery({});
  const supportQueriesQuery = useAdminSupportQueriesQuery();
  const pendingEquipmentQuery = usePendingEquipmentQuery();

  const metrics = metricsQuery.data;
  const bookings = useMemo(
    () => bookingsQuery.data ?? [],
    [bookingsQuery.data]
  );
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const supportQueries = useMemo(
    () => supportQueriesQuery.data ?? [],
    [supportQueriesQuery.data]
  );
  const pendingListings = useMemo(
    () => pendingEquipmentQuery.data ?? [],
    [pendingEquipmentQuery.data]
  );

  const { buckets, indexMap } = useMemo(() => createMonthBuckets(6), []);

  const paymentTrendData = useMemo(() => {
    const base = buckets.map((bucket) => ({
      month: bucket.label,
      captured: 0,
      failed: 0
    }));

    for (const booking of bookings) {
      if (booking.isPaymentCompleted) {
        const monthKey = toMonthKey(
          booking.paymentCapturedAt ?? booking.updatedAt
        );
        const index = monthKey ? indexMap.get(monthKey) : undefined;

        if (index !== undefined) {
          base[index].captured += 1;
        }
      }

      if (booking.financialStatus === 'PAYMENT_FAILED') {
        const monthKey = toMonthKey(
          booking.paymentFailedAt ?? booking.updatedAt
        );
        const index = monthKey ? indexMap.get(monthKey) : undefined;

        if (index !== undefined) {
          base[index].failed += 1;
        }
      }
    }

    return base;
  }, [bookings, buckets, indexMap]);

  const bookingFlowData = useMemo(() => {
    const base = buckets.map((bucket) => ({
      month: bucket.label,
      approved: 0,
      dropped: 0
    }));

    for (const booking of bookings) {
      const monthKey = toMonthKey(booking.createdAt);
      const index = monthKey ? indexMap.get(monthKey) : undefined;

      if (index === undefined) {
        continue;
      }

      if (isApprovedBookingStatus(booking.status)) {
        base[index].approved += 1;
      }

      if (booking.status === 'CANCELLED') {
        base[index].dropped += 1;
      }
    }

    return base;
  }, [bookings, buckets, indexMap]);

  const settlementQueueData = useMemo(() => {
    const base = buckets.map((bucket) => ({
      month: bucket.label,
      payoutPending: 0,
      refundPending: 0
    }));

    for (const booking of bookings) {
      const monthKey = toMonthKey(
        booking.completedAt ?? booking.disputedAt ?? booking.updatedAt
      );
      const index = monthKey ? indexMap.get(monthKey) : undefined;

      if (index === undefined || !booking.isPaymentCompleted) {
        continue;
      }

      if (
        (booking.status === 'COMPLETED' || booking.status === 'DISPUTED') &&
        booking.ownerPayoutStatus !== 'PAID'
      ) {
        base[index].payoutPending += 1;
      }

      if (
        (booking.status === 'COMPLETED' || booking.status === 'DISPUTED') &&
        !isDepositResolved(booking.depositRefundStatus)
      ) {
        base[index].refundPending += 1;
      }
    }

    return base;
  }, [bookings, buckets, indexMap]);

  const userMixData = useMemo(() => {
    const owners = users.filter((user) => user.role === 'OWNER').length;
    const renters = users.filter((user) => user.role === 'RENTER').length;

    return [
      {
        segment: 'owners',
        label: 'Owners',
        value: owners,
        fill: 'var(--color-owners)'
      },
      {
        segment: 'renters',
        label: 'Renters',
        value: renters,
        fill: 'var(--color-renters)'
      }
    ];
  }, [users]);

  const supportLoadData = useMemo(() => {
    return Object.entries(supportQueryLabels).map(([topic, label]) => {
      const topicQueries = supportQueries.filter(
        (query) => query.topic === topic
      );

      return {
        topic: label,
        owner: topicQueries.filter((query) => query.role === 'OWNER').length,
        renter: topicQueries.filter((query) => query.role === 'RENTER').length
      };
    });
  }, [supportQueries]);

  const verificationPipelineData = useMemo(() => {
    const verifiedUsers = users.filter(
      (user) => user.emailVerified && user.phoneVerified
    ).length;
    const actionRequiredUsers = Math.max(users.length - verifiedUsers, 0);
    const activeListings = metrics?.activeListings ?? 0;

    return [
      {
        category: 'Users',
        ready: verifiedUsers,
        pending: actionRequiredUsers
      },
      {
        category: 'Listings',
        ready: activeListings,
        pending: pendingListings.length
      }
    ];
  }, [metrics?.activeListings, pendingListings.length, users]);

  const summary = useMemo(() => {
    const capturedTotal = paymentTrendData.reduce(
      (sum, item) => sum + item.captured,
      0
    );
    const failedTotal = paymentTrendData.reduce(
      (sum, item) => sum + item.failed,
      0
    );
    const pendingSettlementCount = settlementQueueData.reduce(
      (sum, item) => sum + item.payoutPending + item.refundPending,
      0
    );

    return {
      chartCount: 6,
      capturedTotal,
      failedTotal,
      pendingSettlementCount
    };
  }, [paymentTrendData, settlementQueueData]);

  const isInitialLoading =
    metricsQuery.isPending &&
    bookingsQuery.isPending &&
    usersQuery.isPending &&
    supportQueriesQuery.isPending &&
    pendingEquipmentQuery.isPending;

  const hasDataError =
    metricsQuery.isError ||
    bookingsQuery.isError ||
    usersQuery.isError ||
    supportQueriesQuery.isError ||
    pendingEquipmentQuery.isError;

  return (
    <section className="space-y-8">
      <motion.div {...getDashboardRevealProps(shouldReduceMotion, 0)}>
        <SectionTitle
          eyebrow="Admin Workspace"
          title="Chart View"
          description="A visual command center for bookings, payments, support, verifications, and user mix. The layout stays single column through medium screens and switches to two columns on larger screens."
        />
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            label: 'Chart Sections',
            value: String(summary.chartCount),
            helper: 'Six focused comparison charts for faster admin overview.'
          },
          {
            label: 'Captured vs Failed',
            value: `${summary.capturedTotal} / ${summary.failedTotal}`,
            helper: 'Recent payment outcomes across the latest chart window.'
          },
          {
            label: 'Pending Settlements',
            value: String(summary.pendingSettlementCount),
            helper:
              'Owner payouts and deposit refunds still waiting for action.'
          }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            {...getDashboardRevealProps(shouldReduceMotion, index + 1)}>
            <StatCard
              label={item.label}
              value={item.value}
              helper={item.helper}
            />
          </motion.div>
        ))}
      </div>

      {hasDataError ? (
        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-5 text-sm text-[#7a120c]">
          Some chart datasets could not be loaded right now. The available
          charts still reflect the latest successful admin data.
        </div>
      ) : null}

      {isInitialLoading ? (
        <div className="flex min-h-70 items-center justify-center rounded-xl border border-border bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      {!isInitialLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div {...getDashboardRevealProps(shouldReduceMotion, 2)}>
            <ChartCard
              title="Payment Success Trend"
              description="Captured payments against failed payments over the last six months."
              href="/dashboard/transactions"
              icon={Wallet}>
              <ChartContainer
                config={paymentChartConfig}
                className="min-h-[260px]">
                <LineChart
                  accessibilityLayer
                  data={paymentTrendData}
                  margin={{ left: 8, right: 8 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent valueFormatter={formatNumber} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="captured"
                    stroke="var(--color-captured)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-captured)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="var(--color-failed)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-failed)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </ChartCard>
          </motion.div>

          <motion.div {...getDashboardRevealProps(shouldReduceMotion, 3)}>
            <ChartCard
              title="Booking Flow Health"
              description="Approved booking movement compared against rejected or cancelled requests."
              href="/dashboard/transactions"
              icon={ChartColumn}>
              <ChartContainer
                config={bookingFlowConfig}
                className="min-h-[260px]">
                <BarChart
                  accessibilityLayer
                  data={bookingFlowData}
                  margin={{ left: 8, right: 8 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent valueFormatter={formatNumber} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="approved"
                    fill="var(--color-approved)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="dropped"
                    fill="var(--color-dropped)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>
          </motion.div>

          <motion.div {...getDashboardRevealProps(shouldReduceMotion, 4)}>
            <ChartCard
              title="User Mix"
              description="A quick owners vs renters split to keep marketplace balance visible."
              href="/dashboard/users"
              icon={UsersRound}>
              <ChartContainer
                config={userMixConfig}
                className="min-h-[260px]">
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        valueFormatter={formatNumber}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Pie
                    data={userMixData}
                    dataKey="value"
                    nameKey="segment"
                    innerRadius={56}
                    outerRadius={86}
                    paddingAngle={4}>
                    {userMixData.map((entry) => (
                      <Cell
                        key={entry.segment}
                        fill={entry.fill}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </ChartCard>
          </motion.div>

          <motion.div
            {...getDashboardRevealProps(shouldReduceMotion, 5)}
            className="lg:col-span-1">
            <ChartCard
              title="Settlement Queue Status"
              description="Compare owner payout work against deposit refund follow-up in the same timeline."
              href="/dashboard/transactions"
              icon={BarChart3}>
              <ChartContainer
                config={settlementConfig}
                className="min-h-[260px]">
                <BarChart
                  accessibilityLayer
                  data={settlementQueueData}
                  margin={{ left: 8, right: 8 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent valueFormatter={formatNumber} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="payoutPending"
                    fill="var(--color-payoutPending)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="refundPending"
                    fill="var(--color-refundPending)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>
          </motion.div>

          <motion.div
            {...getDashboardRevealProps(shouldReduceMotion, 6)}
            className="lg:col-span-1">
            <ChartCard
              title="Support Load Overview"
              description="Owner and renter support demand stacked across the existing contact topics."
              href="/dashboard/support-queries"
              icon={CircleHelp}>
              <ChartContainer
                config={supportConfig}
                className="min-h-[260px]">
                <BarChart
                  accessibilityLayer
                  data={supportLoadData}
                  margin={{ left: 8, right: 8 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="topic"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={58}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent valueFormatter={formatNumber} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="owner"
                    stackId="support"
                    fill="var(--color-owner)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="renter"
                    stackId="support"
                    fill="var(--color-renter)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>
          </motion.div>

          <motion.div
            {...getDashboardRevealProps(shouldReduceMotion, 7)}
            className="lg:col-span-1">
            <ChartCard
              title="Verification Pipeline"
              description="Ready vs pending across both user readiness and listing moderation."
              href="/dashboard/verifications"
              icon={ShieldCheck}>
              <ChartContainer
                config={verificationConfig}
                className="min-h-[260px]">
                <AreaChart
                  accessibilityLayer
                  data={verificationPipelineData}
                  margin={{ left: 8, right: 8 }}>
                  <defs>
                    <linearGradient
                      id="verificationReady"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-ready)"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-ready)"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient
                      id="verificationPending"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-pending)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-pending)"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent valueFormatter={formatNumber} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="ready"
                    stroke="var(--color-ready)"
                    fill="url(#verificationReady)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="var(--color-pending)"
                    fill="url(#verificationPending)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ChartContainer>
            </ChartCard>
          </motion.div>
        </div>
      ) : null}
    </section>
  );
}
