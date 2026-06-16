import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth/api";
import { sanitizePlainText, sanitizeRichText } from "@/lib/security/sanitize";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";
import { newsCreateSchema } from "@/lib/validation/news";
import { NewsPost } from "@/models/NewsPost";
import { ensureUniqueSlug, generateBaseSlug } from "@/lib/news/slug";
import { ActivityLog } from "@/models/ActivityLog";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_news_list", 240, 60);
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

  const items = await NewsPost.find({})
    .sort({ createdAt: -1 })
    .limit(parsed.data.limit)
    .select({ title: 1, slug: 1, status: 1, publishedAt: 1, updatedAt: 1, createdAt: 1 })
    .lean();

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_news_create", 20, 60);
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
  const parsed = newsCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const title = sanitizePlainText(parsed.data.title);
  const excerpt = parsed.data.excerpt ? sanitizePlainText(parsed.data.excerpt) : undefined;
  const contentHtml = sanitizeRichText(parsed.data.contentHtml);
  const status = parsed.data.status;

  const desiredSlug = sanitizePlainText(parsed.data.slug ?? generateBaseSlug(title)).toLowerCase();
  await connectDb();
  const slug = await ensureUniqueSlug(desiredSlug);

  const publishedAt = status === "published" ? new Date() : undefined;

  const doc = await NewsPost.create({
    title,
    slug,
    excerpt,
    contentHtml,
    status,
    publishedAt,
    createdByAdminId: auth.session.sub,
    updatedByAdminId: auth.session.sub,
  });

  try {
    await ActivityLog.create({
      adminId: auth.session.sub,
      adminEmail: auth.session.email,
      action: "news_create",
      details: `Created news ${String(doc._id)}`,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ id: String(doc._id), slug: doc.slug }, { status: 201 });
}
