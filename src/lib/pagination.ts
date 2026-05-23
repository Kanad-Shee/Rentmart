export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginationState = {
  page: number;
  pageSize: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function buildPaginationSearchParams(input: PaginationInput) {
  const searchParams = new URLSearchParams();

  if (typeof input.page === 'number') {
    searchParams.set('page', String(input.page));
  }

  if (typeof input.pageSize === 'number') {
    searchParams.set('pageSize', String(input.pageSize));
  }

  return searchParams;
}
