'use client';

import { DashboardPaginationControls } from './dashboard-pagination-controls';
import { useAdminUsersPageQuery } from '@/hooks/use-auth';
import type {
  AdminUserManagementItem,
  AdminUserVerificationFilter,
  UserRole
} from '@/lib/auth';
import {
  AlertTriangle,
  Loader2,
  Search,
  ShieldCheck,
  UsersRound
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 'Recently';
  }

  const diffMs = timestamp - Date.now();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const absoluteDiff = Math.abs(diffMs);

  if (absoluteDiff < hourMs) {
    return rtf.format(Math.round(diffMs / minuteMs), 'minute');
  }

  if (absoluteDiff < dayMs) {
    return rtf.format(Math.round(diffMs / hourMs), 'hour');
  }

  return rtf.format(Math.round(diffMs / dayMs), 'day');
}

function getRoleTone(role: UserRole) {
  if (role === 'ADMIN') {
    return 'bg-[#eef2ff] text-[#3730a3]';
  }

  if (role === 'OWNER') {
    return 'bg-[#ecfdf3] text-[#166534]';
  }

  return 'bg-[#fff7ed] text-[#9a6700]';
}

function getVerificationLabel(user: AdminUserManagementItem) {
  if (user.emailVerified && user.phoneVerified) {
    return 'Fully verified';
  }

  if (user.emailVerified || user.phoneVerified) {
    return 'Partially verified';
  }

  return 'Action required';
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
    <article className="rounded-xl border border-[#d8dfdb] bg-emerald-900/5 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary">
        {value}
      </p>
      <p className="mt-2 text-sm  text-[#5c5f60]">{helper}</p>
    </article>
  );
}

export function AdminUserManagement() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [verificationFilter, setVerificationFilter] =
    useState<AdminUserVerificationFilter>('ALL');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
  const usersQuery = useAdminUsersPageQuery({
    page,
    pageSize: 10,
    search: deferredSearchTerm,
    role: roleFilter,
    verification: verificationFilter
  });
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data]);
  const visibleUsers = useMemo(
    () =>
      users.filter((user) => {
        if (normalizedSearchTerm) {
          const haystack = [user.fullName, user.email, user.phone, user.address]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!haystack.includes(normalizedSearchTerm)) {
            return false;
          }
        }

        if (roleFilter !== 'ALL' && user.role !== roleFilter) {
          return false;
        }

        if (verificationFilter === 'VERIFIED') {
          return user.emailVerified && user.phoneVerified;
        }

        if (verificationFilter === 'ACTION_REQUIRED') {
          return !user.emailVerified || !user.phoneVerified;
        }

        return true;
      }),
    [normalizedSearchTerm, roleFilter, users, verificationFilter]
  );

  const summaries = useMemo(() => {
    const owners = visibleUsers.filter((user) => user.role === 'OWNER').length;
    const renters = visibleUsers.filter(
      (user) => user.role === 'RENTER'
    ).length;
    const verificationReady = visibleUsers.filter(
      (user) => user.emailVerified && user.phoneVerified
    ).length;

    return {
      owners,
      renters,
      verificationReady
    };
  }, [visibleUsers]);

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
            Admin Workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
            User Management
          </h1>
          <p className="mt-3 max-w-3xl text-sm  text-[#5c5f60] sm:text-base">
            Search platform accounts, review verification readiness, and inspect
            owner and renter activity from one queue.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#d8dfdb] bg-white px-5 py-4 shadow-sm">
          <UsersRound className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Visible Accounts
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">
              {visibleUsers.length} users
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Owners"
          value={String(summaries.owners)}
          helper="Accounts that can publish and manage equipment listings."
        />
        <SummaryCard
          label="Renters"
          value={String(summaries.renters)}
          helper="Accounts that can request bookings and make payments."
        />
        <SummaryCard
          label="Fully Verified"
          value={String(summaries.verificationReady)}
          helper="Accounts with both email and phone verification completed."
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
            placeholder="Search name, email, phone, or address"
            className="w-full bg-transparent outline-none placeholder:text-[#94a3b8]"
          />
        </label>

        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as 'ALL' | UserRole);
            setPage(1);
          }}
          className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
          <option value="ALL">All roles</option>
          <option value="ADMIN">Admins</option>
          <option value="OWNER">Owners</option>
          <option value="RENTER">Renters</option>
        </select>

        <select
          value={verificationFilter}
          onChange={(event) => {
            setVerificationFilter(
              event.target.value as AdminUserVerificationFilter
            );
            setPage(1);
          }}
          className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
          <option value="ALL">All verification states</option>
          <option value="VERIFIED">Fully verified</option>
          <option value="ACTION_REQUIRED">Action required</option>
        </select>
      </div>

      {usersQuery.isPending ? (
        <div className="flex min-h-60 items-center justify-center rounded-xl border border-[#d8dfdb] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      {usersQuery.isError ? (
        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#7a120c]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold tracking-[-0.03em]">
              We couldn&apos;t load platform users
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm  text-[#7a120c]">
            Try refreshing this page in a moment. Admin user filters will re-run
            automatically.
          </p>
        </div>
      ) : null}

      {!usersQuery.isPending && !usersQuery.isError ? (
        visibleUsers.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#f8faf7]">
                  <tr>
                    {[
                      'User',
                      'Role',
                      'Verification',
                      'Listings',
                      'Bookings',
                      'Unread Alerts',
                      'Last Activity'
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ee]">
                  {visibleUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="align-top transition-colors hover:bg-[#fbfcfa]">
                      <td className="px-6 py-5">
                        <div className="min-w-70">
                          <p className="text-base font-semibold text-primary">
                            {user.fullName}
                          </p>
                          <p className="mt-1 text-sm text-[#64748b]">
                            {user.email}
                          </p>
                          <p className="mt-1 text-sm text-[#64748b]">
                            {user.phone ?? 'No phone on file'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={[
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                            getRoleTone(user.role)
                          ].join(' ')}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#475569]">
                        <div className="flex min-w-45 items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <span>{getVerificationLabel(user)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#475569]">
                        {user.listingCount}
                      </td>
                      <td className="px-6 py-5 text-sm text-[#475569]">
                        {user.ownerBookingCount + user.renterBookingCount}
                      </td>
                      <td className="px-6 py-5 text-sm text-[#475569]">
                        {user.unreadNotificationCount}
                      </td>
                      <td className="px-6 py-5 text-sm text-[#475569]">
                        {formatRelativeDate(user.lastActivityAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 pt-0">
              <DashboardPaginationControls
                page={usersQuery.data.page}
                totalPages={usersQuery.data.totalPages}
                totalItems={usersQuery.data.totalItems}
                pageSize={usersQuery.data.pageSize}
                onPageChange={setPage}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
            No users match the current filters. Adjust the search or
            verification filters to widen the queue.
          </div>
        )
      ) : null}
    </section>
  );
}
