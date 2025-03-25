import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  let authData = { user: null, roles: [], permissions: [] };

  if (token) {
    try {
      const response = await http.get(API_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${token}` },
      });
      authData = response.data;
    } catch (error) {
      console.error("Middleware auth fetch error:", error);
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-auth-data", JSON.stringify(authData));
  return response;
}

export const config = {
  matcher: ["/:path*"], // Áp dụng cho mọi route
};
