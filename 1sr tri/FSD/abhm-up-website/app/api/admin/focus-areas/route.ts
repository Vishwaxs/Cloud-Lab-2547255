import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { connectDB } from "@/lib/db/mongodb";
import { FocusArea } from "@/models/FocusArea";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { focusAreaCreateSchema } from "@/lib/validation/focusAreas";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { requireCsrf } from "@/lib/security/csrf";
import { ActivityLog } from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_focus_areas_list", 120, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    const focusAreas = await FocusArea.find({}).sort({ order: 1 }).limit(50).lean();
    
    return NextResponse.json({ focusAreas });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch focus areas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["superadmin", "admin", "editor"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_focus_areas_create", 20, 60);
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
    const parsed = focusAreaCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const focusArea = await FocusArea.create({
      title: sanitizePlainText(parsed.data.title),
      titleHi: parsed.data.titleHi ? sanitizePlainText(parsed.data.titleHi) : undefined,
      description: sanitizePlainText(parsed.data.description),
      descriptionHi: parsed.data.descriptionHi ? sanitizePlainText(parsed.data.descriptionHi) : undefined,
      icon: sanitizePlainText(parsed.data.icon),
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      createdByAdminId: session.userId,
    });

    try {
      await ActivityLog.create({
        adminId: session.userId,
        adminEmail: session.email,
        action: "focus_area_create",
        details: `Created focus area ${String(focusArea._id)}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ focusArea }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create focus area" },
      { status: 500 }
    );
  }
}
