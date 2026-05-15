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

async function proxyCategoryRequest(
  request: NextRequest,
  categoryPath: string[],
  method: "GET" | "POST" | "DELETE" | "PATCH",
) {
  const backendPath =
    categoryPath.length > 0
      ? `/categories/${categoryPath.join("/")}`
      : "/categories";
  const body =
    method === "GET" || method === "DELETE" ? undefined : await request.formData();

  const backendResponse = await fetch(getBackendUrl(backendPath), {
    method,
    body,
    cache: "no-store",
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
      ...(request.headers.get("cookie")
        ? { cookie: request.headers.get("cookie") as string }
        : {}),
    },
  });

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
  context: { params: Promise<{ categories: string[] }> },
) {
  const { categories } = await context.params;
  return proxyCategoryRequest(request, categories, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ categories: string[] }> },
) {
  const { categories } = await context.params;
  return proxyCategoryRequest(request, categories, "POST");
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categories: string[] }> },
) {
  const { categories } = await context.params;
  return proxyCategoryRequest(request, categories, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ categories: string[] }> },
) {
  const { categories } = await context.params;
  return proxyCategoryRequest(request, categories, "PATCH");
}
