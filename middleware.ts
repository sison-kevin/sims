import { NextResponse, type NextRequest } from "next/server";
import { getRequiredRoleForPath, hasRequiredRole, isApiPath, getSessionTokenFromRequest, verifySessionToken } from "./lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getSessionTokenFromRequest(request);

  const isPublicPath = pathname === "/login" || pathname.startsWith("/pricing") || pathname.startsWith("/docs");

  if (isPublicPath) {
    if (!token) {
      return NextResponse.next();
    }

    try {
      await verifySessionToken(token);
      if (pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.next();
    }
  }

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!token) {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const session = await verifySessionToken(token);
    const allowedRoles = getRequiredRoleForPath(pathname);

    if (!hasRequiredRole(session.role, allowedRoles)) {
      if (isApiPath(pathname)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.redirect(new URL("/dashboard?forbidden=1", request.url));
    }

    return NextResponse.next();
  } catch {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};