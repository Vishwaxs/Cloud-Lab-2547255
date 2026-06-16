import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/api";
import { connectDB } from "@/lib/db/mongodb";
import { Event } from "@/models/Event";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { eventCreateSchema } from "@/lib/validation/events";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { requireCsrf } from "@/lib/security/csrf";
import { ActivityLog } from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_events_list", 120, 60);
    const rl = await consumeRateLimit(limiter, ip, 1);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await connectDB();
    const events = await Event.find({}).sort({ eventDate: -1 }).limit(50).lean();
    
    return NextResponse.json({ events });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
    if (!auth.ok) return auth.response;

    const ip = getClientIp(req);
    const limiter = getMongoRateLimiter("admin_events_create", 20, 60);
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
    const parsed = eventCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const status = parsed.data.status;
    const publishedAt = status === "published" ? new Date() : undefined;

    const event = await Event.create({
      title: sanitizePlainText(parsed.data.title),
      titleHi: parsed.data.titleHi ? sanitizePlainText(parsed.data.titleHi) : undefined,
      slug: sanitizePlainText(parsed.data.slug).toLowerCase(),
      description: sanitizePlainText(parsed.data.description),
      descriptionHi: parsed.data.descriptionHi ? sanitizePlainText(parsed.data.descriptionHi) : undefined,
      eventDate: parsed.data.eventDate,
      eventTime: parsed.data.eventTime ? sanitizePlainText(parsed.data.eventTime) : undefined,
      location: sanitizePlainText(parsed.data.location),
      locationHi: parsed.data.locationHi ? sanitizePlainText(parsed.data.locationHi) : undefined,
      imageUrl: parsed.data.imageUrl ? sanitizePlainText(parsed.data.imageUrl) : undefined,
      status,
      publishedAt,
      createdByAdminId: auth.session.sub,
    });

    try {
      await ActivityLog.create({
        adminId: auth.session.sub,
        adminEmail: auth.session.email,
        action: "event_create",
        details: `Created event ${String(event._id)}`,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create event" },
      { status: 500 }
    );
  }
}
