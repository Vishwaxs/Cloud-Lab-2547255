import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/mongodb";
import { AdminUser } from "@/models/AdminUser";
import bcrypt from "bcryptjs";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { adminProfileUpdateSchema } from "@/lib/validation/admin";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { requireCsrf } from "@/lib/security/csrf";
import { ActivityLog } from "@/models/ActivityLog";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminApiSession();
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_profile_get", 120, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    const user = await AdminUser.findById(auth.session.sub)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch profile") },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminApiSession();
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_profile_update", 30, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const csrf = requireCsrf(req);
    if (csrf) return csrf;

    const body = await req.json().catch(() => null);
    const parsed = adminProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const updates: { name?: string; passwordHash?: string } = {};

    if (typeof parsed.data.name === "string") {
      updates.name = sanitizePlainText(parsed.data.name);
    }
    
    // Handle password change
    if (typeof parsed.data.currentPassword === "string" && typeof parsed.data.newPassword === "string") {
      const user = await AdminUser.findById(auth.session.sub);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      updates.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const user = await AdminUser.findByIdAndUpdate(
      auth.session.sub,
      updates,
      { new: true }
    ).select("-passwordHash");

    try {
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: updates.passwordHash ? "profile_password_change" : "profile_update",
        details: updates.passwordHash ? "Changed password" : "Updated profile",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update profile") },
      { status: 500 }
    );
  }
}
