import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

const API_BASE = process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "";
const ACCESS_COOKIE_KEY = "client_access_token";
const REFRESH_COOKIE_KEY = "client_refresh_token";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_KEY)?.value;

  let authData = { user: null, roles: [], permissions: [] };

  if (accessToken) {
    try {
      const cookieHeader = [
        `${ACCESS_COOKIE_KEY}=${accessToken}`,
        refreshToken ? `${REFRESH_COOKIE_KEY}=${refreshToken}` : null,
      ]
        .filter(Boolean)
        .join("; ");

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.ME}`, {
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
        credentials: "include",
      });

      if (response.ok) {
        authData = await response.json();
      }
    } catch (error) {
      console.error("Middleware auth fetch error:", error);
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-auth-data", JSON.stringify(authData));
  return response;
}

export const config = {
  matcher: ["/:path*"],
};
