import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE = "abhm_csrf";
export const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken() {
  return crypto.randomUUID();
}

export function ensureCsrfCookie(req: NextRequest, res: NextResponse) {
  const existing = req.cookies.get(CSRF_COOKIE)?.value;
  const token = existing || generateCsrfToken();

  if (!existing) {
    res.cookies.set({
      name: CSRF_COOKIE,
      value: token,
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  // Helpful for debugging / optional client bootstrapping.
  res.headers.set("X-CSRF-Token", token);

  return token;
}

export function verifyCsrf(req: NextRequest) {
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;

  const headerToken = req.headers.get(CSRF_HEADER) || req.headers.get(CSRF_HEADER.toUpperCase());
  if (!headerToken) return false;

  return timingSafeEqual(cookieToken, headerToken);
}

export function requireCsrf(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (verifyCsrf(req)) return null;
  return NextResponse.json({ error: "CSRF token missing or invalid" }, { status: 403 });
}

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  // Some non-browser clients may not send Origin; allow those.
  if (!origin) return true;

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;

  const proto =
    req.headers.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const expected = `${proto}://${host}`;
  return origin === expected;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
}
