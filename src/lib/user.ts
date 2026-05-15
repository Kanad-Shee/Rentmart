import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type User } from "./auth";
import { AUTH_COOKIE_NAME } from "./auth-cookie";
import { ApiError, apiRequest, getBackendUrl } from "./http";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!authCookie) {
    return null;
  }

  try {
    const response = await apiRequest<{ user: User }>(getBackendUrl("/auth/me"), {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${authCookie}`,
      },
      credentials: "omit",
    });

    return response.data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireUserRole(
  allowedRoles: User["role"][],
  redirectTo = "/dashboard/overview",
) {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireGuest() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }
}
