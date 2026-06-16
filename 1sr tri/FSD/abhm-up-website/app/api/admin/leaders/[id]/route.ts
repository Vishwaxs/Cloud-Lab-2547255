import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/mongodb";
import { Leader } from "@/models/Leader";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { leaderUpdateSchema } from "@/lib/validation/leaders";
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
    const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_leaders_get", 240, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    const leader = await Leader.findById(id).lean();
    
    if (!leader) {
      return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    }

    return NextResponse.json({ leader });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch leader" },
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
    const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_leaders_update", 60, 60);
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
    const parsed = leaderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const $set: Record<string, unknown> = { updatedByAdminId: auth.session.sub };
    if (typeof parsed.data.name === "string") $set.name = sanitizePlainText(parsed.data.name);
    if (typeof parsed.data.nameHi === "string") $set.nameHi = sanitizePlainText(parsed.data.nameHi);
    if (typeof parsed.data.role === "string") $set.role = sanitizePlainText(parsed.data.role);
    if (typeof parsed.data.roleHi === "string") $set.roleHi = sanitizePlainText(parsed.data.roleHi);
    if (typeof parsed.data.description === "string") $set.description = sanitizePlainText(parsed.data.description);
    if (typeof parsed.data.descriptionHi === "string") $set.descriptionHi = sanitizePlainText(parsed.data.descriptionHi);
    if (typeof parsed.data.imageUrl === "string") $set.imageUrl = sanitizePlainText(parsed.data.imageUrl);
    if (typeof parsed.data.order === "number") $set.order = parsed.data.order;
    if (typeof parsed.data.isActive === "boolean") $set.isActive = parsed.data.isActive;

    const leader = await Leader.findByIdAndUpdate(
      id,
      {
        $set,
      },
      { new: true }
    );

    if (!leader) {
      return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    }

    try {
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: "leader_update",
        details: `Updated leader ${id}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ leader });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update leader" },
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
    const auth = await requireAdminApiSession(["superadmin", "admin"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_leaders_delete", 30, 60);
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
    const leader = await Leader.findByIdAndDelete(id);

    if (!leader) {
      return NextResponse.json({ error: "Leader not found" }, { status: 404 });
    }

    try {
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: "leader_delete",
        details: `Deleted leader ${id}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete leader" },
      { status: 500 }
    );
  }
}
