export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  status: number;
  errors?: unknown;
  code?: string;

  constructor(
    message: string,
    status: number,
    errors?: unknown,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getErrorCode(errors: unknown) {
  if (!isPlainObject(errors)) {
    return undefined;
  }

  const code = errors.code;
  return typeof code === 'string' ? code : undefined;
}

function buildRequestBody(body: RequestOptions['body']) {
  if (body == null) {
    return undefined;
  }

  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  return JSON.stringify(body);
}

function buildHeaders(
  headers: HeadersInit | undefined,
  body: RequestOptions['body']
) {
  const nextHeaders = new Headers(headers);

  if (
    body != null &&
    !(body instanceof FormData) &&
    !nextHeaders.has('content-type')
  ) {
    nextHeaders.set('content-type', 'application/json');
  }

  if (!nextHeaders.has('accept')) {
    nextHeaders.set('accept', 'application/json');
  }

  return nextHeaders;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as unknown;
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function toApiError(response: Response, payload: unknown) {
  if (isPlainObject(payload)) {
    const message =
      typeof payload.message === 'string' ? payload.message : 'Request failed.';
    const errors = 'errors' in payload ? payload.errors : undefined;

    return new ApiError(message, response.status, errors, getErrorCode(errors));
  }

  return new ApiError('Request failed.', response.status);
}

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init: RequestOptions = {}
) {
  const response = await fetch(input, {
    ...init,
    body: buildRequestBody(init.body),
    cache: init.cache ?? 'no-store',
    credentials: init.credentials ?? 'include',
    headers: buildHeaders(init.headers, init.body)
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw toApiError(response, payload);
  }

  if (!isPlainObject(payload) || payload.success !== true) {
    throw toApiError(response, payload);
  }

  return payload as ApiSuccessResponse<T>;
}

export function getBackendBaseUrl() {
  return (
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    'http://127.0.0.1:8080'
  );
}

export function getBackendUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
}
