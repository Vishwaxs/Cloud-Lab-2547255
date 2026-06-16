import { NextResponse, type NextRequest } from "next/server";
import { adminLoginSchema } from "@/lib/validation/admin";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { connectDb } from "@/lib/db";
import { isJwtConfigured, isMongoConfigured } from "@/lib/env";
import { AdminUser } from "@/models/AdminUser";
import { ActivityLog } from "@/models/ActivityLog";
import { verifyPassword } from "@/lib/auth/password";
import { signAdminJwt } from "@/lib/auth/jwt";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { ADMIN_REFRESH_COOKIE, ADMIN_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { AdminRefreshToken } from "@/models/AdminRefreshToken";
import { generateRefreshToken, hashRefreshToken } from "@/lib/auth/refresh";

export async function POST(req: NextRequest) {
  if (!isMongoConfigured() || !isJwtConfigured()) {
    return NextResponse.json(
      { error: "Service is not configured. Please try again later." },
      { status: 503 }
    );
  }

  const ip = getClientIp(req);
  const limiter = getMongoRateLimiter("admin_login", 10, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }

  const email = sanitizePlainText(parsed.data.email).toLowerCase();
  const password = parsed.data.password;

  await connectDb();
  const user = await AdminUser.findOne({ email }).lean();
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Update last login time
  await AdminUser.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  // Log the login activity
  try {
    await ActivityLog.create({
      adminId: String(user._id),
      adminEmail: user.email,
      action: "login",
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }

  const token = await signAdminJwt({
    sub: String(user._id),
    role: user.role,
    email: user.email,
  }, "15m");

  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);
  const refreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  // Store refresh token (hashed) for rotation / revocation.
  await AdminRefreshToken.create({
    adminId: String(user._id),
    tokenHash: refreshHash,
    expiresAt: refreshExpiresAt,
    ipAddress: ip,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  const res = NextResponse.json({
    ok: true,
    user: { email: user.email, name: user.name, role: user.role },
  });

  res.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  });

  res.cookies.set({
    name: ADMIN_REFRESH_COOKIE,
    value: refreshToken,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
