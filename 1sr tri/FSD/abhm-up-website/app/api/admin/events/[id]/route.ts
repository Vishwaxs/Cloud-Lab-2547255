import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/mongodb";
import { Event } from "@/models/Event";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { eventUpdateSchema } from "@/lib/validation/events";
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
    const limiter = getMongoRateLimiter("admin_events_get", 240, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    const event = await Event.findById(id).lean();
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch event" },
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
    const limiter = getMongoRateLimiter("admin_events_update", 60, 60);
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
    const parsed = eventUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const $set: Record<string, unknown> = { updatedByAdminId: auth.session.sub };
    const $unset: Record<string, unknown> = {};
    if (typeof parsed.data.title === "string") $set.title = sanitizePlainText(parsed.data.title);
    if (typeof parsed.data.titleHi === "string") $set.titleHi = sanitizePlainText(parsed.data.titleHi);
    if (typeof parsed.data.slug === "string") $set.slug = sanitizePlainText(parsed.data.slug).toLowerCase();
    if (typeof parsed.data.description === "string") $set.description = sanitizePlainText(parsed.data.description);
    if (typeof parsed.data.descriptionHi === "string") $set.descriptionHi = sanitizePlainText(parsed.data.descriptionHi);
    if (parsed.data.eventDate instanceof Date) $set.eventDate = parsed.data.eventDate;
    if (typeof parsed.data.eventTime === "string") $set.eventTime = sanitizePlainText(parsed.data.eventTime);
    if (typeof parsed.data.location === "string") $set.location = sanitizePlainText(parsed.data.location);
    if (typeof parsed.data.locationHi === "string") $set.locationHi = sanitizePlainText(parsed.data.locationHi);
    if (typeof parsed.data.imageUrl === "string") $set.imageUrl = sanitizePlainText(parsed.data.imageUrl);
    if (typeof parsed.data.status === "string") {
      $set.status = parsed.data.status;
      if (parsed.data.status === "published") {
        $set.publishedAt = new Date();
      } else {
        $unset.publishedAt = 1;
      }
    }

    const update: Record<string, unknown> = { $set };
    if (Object.keys($unset).length > 0) update.$unset = $unset;

    const event = await Event.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    try {
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: "event_update",
        details: `Updated event ${id}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ event });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update event" },
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
    const limiter = getMongoRateLimiter("admin_events_delete", 30, 60);
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
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    try {
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: "event_delete",
        details: `Deleted event ${id}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete event" },
      { status: 500 }
    );
  }
}
