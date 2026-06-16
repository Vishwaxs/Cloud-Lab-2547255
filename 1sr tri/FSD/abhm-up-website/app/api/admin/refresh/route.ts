import { NextResponse, type NextRequest } from "next/server";

import { connectDb } from "@/lib/db";
import { isJwtConfigured, isMongoConfigured } from "@/lib/env";
import { signAdminJwt } from "@/lib/auth/jwt";
import { ADMIN_REFRESH_COOKIE, ADMIN_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { generateRefreshToken, hashRefreshToken } from "@/lib/auth/refresh";
import { AdminRefreshToken } from "@/models/AdminRefreshToken";
import { AdminUser } from "@/models/AdminUser";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";

export async function POST(req: NextRequest) {
  if (!isMongoConfigured() || !isJwtConfigured()) {
    return NextResponse.json(
      { error: "Service is not configured. Please try again later." },
      { status: 503 }
    );
  }

  const ip = getClientIp(req);
  const limiter = getMongoRateLimiter("admin_refresh", 60, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  const csrf = requireCsrf(req);
  if (csrf) return csrf;

  const refresh = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDb();

  const tokenHash = hashRefreshToken(refresh);
  const tokenDoc = await AdminRefreshToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!tokenDoc) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await AdminUser.findById(tokenDoc.adminId).lean();
  if (!user || !user.isActive) {
    await AdminRefreshToken.deleteOne({ tokenHash });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rotate refresh token
  const newRefresh = generateRefreshToken();
  const newHash = hashRefreshToken(newRefresh);
  const refreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await AdminRefreshToken.deleteOne({ tokenHash });
  await AdminRefreshToken.create({
    adminId: String(user._id),
    tokenHash: newHash,
    expiresAt: refreshExpiresAt,
    lastUsedAt: new Date(),
    ipAddress: ip,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  const accessToken = await signAdminJwt(
    { sub: String(user._id), role: user.role, email: user.email },
    "15m"
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  });

  res.cookies.set({
    name: ADMIN_REFRESH_COOKIE,
    value: newRefresh,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
