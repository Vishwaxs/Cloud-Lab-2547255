import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";

import { connectDb } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth/api";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";
import { documentCreateSchema } from "@/lib/validation/documents";
import { Document } from "@/models/Document";
import { ActivityLog } from "@/models/ActivityLog";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_documents_list", 240, 60);
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

  const items = await Document.find({})
    .sort({ order: 1, updatedAt: -1 })
    .limit(parsed.data.limit)
    .select({ title: 1, category: 1, status: 1, order: 1, fileUrl: 1, updatedAt: 1, createdAt: 1, publishedAt: 1 })
    .lean();

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_documents_create", 20, 60);
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
  const parsed = documentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const status = parsed.data.status;
  const publishedAt = status === "published" ? new Date() : undefined;

  await connectDb();

  const doc = await Document.create({
    title: sanitizePlainText(parsed.data.title),
    titleHi: parsed.data.titleHi ? sanitizePlainText(parsed.data.titleHi) : undefined,
    description: parsed.data.description ? sanitizePlainText(parsed.data.description) : undefined,
    descriptionHi: parsed.data.descriptionHi ? sanitizePlainText(parsed.data.descriptionHi) : undefined,
    category: parsed.data.category ? sanitizePlainText(parsed.data.category) : undefined,
    fileUrl: parsed.data.fileUrl.trim(),
    fileType: parsed.data.fileType ? sanitizePlainText(parsed.data.fileType) : undefined,
    order: parsed.data.order,
    status,
    publishedAt,
    createdByAdminId: auth.session.sub,
    updatedByAdminId: auth.session.sub,
  });

  try {
    await ActivityLog.create({
      adminId: auth.session.sub,
      adminEmail: auth.session.email,
      action: "document_create",
      details: `Created document ${String(doc._id)}`,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ id: String(doc._id) }, { status: 201 });
}
