import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/get-session";
import { connectDB } from "@/lib/db/mongodb";
import { FocusArea } from "@/models/FocusArea";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { focusAreaUpdateSchema } from "@/lib/validation/focusAreas";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { requireCsrf } from "@/lib/security/csrf";
import { ActivityLog } from "@/models/ActivityLog";

const paramsSchema = z.object({ id: z.string().min(1) });

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { id } = parsedParams.data;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_focus_areas_get", 240, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    const area = await FocusArea.findById(id).lean();
    
    if (!area) {
      return NextResponse.json({ error: "Focus area not found" }, { status: 404 });
    }

    return NextResponse.json({ focusArea: area });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch focus area" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { id } = parsedParams.data;
    const session = await getSession();
    if (!session || !["superadmin", "admin", "editor"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_focus_areas_update", 60, 60);
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
    const parsed = focusAreaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const $set: Record<string, unknown> = { updatedByAdminId: session.userId };
    if (typeof parsed.data.title === "string") $set.title = sanitizePlainText(parsed.data.title);
    if (typeof parsed.data.titleHi === "string") $set.titleHi = sanitizePlainText(parsed.data.titleHi);
    if (typeof parsed.data.description === "string") $set.description = sanitizePlainText(parsed.data.description);
    if (typeof parsed.data.descriptionHi === "string") $set.descriptionHi = sanitizePlainText(parsed.data.descriptionHi);
    if (typeof parsed.data.icon === "string") $set.icon = sanitizePlainText(parsed.data.icon);
    if (typeof parsed.data.order === "number") $set.order = parsed.data.order;
    if (typeof parsed.data.isActive === "boolean") $set.isActive = parsed.data.isActive;

    const area = await FocusArea.findByIdAndUpdate(
      id,
      {
        $set,
      },
      { new: true }
    );

    if (!area) {
      return NextResponse.json({ error: "Focus area not found" }, { status: 404 });
    }

    try {
      await ActivityLog.create({
        adminId: session.userId,
        adminEmail: session.email,
        action: "focus_area_update",
        details: `Updated focus area ${id}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ focusArea: area });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update focus area" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { id } = parsedParams.data;
    const session = await getSession();
    if (!session || !["superadmin", "admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_focus_areas_delete", 30, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const csrf = requireCsrf(req);
    if (csrf) return csrf;

    await connectDB();
    const area = await FocusArea.findByIdAndDelete(id);

    if (!area) {
      return NextResponse.json({ error: "Focus area not found" }, { status: 404 });
    }

    try {
      await ActivityLog.create({
        adminId: session.userId,
        adminEmail: session.email,
        action: "focus_area_delete",
        details: `Deleted focus area ${id}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete focus area" },
      { status: 500 }
    );
  }
}
