'use client';

import { DashboardPaginationControls } from './dashboard-pagination-controls';
import { Button } from '@/components/ui/button';
import {
  useAdminSupportQueriesPageQuery,
  useResolveSupportQueryMutation
} from '@/hooks/use-support-query';
import { supportQueryLabels, type SupportQueryItem } from '@/lib/support-query';
import {
  AlertTriangle,
  Headphones,
  Loader2,
  Search,
  Trash2
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function getRoleTone(role: SupportQueryItem['role']) {
  return role === 'OWNER'
    ? 'bg-[#ecfdf3] text-[#166534]'
    : 'bg-[#fff7ed] text-[#9a6700]';
}

function SummaryCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-xl border border-[#d8dfdb] bg-emerald-700/5 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#5c5f60]">{helper}</p>
    </article>
  );
}

export function AdminSupportQueries() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<
    'ALL' | SupportQueryItem['role']
  >('ALL');
  const [topicFilter, setTopicFilter] = useState<
    'ALL' | SupportQueryItem['topic']
  >('ALL');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const supportQueriesQuery = useAdminSupportQueriesPageQuery({
    page,
    pageSize: 10,
    search: deferredSearchTerm,
    role: roleFilter,
    topic: topicFilter
  });
  const resolveSupportQueryMutation = useResolveSupportQueryMutation();
  const queries = useMemo(
    () => supportQueriesQuery.data?.items ?? [],
    [supportQueriesQuery.data]
  );

  const summary = useMemo(() => {
    const ownerCount = queries.filter((query) => query.role === 'OWNER').length;
    const renterCount = queries.filter(
      (query) => query.role === 'RENTER'
    ).length;

    return {
      ownerCount,
      renterCount
    };
  }, [queries]);

  async function handleResolve(id: string) {
    try {
      await resolveSupportQueryMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to resolve support query:', error);
    }
  }

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
            Admin Workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
            Support Queries
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5c5f60] sm:text-base">
            Review support messages submitted by owners and renters, then
            resolve each query by clearing it from the active admin queue.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#d8dfdb] bg-white px-5 py-4 shadow-sm">
          <Headphones className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Active Queue
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">
              {supportQueriesQuery.data?.totalItems ?? queries.length} queries
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Total Queries"
          value={String(queries.length)}
          helper="Live support requests waiting in the admin review queue."
        />
        <SummaryCard
          label="Owners"
          value={String(summary.ownerCount)}
          helper="Requests submitted by equipment owners."
        />
        <SummaryCard
          label="Renters"
          value={String(summary.renterCount)}
          helper="Requests submitted by renter accounts."
        />
      </div>

      <div className="grid gap-4 rounded-xl border border-[#d8dfdb] bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_220px]">
        <label className="flex items-center gap-3 rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-[#64748b]">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, topic, or message"
            className="w-full bg-transparent outline-none placeholder:text-[#94a3b8]"
          />
        </label>

        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(
              event.target.value as 'ALL' | SupportQueryItem['role']
            );
            setPage(1);
          }}
          className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
          <option value="ALL">All roles</option>
          <option value="OWNER">Owners</option>
          <option value="RENTER">Renters</option>
        </select>

        <select
          value={topicFilter}
          onChange={(event) => {
            setTopicFilter(
              event.target.value as 'ALL' | SupportQueryItem['topic']
            );
            setPage(1);
          }}
          className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
          <option value="ALL">All topics</option>
          {Object.entries(supportQueryLabels).map(([value, label]) => (
            <option
              key={value}
              value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {supportQueriesQuery.isPending ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      {supportQueriesQuery.isError ? (
        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#7a120c]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold tracking-[-0.03em]">
              We couldn&apos;t load support queries
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]">
            Try refreshing this page in a moment. The admin queue will re-run
            automatically.
          </p>
        </div>
      ) : null}

      {!supportQueriesQuery.isPending && !supportQueriesQuery.isError ? (
        queries.length > 0 ? (
          <div className="space-y-4">
            {queries.map((query) => (
              <article
                key={query.id}
                className="rounded-xl border border-[#d8dfdb] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-primary">
                        {query.fullName}
                      </h2>
                      <span
                        className={[
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                          getRoleTone(query.role)
                        ].join(' ')}>
                        {query.role}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#eef3ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        {supportQueryLabels[query.topic]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {query.email}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#94a3b8]">
                      Submitted {formatDateTime(query.createdAt)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResolve(query.id)}
                    disabled={resolveSupportQueryMutation.isPending}
                    className="shrink-0">
                    {resolveSupportQueryMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Resolve & Delete
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-5 rounded-xl border border-[#e5ebe6] bg-[#fbfcfa] p-4">
                  <p className="text-sm leading-7 text-[#45514b]">
                    {query.message}
                  </p>
                </div>
              </article>
            ))}
            {supportQueriesQuery.data ? (
              <DashboardPaginationControls
                page={supportQueriesQuery.data.page}
                totalPages={supportQueriesQuery.data.totalPages}
                totalItems={supportQueriesQuery.data.totalItems}
                pageSize={supportQueriesQuery.data.pageSize}
                onPageChange={setPage}
              />
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-[#d8dfdb] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary">
              No active support queries
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              New owner and renter messages will appear here when they submit
              the contact form.
            </p>
          </div>
        )
      ) : null}
    </section>
  );
}
