import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";

import { connectDb } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth/api";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";
import { documentUpdateSchema } from "@/lib/validation/documents";
import { Document } from "@/models/Document";
import { ActivityLog } from "@/models/ActivityLog";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().min(1) });

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_documents_get", 240, 60);
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
  const item = await Document.findById(parsedParams.data.id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_documents_update", 60, 60);
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
  const parsed = documentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectDb();
  const existing = await Document.findById(parsedParams.data.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const $set: Record<string, unknown> = { updatedByAdminId: auth.session.sub };
  const $unset: Record<string, 1> = {};

  if (typeof parsed.data.title === "string") $set.title = sanitizePlainText(parsed.data.title);
  if (typeof parsed.data.titleHi === "string") $set.titleHi = sanitizePlainText(parsed.data.titleHi);
  if (typeof parsed.data.description === "string") $set.description = sanitizePlainText(parsed.data.description);
  if (typeof parsed.data.descriptionHi === "string") $set.descriptionHi = sanitizePlainText(parsed.data.descriptionHi);
  if (typeof parsed.data.category === "string") $set.category = sanitizePlainText(parsed.data.category);
  if (typeof parsed.data.fileUrl === "string") $set.fileUrl = parsed.data.fileUrl.trim();
  if (typeof parsed.data.fileType === "string") $set.fileType = sanitizePlainText(parsed.data.fileType);
  if (typeof parsed.data.order === "number") $set.order = parsed.data.order;

  if (typeof parsed.data.status === "string") {
    $set.status = parsed.data.status;
    if (parsed.data.status === "published" && !existing.publishedAt) {
      $set.publishedAt = new Date();
    }
    if (parsed.data.status === "draft") {
      $unset.publishedAt = 1;
    }
  }

  await Document.updateOne(
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
      action: "document_update",
      details: `Updated document ${parsedParams.data.id}`,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  const refreshed = await Document.findById(existing._id)
    .select({ _id: 1, title: 1, status: 1, order: 1, updatedAt: 1 })
    .lean();

  return NextResponse.json({ item: refreshed });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession(["superadmin", "admin"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_documents_delete", 30, 60);
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
  const res = await Document.deleteOne({ _id: parsedParams.data.id });
  if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await ActivityLog.create({
      adminId: auth.session.sub,
      adminEmail: auth.session.email,
      action: "document_delete",
      details: `Deleted document ${parsedParams.data.id}`,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ ok: true });
}
