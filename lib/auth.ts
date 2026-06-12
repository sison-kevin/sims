import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getUserByEmail } from "./store";
import type { Role, SessionUser } from "./domain";

const SESSION_COOKIE = "sims-session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "sims-portfolio-dev-secret");

export function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ role: user.role, name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return {
    id: payload.sub ?? "",
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
    role: payload.role as Role,
  } satisfies SessionUser;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  // Debug: log for troubleshooting authentication
  try { console.log('[auth] authenticateUser', { email, found: !!user }); } catch {}
  const computed = hashPassword(password);
  try { console.log('[auth] password compare', { stored: user?.passwordHash, computed }); } catch {}
  if (!user || user.passwordHash !== computed) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  } satisfies SessionUser;
}

export async function issueSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
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

export function getAuthRequestRole(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return jwtVerify(token, secret)
    .then(({ payload }) => ({
      id: payload.sub ?? "",
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role as Role,
    }))
    .catch(() => null);
}