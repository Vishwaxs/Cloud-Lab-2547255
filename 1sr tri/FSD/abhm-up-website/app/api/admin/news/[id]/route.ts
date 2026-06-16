import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth/api";
import { sanitizePlainText, sanitizeRichText } from "@/lib/security/sanitize";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";
import { newsUpdateSchema } from "@/lib/validation/news";
import { NewsPost } from "@/models/NewsPost";
import { ensureUniqueSlug, generateBaseSlug } from "@/lib/news/slug";
import { ActivityLog } from "@/models/ActivityLog";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().min(1) });

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_news_get", 240, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const params = await ctx.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDb();
  const item = await NewsPost.findById(parsedParams.data.id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_news_update", 60, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const csrf = requireCsrf(request);
  if (csrf) return csrf;

  const params = await ctx.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = newsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDb();
  const existing = await NewsPost.findById(parsedParams.data.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const $set: Record<string, unknown> = { updatedByAdminId: auth.session.sub };
  const $unset: Record<string, 1> = {};

  if (typeof parsed.data.title === "string") $set.title = sanitizePlainText(parsed.data.title);
  if (typeof parsed.data.excerpt === "string") $set.excerpt = sanitizePlainText(parsed.data.excerpt);
  if (typeof parsed.data.contentHtml === "string") $set.contentHtml = sanitizeRichText(parsed.data.contentHtml);

  if (typeof parsed.data.slug === "string") {
    const desired = sanitizePlainText(parsed.data.slug || generateBaseSlug(existing.title)).toLowerCase();
    $set.slug = await ensureUniqueSlug(desired, String(existing._id));
  }

  if (typeof parsed.data.status === "string") {
    $set.status = parsed.data.status;
    if (parsed.data.status === "published" && !existing.publishedAt) {
      $set.publishedAt = new Date();
    }
    if (parsed.data.status === "draft") {
      $unset.publishedAt = 1;
    }
  }

  await NewsPost.updateOne(
    { _id: existing._id },
    {
      $set,
      ...(Object.keys($unset).length ? { $unset } : null),
    }
  );

  try {
    await ActivityLog.create({
      adminId: auth.session.sub,
      adminEmail: auth.session.email,
      action: "news_update",
      details: `Updated news ${parsedParams.data.id}`,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  const refreshed = await NewsPost.findById(existing._id)
    .select({ _id: 1, slug: 1, status: 1, updatedAt: 1 })
    .lean();

  return NextResponse.json({ item: refreshed });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession(["superadmin", "admin"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_news_delete", 30, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const csrf = requireCsrf(request);
  if (csrf) return csrf;

  const params = await ctx.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDb();
  const res = await NewsPost.deleteOne({ _id: parsedParams.data.id });
  if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await ActivityLog.create({
      adminId: auth.session.sub,
      adminEmail: auth.session.email,
      action: "news_delete",
      details: `Deleted news ${parsedParams.data.id}`,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ ok: true });
}
