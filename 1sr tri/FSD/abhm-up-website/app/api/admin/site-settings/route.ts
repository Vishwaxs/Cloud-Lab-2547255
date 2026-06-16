import { NextResponse, type NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth/api";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { requireCsrf } from "@/lib/security/csrf";
import { siteSettingsUpdateSchema } from "@/lib/validation/siteSettings";
import { SiteSettings, type SiteSettingsDoc } from "@/models/SiteSettings";
import { ActivityLog } from "@/models/ActivityLog";

export const runtime = "nodejs";

function sanitizeOptionalText(value: string | undefined) {
  if (typeof value !== "string") return undefined;
  const v = sanitizePlainText(value);
  return v.length ? v : undefined;
}

function sanitizeOptionalUrl(value: string | undefined) {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length ? v : undefined;
}

function sanitizeUpdate(input: unknown) {
  const parsed = siteSettingsUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error };

  const updates: Partial<SiteSettingsDoc> = {};

  if (parsed.data.hero) {
    updates.hero = {
      title: sanitizePlainText(parsed.data.hero.title),
      titleHi: sanitizeOptionalText(parsed.data.hero.titleHi),
      subtitle: sanitizeOptionalText(parsed.data.hero.subtitle),
      subtitleHi: sanitizeOptionalText(parsed.data.hero.subtitleHi),
      description: sanitizeOptionalText(parsed.data.hero.description),
      descriptionHi: sanitizeOptionalText(parsed.data.hero.descriptionHi),
      primaryCtaLabel: sanitizeOptionalText(parsed.data.hero.primaryCtaLabel),
      primaryCtaHref: sanitizeOptionalUrl(parsed.data.hero.primaryCtaHref === "" ? undefined : parsed.data.hero.primaryCtaHref),
      secondaryCtaLabel: sanitizeOptionalText(parsed.data.hero.secondaryCtaLabel),
      secondaryCtaHref: sanitizeOptionalUrl(parsed.data.hero.secondaryCtaHref === "" ? undefined : parsed.data.hero.secondaryCtaHref),
      imageUrl: sanitizeOptionalUrl(parsed.data.hero.imageUrl === "" ? undefined : parsed.data.hero.imageUrl),
    };
  }

  if (parsed.data.contact) {
    updates.contact = {
      email: sanitizeOptionalText(parsed.data.contact.email),
      phone: sanitizeOptionalText(parsed.data.contact.phone),
      address: sanitizeOptionalText(parsed.data.contact.address),
      addressHi: sanitizeOptionalText(parsed.data.contact.addressHi),
    };
  }

  if (parsed.data.socialLinks) {
    updates.socialLinks = parsed.data.socialLinks.map((l) => ({
      label: sanitizePlainText(l.label),
      url: l.url.trim(),
    }));
  }

  return { ok: true as const, updates };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_site_settings_get", 240, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  await connectDb();
  const doc = await SiteSettings.findOne({ key: "default" }).lean();
  return NextResponse.json({ settings: doc ? { ...doc, _id: String(doc._id) } : null });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApiSession(["superadmin", "admin", "editor"]);
  if (!auth.ok) return auth.response;

  const ip = getClientIp(request);
  const limiter = getMongoRateLimiter("admin_site_settings_update", 30, 60);
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
  const sanitized = sanitizeUpdate(body);
  if (!sanitized.ok) {
    return NextResponse.json(
      { error: "Validation failed", issues: sanitized.error.issues },
      { status: 400 }
    );
  }

  await connectDb();

  const doc = await SiteSettings.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        ...sanitized.updates,
        updatedByAdminId: auth.session.sub,
      },
      $setOnInsert: {
        key: "default",
        createdByAdminId: auth.session.sub,
      },
    },
    { upsert: true, new: true }
  ).lean();

  try {
    await ActivityLog.create({
      adminId: auth.session.sub,
      adminEmail: auth.session.email,
      action: "site_settings_update",
      details: "Updated site settings",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ settings: doc ? { ...doc, _id: String(doc._id) } : null });
}
