import { getBackendUrl } from '@/lib/http';
import { NextResponse, type NextRequest } from 'next/server';

function getSetCookieHeaders(response: Response) {
  const nextHeaders = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof nextHeaders.getSetCookie === 'function') {
    return nextHeaders.getSetCookie();
  }

  const header = response.headers.get('set-cookie');
  return header ? [header] : [];
}

async function proxyBookingCollectionRequest(
  request: NextRequest,
  method: 'GET' | 'POST'
) {
  const contentType = request.headers.get('content-type') ?? '';
  const body =
    method === 'GET'
      ? undefined
      : contentType.includes('multipart/form-data')
        ? await request.formData()
        : await request.text();

  const backendResponse = await fetch(getBackendUrl('/bookings'), {
    method,
    body,
    cache: 'no-store',
    headers: {
      accept: request.headers.get('accept') ?? 'application/json',
      ...(contentType && !contentType.includes('multipart/form-data')
        ? { 'content-type': contentType }
        : {}),
      ...(request.headers.get('x-idempotency-key')
        ? {
            'x-idempotency-key': request.headers.get(
              'x-idempotency-key'
            ) as string
          }
        : {}),
      ...(request.headers.get('cookie')
        ? { cookie: request.headers.get('cookie') as string }
        : {})
    }
  });

  const payload = await backendResponse.text();
  const response = new NextResponse(payload, {
    status: backendResponse.status,
    headers: {
      'content-type':
        backendResponse.headers.get('content-type') ?? 'application/json'
    }
  });

  for (const setCookie of getSetCookieHeaders(backendResponse)) {
    response.headers.append('set-cookie', setCookie);
  }

  return response;
}

export async function GET(request: NextRequest) {
  return proxyBookingCollectionRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyBookingCollectionRequest(request, 'POST');
}
