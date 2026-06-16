import { NextResponse, type NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { isMongoConfigured } from "@/lib/env";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { consumeRateLimit, getMongoRateLimiter } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/request";
import { contactSchema } from "@/lib/validation/contact";
import { ContactMessage } from "@/models/ContactMessage";

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "Service is not configured. Please try again later." },
      { status: 503 }
    );
  }

  const ip = getClientIp(req);
  const limiter = getMongoRateLimiter("contact", 6, 60);
  const rl = await consumeRateLimit(limiter, ip, 1);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const clean = {
    name: sanitizePlainText(parsed.data.name),
    mobile: sanitizePlainText(parsed.data.mobile),
    district: parsed.data.district ? sanitizePlainText(parsed.data.district) : undefined,
    message: sanitizePlainText(parsed.data.message),
  };

  await connectDb();
  await ContactMessage.create(clean);

  return NextResponse.json({ ok: true });
}
