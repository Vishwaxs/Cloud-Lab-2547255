import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";

import { connectDb } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth/api";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";
import { announcementCreateSchema } from "@/lib/validation/announcements";
import { Announcement } from "@/models/Announcement";
import { ActivityLog } from "@/models/ActivityLog";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

function parseOptionalDate(value: string | undefined) {
  if (typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_announcements_list", 240, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const url = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  await connectDb();

  const items = await Announcement.find({})
    .sort({ updatedAt: -1 })
    .limit(parsed.data.limit)
    .select({ title: 1, href: 1, status: 1, publishedAt: 1, startAt: 1, endAt: 1, updatedAt: 1, createdAt: 1 })
    .lean();

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_announcements_create", 20, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const csrf = requireCsrf(request);
  if (csrf) return csrf;

  const body = await request.json().catch(() => null);
  const parsed = announcementCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDb();

  const status = parsed.data.status;
  const publishedAt = status === "published" ? new Date() : undefined;

  const doc = await Announcement.create({
    title: sanitizePlainText(parsed.data.title),
    titleHi: parsed.data.titleHi ? sanitizePlainText(parsed.data.titleHi) : undefined,
    href: parsed.data.href.trim(),
    publishDate: parseOptionalDate(parsed.data.publishDate),
    eventTime: parsed.data.eventTime ? sanitizePlainText(parsed.data.eventTime) : undefined,
    location: parsed.data.location ? sanitizePlainText(parsed.data.location) : undefined,
    locationHi: parsed.data.locationHi ? sanitizePlainText(parsed.data.locationHi) : undefined,
    status,
    publishedAt,
    startAt: parseOptionalDate(parsed.data.startAt),
    endAt: parseOptionalDate(parsed.data.endAt),
    createdByAdminId: auth.session.sub,
    updatedByAdminId: auth.session.sub,
  });

  try {
    await ActivityLog.create({
      adminId: auth.session.sub,
      adminEmail: auth.session.email,
      action: "announcement_create",
      details: `Created announcement ${String(doc._id)}`,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
