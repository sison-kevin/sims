import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import type { Role, SessionUser } from "./domain";

const SESSION_COOKIE = "sims-session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "sims-portfolio-dev-secret");

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return {
    id: payload.sub ?? "",
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
    role: payload.role as Role,
  } satisfies SessionUser;
}

export function getRequiredRoleForPath(pathname: string) {
  if (pathname.startsWith("/users")) {
    return ["admin"] as const;
  }

  if (pathname.startsWith("/analytics") || pathname.startsWith("/audit-logs")) {
    return ["admin", "manager"] as const;
  }

  if (pathname.startsWith("/products")) {
    return ["admin", "manager"] as const;
  }

  if (pathname.startsWith("/inventory") || pathname.startsWith("/sales")) {
    return ["admin", "manager", "staff"] as const;
  }

  return ["admin", "manager", "staff"] as const;
}

export function hasRequiredRole(role: Role, allowed: readonly Role[]) {
  return allowed.includes(role);
}

export function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

export function getSessionTokenFromRequest(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value ?? null;
}