import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  const isEmmaPath = pathname.startsWith("/emma") || pathname.startsWith("/api/emma");

  const isEmmaAllowedHost =
    host.includes("emmapp.io") ||
    host.includes("emma-git-") ||
    host.includes("localhost") ||
    host.startsWith("127.0.0.1");

  if (isEmmaPath && !isEmmaAllowedHost) {
    const url = request.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/emma/:path*", "/api/emma/:path*"],
};
