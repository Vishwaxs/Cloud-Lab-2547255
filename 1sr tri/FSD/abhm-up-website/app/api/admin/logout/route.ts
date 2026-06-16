import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_REFRESH_COOKIE, ADMIN_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { connectDb } from "@/lib/db";
import { AdminRefreshToken } from "@/models/AdminRefreshToken";
import { hashRefreshToken } from "@/lib/auth/refresh";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";
import { getSession } from "@/lib/auth/get-session";
import { ActivityLog } from "@/models/ActivityLog";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = getMongoRateLimiter("admin_logout", 60, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const csrf = requireCsrf(req);
  if (csrf) return csrf;

  try {
    const session = await getSession();
    if (session) {
      await connectDb();
      await ActivityLog.create({
        adminId: session.userId,
        adminEmail: session.email,
        action: "logout",
        details: "Logged out",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    }
  } catch {
    // Non-blocking
  }

  const refresh = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (refresh) {
    try {
      await connectDb();
      await AdminRefreshToken.deleteOne({ tokenHash: hashRefreshToken(refresh) });
    } catch {
      // Ignore logout revocation failures
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set({
    name: ADMIN_REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
}
