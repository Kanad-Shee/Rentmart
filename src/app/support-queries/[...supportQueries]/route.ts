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

async function proxySupportQueryRequest(
  request: NextRequest,
  supportQueryPath: string[],
  method: 'GET' | 'POST' | 'DELETE'
) {
  const backendPath =
    supportQueryPath.length > 0
      ? `/support-queries/${supportQueryPath.join('/')}${request.nextUrl.search}`
      : `/support-queries${request.nextUrl.search}`;
  const contentType = request.headers.get('content-type') ?? '';
  const body =
    method === 'GET' || method === 'DELETE'
      ? undefined
      : contentType.includes('multipart/form-data')
        ? await request.formData()
        : await request.text();

  let backendResponse: Response;

  try {
    backendResponse = await fetch(getBackendUrl(backendPath), {
      method,
      body,
      cache: 'no-store',
      headers: {
        accept: request.headers.get('accept') ?? 'application/json',
        ...(contentType && !contentType.includes('multipart/form-data')
          ? { 'content-type': contentType }
          : {}),
        ...(request.headers.get('cookie')
          ? { cookie: request.headers.get('cookie') as string }
          : {})
      }
    });
  } catch (error) {
    console.error('Support query proxy request failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to reach the backend server.'
      },
      { status: 502 }
    );
  }

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ supportQueries: string[] }> }
) {
  const { supportQueries } = await context.params;
  return proxySupportQueryRequest(request, supportQueries, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ supportQueries: string[] }> }
) {
  const { supportQueries } = await context.params;
  return proxySupportQueryRequest(request, supportQueries, 'POST');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ supportQueries: string[] }> }
) {
  const { supportQueries } = await context.params;
  return proxySupportQueryRequest(request, supportQueries, 'DELETE');
}
