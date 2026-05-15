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

async function proxyPaymentRequest(
  request: NextRequest,
  paymentPath: string[],
  method: "GET",
) {
  const backendPath = paymentPath.length
    ? `/payments/${paymentPath.join("/")}${request.nextUrl.search}`
    : `/payments${request.nextUrl.search}`;

  let backendResponse: Response;

  try {
    backendResponse = await fetch(getBackendUrl(backendPath), {
      method,
      cache: "no-store",
      headers: {
        accept: request.headers.get("accept") ?? "application/json",
        ...(request.headers.get("cookie")
          ? { cookie: request.headers.get("cookie") as string }
          : {}),
      },
    });
  } catch (error) {
    console.error("Payment proxy request failed:", error);
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
  context: { params: Promise<{ payments: string[] }> },
) {
  const { payments } = await context.params;
  return proxyPaymentRequest(request, payments, "GET");
}
