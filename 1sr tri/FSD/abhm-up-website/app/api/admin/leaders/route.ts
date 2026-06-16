import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/mongodb";
import { Leader } from "@/models/Leader";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { leaderCreateSchema } from "@/lib/validation/leaders";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { requireCsrf } from "@/lib/security/csrf";
import { ActivityLog } from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_leaders_list", 120, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    const leaders = await Leader.find({}).sort({ order: 1 }).limit(50).lean();
    
    return NextResponse.json({ leaders });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch leaders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_leaders_create", 20, 60);
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
    const parsed = leaderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const leader = await Leader.create({
      name: sanitizePlainText(parsed.data.name),
      nameHi: parsed.data.nameHi ? sanitizePlainText(parsed.data.nameHi) : undefined,
      role: sanitizePlainText(parsed.data.role),
      roleHi: parsed.data.roleHi ? sanitizePlainText(parsed.data.roleHi) : undefined,
      description: parsed.data.description ? sanitizePlainText(parsed.data.description) : undefined,
      descriptionHi: parsed.data.descriptionHi ? sanitizePlainText(parsed.data.descriptionHi) : undefined,
      imageUrl: parsed.data.imageUrl ? sanitizePlainText(parsed.data.imageUrl) : undefined,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      createdByAdminId: auth.session.sub,
    });

    try {
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: "leader_create",
        details: `Created leader ${String(leader._id)}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ leader }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create leader" },
      { status: 500 }
    );
  }
}
