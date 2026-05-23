'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type DashboardPaginationControlsProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function DashboardPaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className
}: DashboardPaginationControlsProps) {
  if (totalItems <= pageSize && totalPages <= 1) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border border-[#d8dfdb] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between',
        className ?? ''
      ].join(' ')}>
      <p className="text-sm text-[#5c5f60]">
        Showing <span className="font-semibold text-primary">{start}</span>-
        <span className="font-semibold text-primary">{end}</span> of{' '}
        <span className="font-semibold text-primary">{totalItems}</span>
      </p>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dfdb] px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-[#f8faf7] disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="min-w-24 text-center text-sm font-medium text-[#5c5f60]">
          Page {safePage} of {safeTotalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dfdb] px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-[#f8faf7] disabled:cursor-not-allowed disabled:opacity-50">
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
