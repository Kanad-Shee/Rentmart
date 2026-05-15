import { NextResponse, type NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/http";

function getSetCookieHeaders(response: Response) {
  const nextHeaders = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof nextHeaders.getSetCookie === "function") {
    return nextHeaders.getSetCookie();
  }

  const header = response.headers.get("set-cookie");
  return header ? [header] : [];
}

async function proxyBookingRequest(
  request: NextRequest,
  bookingPath: string[],
  method: "GET" | "POST" | "PATCH",
) {
  const backendPath = bookingPath.length
    ? `/bookings/${bookingPath.join("/")}${request.nextUrl.search}`
    : `/bookings${request.nextUrl.search}`;
  const contentType = request.headers.get("content-type") ?? "";
  const body =
    method === "GET"
      ? undefined
      : contentType.includes("multipart/form-data")
        ? await request.formData()
        : await request.text();

  let backendResponse: Response;

  try {
    backendResponse = await fetch(getBackendUrl(backendPath), {
      method,
      body,
      cache: "no-store",
      headers: {
        accept: request.headers.get("accept") ?? "application/json",
        ...(contentType && !contentType.includes("multipart/form-data")
          ? { "content-type": contentType }
          : {}),
        ...(request.headers.get("x-idempotency-key")
          ? {
              "x-idempotency-key": request.headers.get("x-idempotency-key") as string,
            }
          : {}),
        ...(request.headers.get("cookie")
          ? { cookie: request.headers.get("cookie") as string }
          : {}),
      },
    });
  } catch (error) {
    console.error("Booking proxy request failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the backend server.",
      },
      { status: 502 },
    );
  }

  const payload = await backendResponse.text();
  const response = new NextResponse(payload, {
    status: backendResponse.status,
    headers: {
      "content-type":
        backendResponse.headers.get("content-type") ?? "application/json",
    },
  });

  for (const setCookie of getSetCookieHeaders(backendResponse)) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookings: string[] }> },
) {
  const { bookings } = await context.params;
  return proxyBookingRequest(request, bookings, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ bookings: string[] }> },
) {
  const { bookings } = await context.params;
  return proxyBookingRequest(request, bookings, "POST");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ bookings: string[] }> },
) {
  const { bookings } = await context.params;
  return proxyBookingRequest(request, bookings, "PATCH");
}
