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

async function proxyCategoryCollectionRequest(
  request: NextRequest,
  method: 'GET' | 'POST'
) {
  const body = method === 'GET' ? undefined : await request.formData();
  const backendResponse = await fetch(getBackendUrl('/categories'), {
    method,
    body,
    cache: 'no-store',
    headers: {
      accept: request.headers.get('accept') ?? 'application/json',
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
  return proxyCategoryCollectionRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyCategoryCollectionRequest(request, 'POST');
}
