import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { getBackendUrl } from '@/lib/http';
import { NextResponse, type NextRequest } from 'next/server';

const allowedAuthRoutes = new Set([
  'signup',
  'signin',
  'verify-otp',
  'resend-otp',
  'phone',
  'profile',
  'password',
  'users',
  'dashboard-metrics',
  'logout',
  'me'
]);

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

function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}

async function proxyAuthRequest(
  request: NextRequest,
  authPath: string[],
  method: 'GET' | 'POST' | 'PATCH'
) {
  const [endpoint] = authPath;

  if (!endpoint || !allowedAuthRoutes.has(endpoint) || authPath.length > 2) {
    return NextResponse.json(
      {
        success: false,
        message: 'Auth route not found.'
      },
      { status: 404 }
    );
  }

  const backendPath =
    authPath.length === 1 ? `/auth/${endpoint}` : `/auth/${authPath.join('/')}`;

  const body = method === 'GET' ? undefined : await request.text();

  const backendResponse = await fetch(getBackendUrl(backendPath), {
    method,
    body,
    cache: 'no-store',
    headers: {
      accept: request.headers.get('accept') ?? 'application/json',
      ...(request.headers.get('content-type')
        ? { 'content-type': request.headers.get('content-type') as string }
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

  if (endpoint === 'logout') {
    clearAuthCookie(response);
  }

  return response;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ auth: string[] }> }
) {
  const { auth } = await context.params;
  return proxyAuthRequest(request, auth, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ auth: string[] }> }
) {
  const { auth } = await context.params;
  return proxyAuthRequest(request, auth, 'POST');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ auth: string[] }> }
) {
  const { auth } = await context.params;
  return proxyAuthRequest(request, auth, 'PATCH');
}
